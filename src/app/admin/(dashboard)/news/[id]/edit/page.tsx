import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { NewsForm } from "../../news-form";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("news");
  const { id } = await params;

  const [categories, news] = await Promise.all([
    prisma.category.findMany({ where: { type: "news" }, orderBy: { name: "asc" } }),
    prisma.news.findUnique({ where: { id: Number(id) } }),
  ]);
  if (!news) notFound();

  return (
    <div>
      <PageHead title="แก้ไขข่าว" />
      <NewsForm categories={categories} news={news} />
    </div>
  );
}
