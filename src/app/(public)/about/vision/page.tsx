import type { Metadata } from "next";
import { Building2, Ambulance, HeartPulse } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/public/container";
import { PageHero } from "@/components/public/page-hero";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "วิสัยทัศน์และพันธกิจ",
  description: "วิสัยทัศน์ของหน่วยกู้ชีพ REH101",
};

const VISION_ICONS = [Building2, HeartPulse, Ambulance];
const VISION_GRADIENTS = ["var(--grad-primary)", "var(--grad-accent)", "var(--grad-primary)"];

function parseVisionItems(html: string) {
  const items = [...html.matchAll(/<p>\s*<strong>([\s\S]*?)<\/strong>\s*([\s\S]*?)\s*<\/p>/g)].map((m) => ({
    label: m[1].replace(/:\s*$/, ""),
    body: m[2],
  }));
  return items.length > 0 ? items : null;
}

export default async function AboutVisionPage() {
  const row = await prisma.setting.findUnique({ where: { setting_key: "about_vision" } });
  const vision = row?.setting_value;
  const items = vision ? parseVisionItems(vision) : null;

  return (
    <div>
      <PageHero title="วิสัยทัศน์และพันธกิจ" />

      <Container className="max-w-5xl py-12">
        <h2 className="mb-6 text-center text-lg font-bold text-text">วิสัยทัศน์</h2>

        {items ? (
          <div className="grid gap-6 md:grid-cols-3">
            {items.map((item, i) => {
              const Icon = VISION_ICONS[i % VISION_ICONS.length];
              return (
                <div
                  key={item.label}
                  className="flex flex-col items-center rounded-[var(--radius)] border border-border bg-surface p-6 text-center shadow-[var(--shadow-sm)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
                >
                  <span
                    className="mb-4 grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white"
                    style={{ backgroundImage: VISION_GRADIENTS[i % VISION_GRADIENTS.length] }}
                  >
                    <Icon size={26} />
                  </span>
                  <h3 className="mb-2 font-bold text-text">{item.label}</h3>
                  <p className="text-sm text-text-muted">{item.body}</p>
                </div>
              );
            })}
          </div>
        ) : vision ? (
          <div className="prose prose-sm sm:prose-base max-w-none prose-headings:text-text prose-p:text-text" dangerouslySetInnerHTML={{ __html: vision }} />
        ) : (
          <p className="text-center text-sm text-text-muted">ยังไม่มีข้อมูล</p>
        )}
      </Container>
    </div>
  );
}
