import { NextResponse } from "next/server";
import { syncEquipmentDueSoon } from "@/lib/equipment-notifications";

/** Triggered by Railway's cron scheduler (see Phase 9 deployment config)
 * instead of running on every admin page load like the original app. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  }

  await syncEquipmentDueSoon();
  return NextResponse.json({ ok: true });
}
