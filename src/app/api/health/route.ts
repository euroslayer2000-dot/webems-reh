import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Railway healthcheck target — confirms the app is up and can reach the DB. */
export async function GET() {
  await prisma.$queryRaw`SELECT 1`;
  return NextResponse.json({ ok: true });
}
