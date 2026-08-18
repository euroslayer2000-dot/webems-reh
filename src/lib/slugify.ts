import { randomBytes } from "node:crypto";

/** Thai-safe slug: keeps Thai characters, separates words with '-'. Matches
 * the Laravel app's slugify() helper. */
export function slugify(text: string): string {
  let result = text.trim();
  result = result.replace(/[\s/\\]+/gu, "-");
  result = result.replace(/[^\p{Script=Thai}\p{L}\p{N}-]+/gu, "");
  result = result.replace(/-+/g, "-");
  result = result.replace(/^-+|-+$/g, "");
  result = result.toLowerCase();

  return result !== "" ? result : `item-${randomBytes(4).toString("hex")}`;
}

/** Appends a random numeric suffix, matching the Laravel controllers'
 * `$slug .= '-'.random_int(10, 99)` de-duplication retry. */
export function randomSlugSuffix(): string {
  return String(Math.floor(Math.random() * 90) + 10);
}
