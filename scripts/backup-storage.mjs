// Downloads every file in the app's Supabase Storage buckets into ./out/storage,
// mirroring bucket/path. Run by .github/workflows/backup.yml; needs
// NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

// Listing returns folders as entries with no id, so walk them recursively.
async function walk(bucket, prefix) {
  const files = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix, { limit: 1000, offset });
    if (error) throw error;
    for (const entry of data) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id) files.push(path);
      else files.push(...(await walk(bucket, path)));
    }
    if (data.length < 1000) return files;
  }
}

const { data: buckets, error } = await supabase.storage.listBuckets();
if (error) throw error;

let total = 0;
for (const { name: bucket } of buckets) {
  for (const path of await walk(bucket, "")) {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error) throw new Error(`${bucket}/${path}: ${error.message}`);
    const dest = join("out", "storage", bucket, path);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, Buffer.from(await data.arrayBuffer()));
    total++;
  }
}
console.log(`Downloaded ${total} files from ${buckets.length} buckets.`);
