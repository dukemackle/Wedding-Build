"use client";

import { useState } from "react";

/**
 * "Choose from Drive", for anywhere Wren takes a file.
 *
 * Deliberately hands back a plain `File`, so every caller keeps the upload
 * and parsing path it already had -- the picker is a different way to reach a
 * file, not a different kind of file. Nothing new runs on the server: the
 * browser holds the token, fetches the bytes from Google, and passes them on
 * exactly as if they had come from a file input. That also keeps a 15MB
 * download off the Worker, which gets 10ms of CPU per request.
 *
 * Scope is `drive.file`, which is the whole point of using the picker rather
 * than asking for a shared link: Google grants Wren access to the one file
 * the couple picked and nothing else, so a guest list or a signed contract
 * never has to be set to "anyone with the link" to be read. It is also the
 * narrow scope Google treats as low-risk, which keeps the consent screen
 * simple.
 */

const GIS_SRC = "https://accounts.google.com/gsi/client";
const GAPI_SRC = "https://apis.google.com/js/api.js";
const SCOPE = "https://www.googleapis.com/auth/drive.file";

/** Google's own id for a native Sheet, which downloads differently. */
const GOOGLE_SHEET_MIME = "application/vnd.google-apps.spreadsheet";

export type DriveKind = "spreadsheet" | "document";

const MIME_TYPES: Record<DriveKind, string> = {
  spreadsheet: [
    GOOGLE_SHEET_MIME,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ].join(","),
  document: ["application/pdf", "image/jpeg", "image/png", "image/webp"].join(","),
};

type PickedDoc = { id: string; name: string; mimeType: string };

type TokenClient = { requestAccessToken: () => void };

type PickerBuilder = {
  addView: (view: unknown) => PickerBuilder;
  setAppId: (appId: string) => PickerBuilder;
  setOAuthToken: (token: string) => PickerBuilder;
  setDeveloperKey: (key: string) => PickerBuilder;
  setCallback: (cb: (data: { action: string; docs?: PickedDoc[] }) => void) => PickerBuilder;
  build: () => { setVisible: (visible: boolean) => void };
};

type GoogleGlobal = {
  accounts?: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string;
        scope: string;
        callback: (response: { access_token?: string; error?: string }) => void;
      }) => TokenClient;
    };
  };
  picker?: {
    PickerBuilder: new () => PickerBuilder;
    DocsView: new () => { setMimeTypes: (types: string) => unknown };
    Action: { PICKED: string; CANCEL: string };
  };
};

type GapiGlobal = { load: (name: string, cb: () => void) => void };

function loadScript(src: string) {
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

/**
 * Downloads what was picked.
 *
 * A native Google Sheet has no bytes to download -- it only exists inside
 * Google -- so it comes out through the export endpoint as CSV. Anything
 * uploaded to Drive (an .xlsx, a PDF, a photo of a contract) is a real file
 * and comes down as itself.
 */
async function fetchPicked(doc: PickedDoc, token: string): Promise<File> {
  const isNativeSheet = doc.mimeType === GOOGLE_SHEET_MIME;
  const url = isNativeSheet
    ? `https://www.googleapis.com/drive/v3/files/${doc.id}/export?mimeType=text%2Fcsv`
    : `https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`;

  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(String(response.status));

  const blob = await response.blob();
  const name = isNativeSheet ? `${doc.name}.csv` : doc.name;
  const type = isNativeSheet ? "text/csv" : doc.mimeType || blob.type;
  return new File([blob], name, { type });
}

export function DrivePickerButton({
  kind,
  onFile,
  disabled,
  className,
  label = "Choose from Drive",
}: {
  kind: DriveKind;
  onFile: (file: File) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Trimmed because these are pasted into a dashboard field by hand. A
  // trailing space or newline rides along invisibly and Google rejects the
  // whole request with "invalid_client" -- an error that reads like the
  // OAuth client doesn't exist, sending you to check everything except the
  // one character you can't see.
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY?.trim();

  // Nothing to offer without credentials, and a button that always errors is
  // worse than no button.
  if (!clientId || !apiKey) return null;

  async function open() {
    setBusy(true);
    setError(undefined);
    try {
      await Promise.all([loadScript(GIS_SRC), loadScript(GAPI_SRC)]);

      const google = (window as unknown as { google?: GoogleGlobal }).google;
      const gapi = (window as unknown as { gapi?: GapiGlobal }).gapi;
      if (!google?.accounts || !gapi) throw new Error("Google didn't load");

      await new Promise<void>((resolve) => gapi.load("picker", () => resolve()));

      const token = await new Promise<string>((resolve, reject) => {
        const client = google.accounts!.oauth2.initTokenClient({
          client_id: clientId!,
          scope: SCOPE,
          callback: (response) => {
            if (response.access_token) resolve(response.access_token);
            else reject(new Error(response.error ?? "No access granted"));
          },
        });
        client.requestAccessToken();
      });

      const picker = (window as unknown as { google?: GoogleGlobal }).google?.picker;
      if (!picker) throw new Error("Picker didn't load");

      const view = new picker.DocsView();
      view.setMimeTypes(MIME_TYPES[kind]);

      // The project number, which is the client id's first segment.
      //
      // Not optional, though it looks it. `drive.file` grants access to files
      // the user picks *for a particular app*, and the picker can only tell
      // Google which app that is via setAppId. Leave it out and everything
      // looks right -- the picker opens, the files list, the pick succeeds --
      // and then the download 404s, because the token was never granted
      // anything. Derived rather than configured so it cannot drift from the
      // client id it has to match.
      const appId = clientId!.split("-")[0];

      await new Promise<void>((resolve) => {
        new picker.PickerBuilder()
          .addView(view)
          .setAppId(appId)
          .setOAuthToken(token)
          .setDeveloperKey(apiKey!)
          .setCallback((data) => {
            if (data.action === picker.Action.CANCEL) return resolve();
            if (data.action !== picker.Action.PICKED) return;
            const doc = data.docs?.[0];
            if (!doc) return resolve();
            fetchPicked(doc, token)
              .then((file) => {
                onFile(file);
                resolve();
              })
              .catch((cause: Error) => {
                // Says which failure it was. "Please try again" on a 403 sends
                // someone to retry a thing that will never work.
                const status = Number(cause?.message);
                setError(
                  status === 403 || status === 404
                    ? "Google didn't grant access to that file. If this keeps happening, the Drive setup needs a look."
                    : "Couldn't download that file from Drive — please try again.",
                );
                resolve();
              });
          })
          .build()
          .setVisible(true);
      });
    } catch {
      setError("Couldn't open Google Drive — please try again, or upload the file instead.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        disabled={disabled || busy}
        className={
          className ??
          "rounded-md border border-hairline bg-card px-3 py-1.5 text-sm text-ink transition-colors hover:border-forest disabled:opacity-50"
        }
      >
        {busy ? "Opening Drive…" : label}
      </button>
      {error && <p className="mt-1 text-xs text-red-800">{error}</p>}
    </>
  );
}
