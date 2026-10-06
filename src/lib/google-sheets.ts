/**
 * Talking to Google Sheets from the couple's browser.
 *
 * Browser-only on purpose. The token is the couple's own, scoped to
 * `drive.file` -- the files they picked or Wren created, nothing else -- and
 * it never reaches our server, so there is no stored Google credential to
 * leak. It also keeps the network and CPU of a 300-row read off the Worker,
 * which gets 10ms of CPU per request.
 *
 * Needs the Google Sheets API enabled in the same Cloud project as the Drive
 * picker (NEXT_PUBLIC_GOOGLE_CLIENT_ID).
 */

export const GOOGLE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const GIS_SRC = "https://accounts.google.com/gsi/client";
const TOKEN_KEY = "ydid-google-token";

type TokenResponse = { access_token?: string; expires_in?: number | string; error?: string };
type TokenClient = { requestAccessToken: () => void };
type GoogleAccounts = {
  oauth2: {
    initTokenClient: (config: {
      client_id: string;
      scope: string;
      callback: (response: TokenResponse) => void;
    }) => TokenClient;
  };
};

export function googleClientId() {
  // Trimmed: pasted by hand into a dashboard, where a trailing newline makes
  // Google answer "invalid_client" for a client that exists.
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || null;
}

export function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.getAttribute("data-loaded") === "true") return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error(src)));
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.setAttribute("data-loaded", "true");
      resolve();
    };
    script.onerror = () => reject(new Error(src));
    document.head.appendChild(script);
  });
}

export function loadGoogleIdentity() {
  return loadScript(GIS_SRC);
}

let memoryToken: { token: string; expiresAt: number } | null = null;

/**
 * A token from earlier in this tab's session, if it has a few minutes left.
 *
 * Kept in sessionStorage so moving from Guests to Budget doesn't ask again;
 * gone when the tab closes. Storage can throw (private mode, blocked site
 * data), in which case it's just the in-memory copy.
 */
export function cachedToken(): string | null {
  const now = Date.now();
  if (memoryToken && memoryToken.expiresAt - now > 120_000) return memoryToken.token;
  try {
    const raw = sessionStorage.getItem(TOKEN_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as { token: string; expiresAt: number };
      if (saved.expiresAt - now > 120_000) {
        memoryToken = saved;
        return saved.token;
      }
    }
  } catch {
    // Unavailable storage just means asking Google again.
  }
  return null;
}

export function rememberToken(token: string, expiresIn: number | string | undefined) {
  const seconds = Number(expiresIn) || 3600;
  memoryToken = { token, expiresAt: Date.now() + seconds * 1000 };
  try {
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify(memoryToken));
  } catch {
    // See cachedToken.
  }
}

export function forgetToken() {
  memoryToken = null;
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // See cachedToken.
  }
}

let tokenClient: TokenClient | null = null;
let pending: { resolve: (token: string) => void; reject: (error: Error) => void } | null = null;

/**
 * A token, asking Google only if there isn't one already.
 *
 * Must be called straight from a click, with nothing awaited first: asking
 * opens a popup, and Safari blocks a popup that isn't inside the click
 * itself -- silently. So the Identity script has to be loaded ahead of time
 * (loadGoogleIdentity on mount), and this doesn't await anything before
 * requestAccessToken.
 */
export function requestToken(): Promise<string> {
  const cached = cachedToken();
  if (cached) return Promise.resolve(cached);

  const clientId = googleClientId();
  const accounts = (window as unknown as { google?: { accounts?: GoogleAccounts } }).google
    ?.accounts;
  if (!clientId || !accounts) {
    return Promise.reject(new Error("Couldn't reach Google — please reload the page."));
  }

  return new Promise<string>((resolve, reject) => {
    pending = { resolve, reject };
    if (!tokenClient) {
      tokenClient = accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: GOOGLE_SCOPE,
        callback: (response) => {
          const waiting = pending;
          pending = null;
          if (!response.access_token) {
            waiting?.reject(
              new Error(
                "Google didn't grant access. If no Google window appeared, allow pop-ups for this site and try again.",
              ),
            );
            return;
          }
          rememberToken(response.access_token, response.expires_in);
          waiting?.resolve(response.access_token);
        },
      });
    }
    tokenClient.requestAccessToken();
  });
}

