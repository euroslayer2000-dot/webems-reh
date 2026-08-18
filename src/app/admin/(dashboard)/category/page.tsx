import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { inputClass, FormField } from "@/components/admin/form-field";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard, AdminCardHead } from "@/components/admin/admin-card";
import { btnDangerSm, btnPrimary } from "@/components/admin/button-styles";
import { createCategory, deleteCategory } from "./actions";

function CategoryList({ title, categories }: { title: string; categories: { id: number; name: string }[] }) {
  return (
    <AdminCard>
      <AdminCardHead title={title} />
      <ul className="divide-y divide-border">
        {categories.map((cat) => (
          <li key={cat.id} className="flex items-center justify-between px-5 py-3 text-sm">
            <span className="text-text">{cat.name}</span>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={cat.id} />
              <ConfirmSubmitButton confirmText={`ลบหมวดหมู่ "${cat.name}" ?`} className={btnDangerSm}>
                ลบ
              </ConfirmSubmitButton>
            </form>
          </li>
        ))}
        {categories.length === 0 && <li className="px-5 py-6 text-center text-sm text-text-muted">ยังไม่มีหมวดหมู่</li>}
      </ul>
    </AdminCard>
  );
}

export default async function CategoryPage() {
  await requirePageAccess("category");
  const [newsCats, dlCats] = await Promise.all([
    prisma.category.findMany({ where: { type: "news" }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { type: "download" }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHead title="จัดการหมวดหมู่" />

      <AdminCard className="mb-6">
        <form action={createCategory} className="flex flex-wrap items-end gap-3 p-5">
          <div className="min-w-[200px] flex-1">
            <FormField label="ชื่อหมวดหมู่" htmlFor="name" required>
              <input id="name" name="name" required className={inputClass} />
            </FormField>
          </div>
          <div>
            <FormField label="ประเภท" htmlFor="type">
              <select id="type" name="type" className={inputClass}>
                <option value="news">ข่าว</option>
                <option value="download">ดาวน์โหลด</option>
              </select>
            </FormField>
          </div>
          <button type="submit" className={btnPrimary}>
            เพิ่มหมวดหมู่
          </button>
        </form>
      </AdminCard>

      <div className="grid gap-6 sm:grid-cols-2">
        <CategoryList title="หมวดหมู่ข่าว" categories={newsCats} />
        <CategoryList title="หมวดหมู่ดาวน์โหลด" categories={dlCats} />
      </div>
    </div>
  );
}
