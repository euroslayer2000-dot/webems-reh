import type { FtEmsIndicatorKey, MonthlyCounts } from "./ft-ems-config";

/** Client for the Google Apps Script web app (apps-script/ft-ems.gs). The
 * script URL and shared token stay server-side; the browser only ever talks to
 * our own Server Actions. */

type Request =
  | { action: "getMonthly"; month: number; track: string }
  | ({ action: "saveMonthly"; month: number; track: string } & MonthlyCounts)
  | { action: "getIndicator"; month: number; indicator: FtEmsIndicatorKey }
  | { action: "saveIndicator"; month: number; indicator: FtEmsIndicatorKey; percent: number }
  | { action: "summary" };

type Response<T> = { ok: true; data: T } | { ok: false; error: string };

export async function callFtEmsSheet<T>(request: Request): Promise<Response<T>> {
  const url = process.env.FT_EMS_SCRIPT_URL;
  const token = process.env.FT_EMS_SCRIPT_TOKEN;
  if (!url || !token) return { ok: false, error: "ยังไม่ได้ตั้งค่า FT_EMS_SCRIPT_URL / FT_EMS_SCRIPT_TOKEN" };

  try {
    const res = await fetch(url, {
      method: "POST",
      // text/plain avoids a CORS preflight style request; Apps Script reads the raw body.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...request, token }),
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });
    const json = (await res.json()) as { ok?: boolean; data?: T; error?: string };
    if (!json.ok) return { ok: false, error: json.error ?? "Google Sheet ตอบกลับผิดพลาด" };
    return { ok: true, data: json.data as T };
  } catch {
    return { ok: false, error: "เชื่อมต่อ Google Sheet ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  }
}
