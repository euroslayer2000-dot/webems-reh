import type { Metadata } from "next";
import { AlertTriangle, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/public/container";
import { PageHero } from "@/components/public/page-hero";
import { getSettings } from "@/lib/settings";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "ติดต่อเรา",
};

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div>
      <PageHero title="ติดต่อเรา" subtitle="แจ้งเหตุฉุกเฉินหรือติดต่อสอบถามข้อมูล" />

      <Container className="grid gap-10 py-12 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-accent-100 bg-accent-50 p-5">
            <p className="flex items-center gap-2 font-bold text-accent-600">
              <AlertTriangle size={18} /> เหตุฉุกเฉิน
            </p>
            <a href={`tel:${settings.emergency_phone || "1669"}`} className="mt-1 block text-2xl font-extrabold text-text">
              โทร {settings.emergency_phone || "1669"}
            </a>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <ul className="grid gap-4 text-sm text-text">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 shrink-0 text-primary-500" size={18} />
                {settings.address || "-"}
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 shrink-0 text-primary-500" size={18} />
                {settings.office_phone || "-"}
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 shrink-0 text-primary-500" size={18} />
                {settings.email || "-"}
              </li>
            </ul>
          </div>

          {settings.map_embed && (
            <div
              className="overflow-hidden rounded-2xl border border-border [&_iframe]:h-72 [&_iframe]:w-full"
              dangerouslySetInnerHTML={{ __html: settings.map_embed }}
            />
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-text">ส่งข้อความถึงเรา</h2>
          <ContactForm />
        </div>
      </Container>
    </div>
  );
}
