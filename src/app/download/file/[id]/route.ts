import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveUploadPath } from "@/lib/uploads-dir";

async function readFileBytes(filePath: string): Promise<Buffer | null> {
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    const res = await fetch(filePath);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  }

  const absolutePath = resolveUploadPath(filePath.split("/"));
  if (!absolutePath || !existsSync(absolutePath)) return null;
  return readFile(absolutePath);
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await prisma.download.findUnique({ where: { id: Number(id) } });
  if (!doc) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const bytes = await readFileBytes(doc.file_path);
  if (!bytes) return NextResponse.json({ message: "Not found" }, { status: 404 });

  await prisma.download.update({ where: { id: doc.id }, data: { download_count: { increment: 1 } } });

  const extension = doc.file_type || path.extname(doc.file_path).replace(".", "");

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(`${doc.title}.${extension}`)}"`,
    },
  });
}
