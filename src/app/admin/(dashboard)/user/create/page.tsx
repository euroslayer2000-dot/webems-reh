import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { UserForm } from "../user-form";

export default async function CreateUserPage() {
  await requirePageAccess("user");
  return (
    <div>
      <PageHead title="เพิ่มผู้ใช้งาน" />
      <UserForm user={null} isSelf={false} />
    </div>
  );
}
