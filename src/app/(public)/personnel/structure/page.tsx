import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/public/container";
import { PageHero } from "@/components/public/page-hero";
import { StructureLightbox } from "@/components/public/structure-lightbox";
import { uploadUrl } from "@/lib/upload";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "โครงสร้างหน่วยงาน",
  description: "ผังโครงสร้างการบริหารงานของหน่วยกู้ชีพ REH101",
};

export default async function PersonnelStructurePage() {
  const structures = await prisma.orgStructure.findMany({
    where: { is_active: true },
    orderBy: { sort_order: "asc" },
  });

  return (
    <div>
      <PageHero title="โครงสร้างหน่วยงาน" subtitle="ผังโครงสร้างการบริหารงานของหน่วยกู้ชีพ REH101" />

      <Container className="py-12">
        {structures.length === 0 ? (
          <p className="py-16 text-center text-sm text-text-muted">ยังไม่มีข้อมูลโครงสร้างหน่วยงาน</p>
        ) : (
          <StructureLightbox
            items={structures.map((item) => ({ id: item.id, src: uploadUrl(item.image), title: item.title }))}
          />
        )}
      </Container>
    </div>
  );
}
