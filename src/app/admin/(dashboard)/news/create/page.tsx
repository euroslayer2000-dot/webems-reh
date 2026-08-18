import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { NewsForm } from "../news-form";

export default async function CreateNewsPage() {
  await requirePageAccess("news");
  const categories = await prisma.category.findMany({ where: { type: "news" }, orderBy: { name: "asc" } });

  return (
    <div>
      <PageHead title="เพิ่มข่าวใหม่" />
      <NewsForm categories={categories} news={null} />
    </div>
  );
}
