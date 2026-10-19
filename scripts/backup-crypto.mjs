// Backups are encrypted before they leave the machine making them: the data
// file holds every couple's guest list and every auth user, and Storage holds
// signed contracts. AES-256-GCM with BACKUP_ENCRYPTION_KEY (32 random bytes,
// base64). Lose the key and the backups can't be read, so it's kept in two
// places that aren't the backups themselves (docs/legal-audit.md R6).
//
// Make a key:  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
//
// An encrypted file is "YDIB1" + 12-byte IV + 16-byte tag + ciphertext.
// Files without the marker are older, unencrypted backups and read as they are.

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const MAGIC = Buffer.from("YDIB1");

export function backupKey() {
  const raw = process.env.BACKUP_ENCRYPTION_KEY?.trim();
  if (!raw) return null;
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error(`BACKUP_ENCRYPTION_KEY must be 32 bytes, base64 (got ${key.length} bytes).`);
  return key;
}

export function encrypt(key, data) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(data), cipher.final()]);
  return Buffer.concat([MAGIC, iv, cipher.getAuthTag(), body]);
}

export const isEncrypted = (data) => data.length > 33 && data.subarray(0, MAGIC.length).equals(MAGIC);

/** The plain bytes of a backup file, encrypted or not. */
export function readable(key, data) {
  if (!isEncrypted(data)) return data;
  if (!key) throw new Error("This backup is encrypted: set BACKUP_ENCRYPTION_KEY to the key it was made with.");
  const at = MAGIC.length;
  const decipher = createDecipheriv("aes-256-gcm", key, data.subarray(at, at + 12));
  decipher.setAuthTag(data.subarray(at + 12, at + 28));
  return Buffer.concat([decipher.update(data.subarray(at + 28)), decipher.final()]);
}
