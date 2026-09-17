import { NextResponse } from "next/server";
import { syncEquipmentDueSoon } from "@/lib/equipment-notifications";
import { syncMedicineAlerts } from "@/lib/medicine-notifications";

/** Triggered by Vercel Cron (see vercel.json) instead of running on every
 * admin page load like the original app. Both sync functions share this one
 * cron entry rather than each getting their own, to stay within Vercel's
 * per-project cron job limits. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  }

  await syncEquipmentDueSoon();
  await syncMedicineAlerts();
  return NextResponse.json({ ok: true });
}
