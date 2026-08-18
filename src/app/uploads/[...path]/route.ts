import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { resolveUploadPath } from "@/lib/uploads-dir";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const absolutePath = resolveUploadPath(segments);
  if (!absolutePath || !existsSync(absolutePath)) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const buffer = await readFile(absolutePath);
  const contentType = MIME_TYPES[path.extname(absolutePath).toLowerCase()] ?? "application/octet-stream";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
      // Uploaded SVGs can contain <script> — this stops browsers from
      // executing it if the file is ever opened via direct navigation
      // instead of an <img> (which already can't execute it).
      "X-Content-Type-Options": "nosniff",
    },
  });
}
