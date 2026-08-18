import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/public/container";
import { PageHero } from "@/components/public/page-hero";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "ประวัติความเป็นมา",
  description: "ประวัติความเป็นมาของหน่วยกู้ชีพ REH101",
};

export default async function AboutHistoryPage() {
  const setting = await prisma.setting.findUnique({ where: { setting_key: "about_history" } });

  return (
    <div>
      <PageHero title="ประวัติความเป็นมา" />

      <Container className="max-w-3xl py-12">
        {setting?.setting_value ? (
          <div
            className="prose prose-sm sm:prose-base max-w-none prose-headings:text-text prose-p:text-text"
            dangerouslySetInnerHTML={{ __html: setting.setting_value }}
          />
        ) : (
          <p className="text-sm text-text-muted">ยังไม่มีข้อมูล</p>
        )}
      </Container>
    </div>
  );
}