export class GoogleError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function google<T>(token: string, url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    // An expired or revoked token: drop it so the next click asks again
    // rather than failing the same way forever.
    if (response.status === 401) forgetToken();
    let detail = "";
    try {
      detail = ((await response.json()) as { error?: { message?: string } }).error?.message ?? "";
    } catch {
      // No body worth reading.
    }
    throw new GoogleError(explain(response.status, detail), response.status);
  }
  return (await response.json()) as T;
}

function explain(status: number, detail: string) {
  if (status === 401) return "Your Google sign-in expired. Click sync again to reconnect.";
  if (status === 403 && /has not been used|disabled/i.test(detail)) {
    return "Google Sheets isn't switched on for this site yet. (Owner: enable the Google Sheets API in the Cloud project.)";
  }
  if (status === 403 || status === 404) {
    return "Google didn't grant access to that sheet. Link it again with “Choose a sheet” so Google lets You Do, I Do open it.";
  }
  return detail ? `Google said: ${detail}` : "Couldn't reach Google Sheets — please try again.";
}

const SHEETS = "https://sheets.googleapis.com/v4/spreadsheets";

export type SheetTab = { sheetId: number; title: string; rowCount: number; columnCount: number };
export type SpreadsheetMeta = { title: string; url: string; tabs: SheetTab[] };

export async function spreadsheetMeta(token: string, fileId: string): Promise<SpreadsheetMeta> {
  const data = await google<{
    properties: { title: string };
    spreadsheetUrl: string;
    sheets: {
      properties: {
        sheetId: number;
        title: string;
        gridProperties?: { rowCount?: number; columnCount?: number };
      };
    }[];
  }>(
    token,
    `${SHEETS}/${encodeURIComponent(fileId)}?fields=properties.title,spreadsheetUrl,sheets.properties(sheetId,title,gridProperties)`,
  );
  return {
    title: data.properties.title,
    url: data.spreadsheetUrl,
    tabs: data.sheets.map(({ properties }) => ({
      sheetId: properties.sheetId,
      title: properties.title,
      rowCount: properties.gridProperties?.rowCount ?? 1000,
      columnCount: properties.gridProperties?.columnCount ?? 26,
    })),
  };
}

function a1Tab(title: string) {
  return `'${title.replace(/'/g, "''")}'`;
}

function columnLetters(index: number) {
  let n = index + 1;
  let letters = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}

/** The tab as the couple sees it: formatted text, the way they typed it. */
export async function readTab(token: string, fileId: string, tab: SheetTab): Promise<string[][]> {
  const data = await google<{ values?: unknown[][] }>(
    token,
    `${SHEETS}/${encodeURIComponent(fileId)}/values/${encodeURIComponent(a1Tab(tab.title))}?valueRenderOption=FORMATTED_VALUE&majorDimension=ROWS`,
  );
  return (data.values ?? []).map((row) => row.map((cell) => (cell == null ? "" : String(cell))));
}

/**
 * Writes cells, then removes rows.
 *
 * Cells are sent as runs of neighbours in a row, RAW, so a ZIP of 02134 stays
 * 02134 and a phone number starting "+" isn't read as a formula. Amounts go
 * as numbers so a budget column still sums. The grid is grown first where a
 * new column or row would fall outside it -- Sheets refuses a write past the
 * edge rather than extending the tab.
 */
