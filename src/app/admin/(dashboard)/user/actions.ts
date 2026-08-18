"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { redirectWithFlash } from "@/lib/flash-redirect";

const ROLES = ["superadmin", "admin", "editor"] as const;

const createSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ").max(120),
  username: z.string().min(3, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร").max(60),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  email: z.union([z.literal(""), z.string().email("อีเมลไม่ถูกต้อง").max(150, "อีเมลต้องไม่เกิน 150 ตัวอักษร")]).optional(),
  role: z.enum(ROLES),
});

export type UserFormState = { ok: boolean; errors?: Record<string, string> };

function zodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) errors[String(issue.path[0])] = issue.message;
  return errors;
}

export async function createUser(_prev: UserFormState, formData: FormData): Promise<UserFormState> {
  await requireActionAccess("user");
  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    password: formData.get("password"),
    email: formData.get("email") || undefined,
    role: formData.get("role"),
  });
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed.error) };

  const dup = await prisma.user.findUnique({ where: { username: parsed.data.username } });
  if (dup) return { ok: false, errors: { username: "ชื่อผู้ใช้นี้ถูกใช้แล้ว" } };

  if (parsed.data.email) {
    const dupEmail = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (dupEmail) return { ok: false, errors: { email: "อีเมลนี้ถูกใช้แล้ว" } };
  }

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      username: parsed.data.username,
      email: parsed.data.email || null,
      password: await bcrypt.hash(parsed.data.password, 12),
      role: parsed.data.role,
      is_active: formData.get("is_active") === "on",
    },
  });

  redirectWithFlash("/admin/user", "เพิ่มผู้ใช้งานเรียบร้อยแล้ว");
}

const updateSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ").max(120),
  username: z.string().min(3, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร").max(60),
  email: z.union([z.literal(""), z.string().email("อีเมลไม่ถูกต้อง").max(150, "อีเมลต้องไม่เกิน 150 ตัวอักษร")]).optional(),
  role: z.enum(ROLES),
  password: z.union([z.literal(""), z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")]).optional(),
});

export async function updateUser(id: number, _prev: UserFormState, formData: FormData): Promise<UserFormState> {
  const currentUser = await requireActionAccess("user");
  const isSelf = Number(currentUser.id) === id;

  const parsed = updateSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email") || undefined,
    role: formData.get("role"),
    password: formData.get("password") || undefined,
  });
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed.error) };

  const dup = await prisma.user.findFirst({ where: { username: parsed.data.username, id: { not: id } } });
  if (dup) return { ok: false, errors: { username: "ชื่อผู้ใช้นี้ถูกใช้แล้ว" } };

  if (parsed.data.email) {
    const dupEmail = await prisma.user.findFirst({ where: { email: parsed.data.email, id: { not: id } } });
    if (dupEmail) return { ok: false, errors: { email: "อีเมลนี้ถูกใช้แล้ว" } };
  }

  const data: {
    name: string;
    username: string;
    email: string | null;
    role: (typeof ROLES)[number];
    is_active: boolean;
    password?: string;
  } = {
    name: parsed.data.name,
    username: parsed.data.username,
    email: parsed.data.email || null,
    // Can't demote or deactivate your own account — avoids locking yourself out.
    role: isSelf ? (await prisma.user.findUniqueOrThrow({ where: { id } })).role : parsed.data.role,
    is_active: isSelf ? true : formData.get("is_active") === "on",
  };
  if (parsed.data.password) data.password = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.update({ where: { id }, data });

  redirectWithFlash("/admin/user", "บันทึกการแก้ไขเรียบร้อยแล้ว");
}

export async function deleteUser(formData: FormData): Promise<void> {
  const currentUser = await requireActionAccess("user");
  const id = Number(formData.get("id"));

  if (Number(currentUser.id) === id) {
    redirectWithFlash("/admin/user", "ไม่สามารถลบบัญชีของตัวเองได้", "error");
  }

  await prisma.user.delete({ where: { id } });

  redirectWithFlash("/admin/user", "ลบผู้ใช้เรียบร้อยแล้ว");
}
