/** URL of an uploaded file. New uploads (via lib/uploads-write.ts) are saved
 * to Vercel Blob and store their full https:// URL directly — returned as-is.
 * Rows still carrying a relative path (seeded from the Laravel app's
 * storage/app/public, e.g. "news/foo.jpg") are served through the
 * /uploads/[...path] route handler for local dev against the shared DB. */
export function uploadUrl(value: string | null | undefined, fallback = "/assets/img/placeholder.svg"): string {
  if (!value) return fallback;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `/uploads/${value}`;
}
