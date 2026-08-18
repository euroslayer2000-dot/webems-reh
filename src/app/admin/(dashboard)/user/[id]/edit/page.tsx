import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { UserForm } from "../../user-form";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = await requirePageAccess("user");
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id: Number(id) } });
  if (!user) notFound();

  return (
    <div>
      <PageHead title="แก้ไขผู้ใช้งาน" />
      <UserForm user={user} isSelf={Number(currentUser.id) === user.id} />
    </div>
  );
}
