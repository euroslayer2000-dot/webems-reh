import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { CourseForm } from "../course-form";

export default async function CreateCoursePage() {
  await requirePageAccess("course");
  return (
    <div>
      <PageHead title="เพิ่มหลักสูตร" />
      <CourseForm course={null} />
    </div>
  );
}
