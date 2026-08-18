import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/public/container";
import { PageHero } from "@/components/public/page-hero";
import { StationsInteractive } from "@/components/public/stations-interactive";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "แผนที่หน่วยกู้ชีพ",
  description: "แผนที่แสดงจุดประจำการของหน่วยกู้ชีพและการแพทย์ฉุกเฉิน REH101",
};

export default async function StationsPage() {
  const stations = await prisma.station.findMany({
    where: { is_active: true },
    orderBy: [{ type: "asc" }, { sort_order: "asc" }],
  });

  const points = stations.map((s) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    lat: Number(s.lat),
    lng: Number(s.lng),
    phone: s.phone,
    address: s.address,
  }));

  return (
    <div>
      <PageHero title="แผนที่หน่วยกู้ชีพ" subtitle="จุดประจำการของหน่วยกู้ชีพและการแพทย์ฉุกเฉิน REH101" />

      <Container className="py-12">
        <StationsInteractive points={points} />
      </Container>
    </div>
  );
}
