"use server";

import { z } from "zod";
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

const optionalUrl = z.union([z.literal(""), z.string().trim().url("ลิงก์ไม่ถูกต้อง (ต้องขึ้นต้นด้วย http:// หรือ https://)")]);
const optionalEmail = z.union([z.literal(""), z.string().trim().email("รูปแบบอีเมลไม่ถูกต้อง")]);
const optionalPhone = z.union([z.literal(""), z.string().trim().regex(/^[0-9+\-#*.\s]{6,20}$/, "รูปแบบเบอร์โทรไม่ถูกต้อง")]);
const optionalEmbed = z.union([
  z.literal(""),
  z.string().trim().refine((v) => /<iframe[\s>]/i.test(v), { message: "ต้องเป็นโค้ด embed แบบ <iframe> ที่คัดลอกจาก Google Maps (Share → Embed a map)" }),
]);

const settingsSchema = z.object({
  site_name: z.string().trim().min(1, "กรุณากรอกชื่อเว็บไซต์"),
  emergency_phone: optionalPhone,
  office_phone: optionalPhone,
  email: optionalEmail,
  facebook: optionalUrl,
  line: optionalUrl,
  youtube: optionalUrl,
  map_embed: optionalEmbed,
});

export type SettingsFormState = {
  ok: boolean;
  errors?: Partial<Record<keyof z.infer<typeof settingsSchema>, string>>;
};

function get(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function updateSettings(_prev: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  await requireActionAccess("setting");

  const parsed = settingsSchema.safeParse({
    site_name: get(formData, "site_name"),
    emergency_phone: get(formData, "emergency_phone"),
    office_phone: get(formData, "office_phone"),
    email: get(formData, "email"),
    facebook: get(formData, "facebook"),
    line: get(formData, "line"),
    youtube: get(formData, "youtube"),
    map_embed: get(formData, "map_embed"),
  });
  if (!parsed.success) {
    const errors: SettingsFormState["errors"] = {};
    for (const issue of parsed.error.issues) errors[issue.path[0] as keyof z.infer<typeof settingsSchema>] = issue.message;
    return { ok: false, errors };
  }

  for (const [key, group] of Object.entries(FIELDS)) {
    let value = get(formData, key).trim();
    if (RICH_TEXT_FIELDS.has(key)) value = sanitizeRichText(value);

    await prisma.setting.upsert({
      where: { setting_key: key },
      update: { setting_value: value, setting_group: group },
      create: { setting_key: key, setting_value: value, setting_group: group },
    });
  }

  redirectWithFlash("/admin/setting", "บันทึกการตั้งค่าเรียบร้อยแล้ว");
}
