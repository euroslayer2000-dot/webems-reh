import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/public/container";
import { PageHero } from "@/components/public/page-hero";
import { CourseCard } from "@/components/public/course-card";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "หลักสูตรการเรียน",
  description: "หลักสูตรอบรมด้านการแพทย์ฉุกเฉินของหน่วยกู้ชีพ REH101",
};

export default async function CoursesIndexPage() {
  const courses = await prisma.course.findMany({
    where: { is_active: true },
    orderBy: { sort_order: "asc" },
  });

  return (
    <div>
      <PageHero title="หลักสูตรการเรียน" subtitle="หลักสูตรอบรมด้านการแพทย์ฉุกเฉินของหน่วยกู้ชีพ REH101" />

      <Container className="py-12">
        {courses.length === 0 ? (
          <p className="py-16 text-center text-sm text-text-muted">ยังไม่มีหลักสูตรในขณะนี้</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
