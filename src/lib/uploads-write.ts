import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";
import { resolveUploadPath } from "@/lib/uploads-dir";

/** Saves an uploaded File to Vercel Blob under {folder}/ with a random
 * filename (collision-proof, unlike the original filename) and returns the
 * full public URL — stored directly in the DB (see lib/upload.ts's
 * uploadUrl(), which also understands the pre-Blob relative-path rows still
 * seeded from the Laravel app for local dev).
 *
 * Without BLOB_READ_WRITE_TOKEN configured (no Vercel Blob store linked —
 * the normal case for local dev), falls back to writing into UPLOADS_DIR,
 * the same shared folder the Laravel app's own uploads already live in, and
 * returns a relative path in Laravel's own convention ("equipment/xxx.jpg"),
 * which uploadUrl() and the /uploads route handler already know how to
 * serve. */
export async function saveUpload(file: File, folder: string): Promise<string> {
  const ext = path.extname(file.name).toLowerCase();
  const filename = `${Date.now()}_${randomBytes(8).toString("hex")}${ext}`;

  // On Vercel there's no writable filesystem outside /tmp — if the Blob
  // token is ever missing there, fail clearly instead of attempting (and
  // silently corrupting) a local-fallback write that can't actually persist.
  if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Cannot save upload: BLOB_READ_WRITE_TOKEN is not set in this Vercel environment");
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${folder}/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return blob.url;
  }

  const absolutePath = resolveUploadPath([folder, filename]);
  if (!absolutePath) {
    throw new Error(
      "Cannot save upload: set BLOB_READ_WRITE_TOKEN (Vercel Blob) or UPLOADS_DIR (local fallback) in .env"
    );
  }
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, Buffer.from(await file.arrayBuffer()));
  return `${folder}/${filename}`;
}

/** Deletes a previously-saved upload by its stored URL/path.
 *
 * A full https:// URL is a Blob upload — delete it from Blob storage,
 * ignoring a missing blob (matching Storage::delete()'s no-op-if-absent
 * behavior in the original app).
 *
 * A relative path is either legacy data seeded by the Laravel app (must
 * never be touched — Blob mode means every upload this app made itself is
 * a full URL, so any relative path we see is someone else's file) or,
 * in local-fallback mode (no BLOB_READ_WRITE_TOKEN), one of our own
 * locally-saved files — safe to delete in that mode, since local dev
 * already shares the uploads folder with Laravel by design. */
export async function deleteUpload(pathOrUrl: string | null | undefined): Promise<void> {
  if (!pathOrUrl) return;

  if (pathOrUrl.startsWith("http")) {
    await del(pathOrUrl).catch(() => {});
    return;
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) return;

  const absolutePath = resolveUploadPath(pathOrUrl.split("/"));
  if (!absolutePath) return;
  await unlink(absolutePath).catch(() => {});
}
