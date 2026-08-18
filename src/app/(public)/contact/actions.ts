"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const contactSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ-นามสกุล").max(150),
  email: z.union([z.literal(""), z.string().email("อีเมลไม่ถูกต้อง")]).optional(),
  phone: z.string().max(30).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(1, "กรุณากรอกข้อความ").max(2000),
});

export type ContactFormState = {
  ok: boolean;
  errors?: Partial<Record<keyof z.infer<typeof contactSchema>, string>>;
};

export async function submitContact(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const errors: ContactFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof z.infer<typeof contactSchema>;
      errors[key] = issue.message;
    }
    return { ok: false, errors };
  }

  await prisma.contact.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    },
  });

  return { ok: true };
}