export async function writeTab(
  token: string,
  fileId: string,
  tab: SheetTab,
  cells: { row: number; column: number; value: string | number }[],
  deleteRows: number[],
) {
  const id = encodeURIComponent(fileId);

  const needRows = Math.max(0, ...cells.map((cell) => cell.row + 1));
  const needColumns = Math.max(0, ...cells.map((cell) => cell.column + 1));
  const grow = [];
  if (needRows > tab.rowCount) {
    grow.push({
      appendDimension: { sheetId: tab.sheetId, dimension: "ROWS", length: needRows - tab.rowCount },
    });
  }
  if (needColumns > tab.columnCount) {
    grow.push({
      appendDimension: {
        sheetId: tab.sheetId,
        dimension: "COLUMNS",
        length: needColumns - tab.columnCount,
      },
    });
  }
  if (grow.length > 0) {
    await google(token, `${SHEETS}/${id}:batchUpdate`, {
      method: "POST",
      body: JSON.stringify({ requests: grow }),
    });
  }

  if (cells.length > 0) {
    const byRow = new Map<number, Map<number, string | number>>();
    for (const cell of cells) {
      const row = byRow.get(cell.row) ?? new Map();
      row.set(cell.column, cell.value);
      byRow.set(cell.row, row);
    }
    const data: { range: string; values: (string | number)[][] }[] = [];
    for (const [row, columns] of byRow) {
      const sorted = [...columns.keys()].sort((a, b) => a - b);
      let start = 0;
      while (start < sorted.length) {
        let end = start;
        while (end + 1 < sorted.length && sorted[end + 1] === sorted[end] + 1) end++;
        const run = sorted.slice(start, end + 1);
        data.push({
          range: `${a1Tab(tab.title)}!${columnLetters(run[0])}${row + 1}`,
          values: [run.map((column) => columns.get(column)!)],
        });
        start = end + 1;
      }
    }
    await google(token, `${SHEETS}/${id}/values:batchUpdate`, {
      method: "POST",
      body: JSON.stringify({ valueInputOption: "RAW", data }),
    });
  }

  if (deleteRows.length > 0) {
    await google(token, `${SHEETS}/${id}:batchUpdate`, {
      method: "POST",
      body: JSON.stringify({
        // Bottom up, so each removal leaves the rows above it where they were.
        requests: [...deleteRows]
          .sort((a, b) => b - a)
          .map((row) => ({
            deleteDimension: {
              range: { sheetId: tab.sheetId, dimension: "ROWS", startIndex: row, endIndex: row + 1 },
            },
          })),
      }),
    });
  }
}

/** A new spreadsheet in the couple's Drive, with one named tab. */
export async function createSpreadsheet(token: string, title: string, tabTitle: string) {
  const data = await google<{
    spreadsheetId: string;
    spreadsheetUrl: string;
    sheets: { properties: { sheetId: number } }[];
  }>(token, SHEETS, {
    method: "POST",
    body: JSON.stringify({
      properties: { title },
      sheets: [{ properties: { title: tabTitle, gridProperties: { frozenRowCount: 1 } } }],
    }),
  });
  return {
    fileId: data.spreadsheetId,
    url: data.spreadsheetUrl,
    gid: String(data.sheets[0]?.properties.sheetId ?? 0),
    title,
  };
}

/** A new tab in a spreadsheet the couple already has. */
export async function addTab(token: string, fileId: string, title: string) {
  const data = await google<{ replies: { addSheet: { properties: { sheetId: number } } }[] }>(
    token,
    `${SHEETS}/${encodeURIComponent(fileId)}:batchUpdate`,
    {
      method: "POST",
      body: JSON.stringify({
        requests: [{ addSheet: { properties: { title, gridProperties: { frozenRowCount: 1 } } } }],
      }),
    },
  );
  return String(data.replies[0]?.addSheet.properties.sheetId ?? 0);
}

/** When the file last changed, by anyone -- for "edited since your last sync". */
export async function fileModifiedTime(token: string, fileId: string): Promise<string | null> {
  const data = await google<{ modifiedTime?: string }>(
    token,
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=modifiedTime`,
  );
  return data.modifiedTime ?? null;
}
