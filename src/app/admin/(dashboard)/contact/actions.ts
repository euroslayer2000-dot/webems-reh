"use server";

import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { redirectWithFlash } from "@/lib/flash-redirect";

export async function deleteContact(formData: FormData): Promise<void> {
  await requireActionAccess("contact");
  const id = Number(formData.get("id"));
  await prisma.contact.delete({ where: { id } });

  redirectWithFlash("/admin/contact", "ลบข้อความเรียบร้อยแล้ว");
}
