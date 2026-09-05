import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { CourseForm } from "../../course-form";

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("course");
  const { id } = await params;

  const course = await prisma.course.findUnique({ where: { id: Number(id) } });
  if (!course) notFound();

  return (
    <div>
      <PageHead title="แก้ไขหลักสูตร" />
      <CourseForm course={course} />
    </div>
  );
}
