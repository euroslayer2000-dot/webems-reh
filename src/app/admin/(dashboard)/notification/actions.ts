"use server";

import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { redirectWithFlash } from "@/lib/flash-redirect";

export async function markNotificationRead(formData: FormData): Promise<void> {
  await requireActionAccess("notification");
  const id = Number(formData.get("id"));
  await prisma.notification.update({ where: { id }, data: { is_read: true } });

  redirectWithFlash("/admin/notification", "ทำเครื่องหมายว่าอ่านแล้ว");
}

export async function markAllNotificationsRead(): Promise<void> {
  await requireActionAccess("notification");
  await prisma.notification.updateMany({ where: { is_read: false }, data: { is_read: true } });

  redirectWithFlash("/admin/notification", "ทำเครื่องหมายว่าอ่านแล้วทั้งหมด");
}
