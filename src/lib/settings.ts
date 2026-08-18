import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** All settings as a key => value map, matching Setting::allAsArray() in the Laravel app.
 * `cache()` de-dupes this to one query per request (layout + pages all call it). */
export const getSettings = cache(async (): Promise<Record<string, string>> => {
  const rows = await prisma.setting.findMany();
  return Object.fromEntries(rows.map((row) => [row.setting_key, row.setting_value ?? ""]));
});
