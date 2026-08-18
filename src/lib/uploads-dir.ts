import path from "node:path";

/** Resolves a relative upload path (e.g. "news/foo.jpg") to an absolute path
 * under UPLOADS_DIR, rejecting anything that escapes it (path traversal). */
export function resolveUploadPath(segments: string[]): string | null {
  // UPLOADS_DIR is an external, environment-configured path (a persistent
  // volume in production) — it must never be traced/bundled into the build.
  const configuredDir = process.env.UPLOADS_DIR;
  // Fail closed: an empty string would resolve to process.cwd() below, which
  // would turn this into a path-traversal-free but still very real "serve my
  // own source tree and .env" bug if the env var is ever left unset.
  if (!configuredDir) return null;

  const uploadsDir = path.resolve(/* turbopackIgnore: true */ configuredDir);
  const resolved = path.resolve(/* turbopackIgnore: true */ uploadsDir, ...segments);
  if (resolved !== uploadsDir && !resolved.startsWith(uploadsDir + path.sep)) return null;
  return resolved;
}
