"use server";

import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { redirectWithFlash } from "@/lib/flash-redirect";

const FIELDS: Record<string, string> = {
  site_name: "general",
  site_tagline: "general",
  emergency_phone: "contact",
  office_phone: "contact",
  email: "contact",
  address: "contact",
  map_embed: "contact",
  facebook: "social",
  line: "social",
  youtube: "social",
  about_vision: "about",
  about_mission: "about",
  about_history: "about",
};

// These are rendered via dangerouslySetInnerHTML on the public site; the
// original app saves them unsanitized (admin-only input), we sanitize on
// the way in as cheap defense in depth.
const RICH_TEXT_FIELDS = new Set(["about_vision", "about_mission", "about_history"]);

export async function updateSettings(formData: FormData): Promise<void> {
  await requireActionAccess("setting");

  for (const [key, group] of Object.entries(FIELDS)) {
    let value = String(formData.get(key) ?? "").trim();
    if (RICH_TEXT_FIELDS.has(key)) value = sanitizeRichText(value);

    await prisma.setting.upsert({
      where: { setting_key: key },
      update: { setting_value: value, setting_group: group },
      create: { setting_key: key, setting_value: value, setting_group: group },
    });
  }

  redirectWithFlash("/admin/setting", "บันทึกการตั้งค่าเรียบร้อยแล้ว");
}
