import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/public/container";
import { PageHero } from "@/components/public/page-hero";
import { PersonnelCard } from "@/components/public/personnel-card";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "ทำเนียบบุคลากร",
  description: "ทีมบุคลากรหน่วยกู้ชีพ REH101 เวชกรฉุกเฉินและพยาบาลกู้ชีพ",
};

export default async function PersonnelIndexPage() {
  const [groups, personnel] = await Promise.all([
    prisma.personnelGroup.findMany({ orderBy: { sort_order: "asc" } }),
    prisma.personnel.findMany({
      where: { is_active: true },
      include: { group: true },
      orderBy: { sort_order: "asc" },
    }),
  ]);

  const byGroupCode = new Map<string, typeof personnel>();
  for (const person of personnel) {
    const code = person.group?.code ?? "OTHER";
    byGroupCode.set(code, [...(byGroupCode.get(code) ?? []), person]);
  }

  return (
    <div>
      <PageHero title="ทำเนียบบุคลากร" subtitle="ทีมบุคลากรหน่วยกู้ชีพ REH101 เวชกรฉุกเฉินและพยาบาลกู้ชีพ" />

      <Container className="py-12">
        {groups.length === 0 && personnel.length === 0 && (
          <p className="py-16 text-center text-sm text-text-muted">ยังไม่มีข้อมูลบุคลากร</p>
        )}

        <div className="flex flex-col gap-14">
          {groups.map((group) => {
            const members = byGroupCode.get(group.code) ?? [];
            if (members.length === 0) return null;

            return (
              <section key={group.id}>
                <h2 className="mb-6 text-lg font-bold text-text">{group.name}</h2>
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                  {members.map((person) => (
                    <PersonnelCard key={person.id} person={person} />
                  ))}
                </div>
              </section>
            );
          })}

          {(byGroupCode.get("OTHER")?.length ?? 0) > 0 && (
            <section>
              <h2 className="mb-6 text-lg font-bold text-text">อื่น ๆ</h2>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {byGroupCode.get("OTHER")!.map((person) => (
                  <PersonnelCard key={person.id} person={person} />
                ))}
              </div>
            </section>
          )}
        </div>
      </Container>
    </div>
  );
}
