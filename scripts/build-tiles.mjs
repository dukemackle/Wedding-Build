// Builds the maps' base-tile file and uploads it to R2 (plan Q5). Run with:
//
//   R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... npm run tiles:build
//   npm run tiles:build -- --skip-upload        build the file only
//   npm run tiles:build -- --skip-extract       upload a us.pmtiles already built
//   npm run tiles:build -- --bucket youdoido-tiles --key us.pmtiles   (the defaults)
//
// Needs the `pmtiles` command (https://github.com/protomaps/go-pmtiles; with
// Go installed: `go install github.com/protomaps/go-pmtiles@latest`, which
// names it go-pmtiles -- either name works). It cuts the 50 states out of
// Protomaps' latest daily planet build with range requests, so only the ~4.6 GB
// it keeps is downloaded, not the ~140 GB planet. Zoom stops at 13 (zoom 14
// doubles the file past R2's free 10 GB); the map draws deeper zooms from 13.
//
// The upload is a multipart S3 upload to R2, then a CORS rule so browsers on
// youdoido.com can make the range requests. Re-run it every few months to
// pick up new roads and places; the map reads the new file straight away.

import { execFileSync } from "node:child_process";
import { existsSync, openSync, readSync, closeSync, statSync, writeFileSync } from "node:fs";
import { AwsClient } from "aws4fetch";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const BUCKET = opt("--bucket", "youdoido-tiles");
const KEY = opt("--key", "us.pmtiles");
const OUT = opt("--out", "us.pmtiles");
const MAX_ZOOM = 13; // keep in step with PMTILES_MAX_ZOOM in src/lib/map-tiles.ts
const PART_SIZE = 100 * 1024 * 1024;
const PARALLEL = 4;
const ORIGINS = ["https://youdoido.com", "https://www.youdoido.com", "http://localhost:3000"];

// Lower 48, Alaska (stopping short of the antimeridian) and Hawaii.
const US_REGION = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "MultiPolygon",
    coordinates: [
      [[[-125, 24.4], [-66.9, 24.4], [-66.9, 49.4], [-125, 49.4], [-125, 24.4]]],
      [[[-179.2, 51.2], [-129.9, 51.2], [-129.9, 71.5], [-179.2, 71.5], [-179.2, 51.2]]],
      [[[-160.3, 18.9], [-154.8, 18.9], [-154.8, 22.3], [-160.3, 22.3], [-160.3, 18.9]]],
    ],
  },
};

function pmtilesCommand() {
  for (const cmd of ["pmtiles", "go-pmtiles"]) {
    try {
      execFileSync(cmd, ["version"], { stdio: "ignore" });
      return cmd;
    } catch {}
  }
  throw new Error("No `pmtiles` command found. See the top of scripts/build-tiles.mjs.");
}

async function latestBuild() {
  const res = await fetch("https://build-metadata.protomaps.dev/builds.json");
  if (!res.ok) throw new Error(`Protomaps builds list: HTTP ${res.status}`);
  const builds = await res.json();
  const latest = builds.map((b) => b.key).filter((k) => /^\d{8}\.pmtiles$/.test(k)).sort().pop();
  if (!latest) throw new Error("Protomaps builds list had no daily builds");
  return `https://build.protomaps.com/${latest}`;
}

async function extract() {
  const cmd = pmtilesCommand();
  const source = await latestBuild();
  const region = `${OUT}.region.geojson`;
  writeFileSync(region, JSON.stringify(US_REGION));
  console.log(`Cutting the 50 states (zoom 0-${MAX_ZOOM}) out of ${source} ...`);
  execFileSync(cmd, ["extract", source, OUT, `--region=${region}`, `--maxzoom=${MAX_ZOOM}`], {
    stdio: "inherit",
  });
}

function r2() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error("Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY to upload.");
  }
  const client = new AwsClient({
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    service: "s3",
    region: "auto",
  });
  const base = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET}`;
  return async (path, init = {}) => {
    const res = await client.fetch(`${base}${path}`, init);
    if (!res.ok) throw new Error(`R2 ${init.method ?? "GET"} ${path}: HTTP ${res.status} ${await res.text()}`);
    return res;
  };
}

async function upload() {
  const call = r2();
  const size = statSync(OUT).size;
  const parts = Math.ceil(size / PART_SIZE);
  const obj = `/${encodeURIComponent(KEY)}`;
  console.log(`Uploading ${(size / 1e9).toFixed(1)} GB to r2://${BUCKET}/${KEY} in ${parts} parts ...`);

  const started = await call(`${obj}?uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/vnd.pmtiles", "Cache-Control": "public, max-age=86400" },
  });
  const uploadId = (await started.text()).match(/<UploadId>([^<]+)<\/UploadId>/)?.[1];
  if (!uploadId) throw new Error("R2 didn't return an UploadId");

  const fd = openSync(OUT, "r");
  const etags = new Array(parts);
  let next = 0;
  try {
    await Promise.all(
      Array.from({ length: PARALLEL }, async () => {
        while (next < parts) {
          const n = next++;
          const length = Math.min(PART_SIZE, size - n * PART_SIZE);
          const body = Buffer.alloc(length);
          readSync(fd, body, 0, length, n * PART_SIZE);
          const res = await call(`${obj}?partNumber=${n + 1}&uploadId=${encodeURIComponent(uploadId)}`, {
            method: "PUT",
            body,
          });
          etags[n] = res.headers.get("etag");
          console.log(`  part ${n + 1}/${parts}`);
        }
      }),
    );
  } catch (err) {
    await call(`${obj}?uploadId=${encodeURIComponent(uploadId)}`, { method: "DELETE" }).catch(() => {});
    throw err;
  } finally {
    closeSync(fd);
  }

  const xml = `<CompleteMultipartUpload>${etags
    .map((etag, i) => `<Part><PartNumber>${i + 1}</PartNumber><ETag>${etag}</ETag></Part>`)
    .join("")}</CompleteMultipartUpload>`;
  await call(`${obj}?uploadId=${encodeURIComponent(uploadId)}`, { method: "POST", body: xml });

  const cors = `<CORSConfiguration><CORSRule>${ORIGINS.map((o) => `<AllowedOrigin>${o}</AllowedOrigin>`).join("")}<AllowedMethod>GET</AllowedMethod><AllowedMethod>HEAD</AllowedMethod><AllowedHeader>range</AllowedHeader><AllowedHeader>if-match</AllowedHeader><ExposeHeader>etag</ExposeHeader><ExposeHeader>content-range</ExposeHeader><MaxAgeSeconds>86400</MaxAgeSeconds></CORSRule></CORSConfiguration>`;
  await call("?cors", { method: "PUT", body: cors, headers: { "Content-Type": "application/xml" } });
  console.log("Done. Uploaded and CORS set.");
}

if (!flag("--skip-extract")) await extract();
else if (!existsSync(OUT)) throw new Error(`${OUT} doesn't exist; drop --skip-extract`);
if (!flag("--skip-upload")) await upload();
