import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/public/container";
import { PageHero } from "@/components/public/page-hero";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "วิสัยทัศน์และพันธกิจ",
  description: "วิสัยทัศน์และพันธกิจของหน่วยกู้ชีพ REH101",
};

export default async function AboutVisionPage() {
  const rows = await prisma.setting.findMany({
    where: { setting_key: { in: ["about_vision", "about_mission"] } },
  });
  const vision = rows.find((r) => r.setting_key === "about_vision")?.setting_value;
  const mission = rows.find((r) => r.setting_key === "about_mission")?.setting_value;

  return (
    <div>
      <PageHero title="วิสัยทัศน์และพันธกิจ" />

      <Container className="max-w-3xl py-12">
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-bold text-text">วิสัยทัศน์</h2>
          {vision ? (
            <div className="prose prose-sm sm:prose-base max-w-none prose-headings:text-text prose-p:text-text" dangerouslySetInnerHTML={{ __html: vision }} />
          ) : (
            <p className="text-sm text-text-muted">ยังไม่มีข้อมูล</p>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-text">พันธกิจ</h2>
          {mission ? (
            <div className="prose prose-sm sm:prose-base max-w-none prose-headings:text-text prose-p:text-text" dangerouslySetInnerHTML={{ __html: mission }} />
          ) : (
            <p className="text-sm text-text-muted">ยังไม่มีข้อมูล</p>
          )}
        </section>
      </Container>
    </div>
  );
}
