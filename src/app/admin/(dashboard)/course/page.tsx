import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { uploadUrl } from "@/lib/upload";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard } from "@/components/admin/admin-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { btnDangerSm, btnGhostSm, btnPrimary } from "@/components/admin/button-styles";
import { deleteCourse, moveCourse, toggleCourse } from "./actions";

export default async function AdminCoursePage() {
  await requirePageAccess("course");
  const courses = await prisma.course.findMany({ orderBy: { sort_order: "asc" } });

  return (
    <div>
      <PageHead
        title="จัดการหลักสูตรการเรียน"
        action={
          <Link href="/admin/course/create" className={btnPrimary}>
            <Plus size={16} /> เพิ่มหลักสูตร
          </Link>
        }
      />

      <AdminCard className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-2 text-left text-xs font-semibold uppercase text-text-muted">
            <tr>
              <th className="px-5 py-3">ภาพปก</th>
              <th className="px-5 py-3">ชื่อหลักสูตร</th>
              <th className="px-5 py-3">คำอธิบายสั้น</th>
              <th className="px-5 py-3">สถานะ</th>
              <th className="px-5 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {courses.map((course, i) => (
              <tr key={course.id}>
                <td className="px-5 py-2.5">
                  <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-bg-soft">
                    <Image src={uploadUrl(course.cover_image)} alt={course.title} fill sizes="64px" className="object-cover" />
                  </div>
                </td>
                <td className="px-5 py-2.5 font-semibold text-text">{course.title}</td>
                <td className="max-w-xs truncate px-5 py-2.5 text-text-muted">{course.short_description ?? "-"}</td>
                <td className="px-5 py-2.5">
                  <StatusBadge active={course.is_active} activeLabel="แสดงผล" inactiveLabel="ซ่อน" />
                </td>
                <td className="px-5 py-2.5">
                  <div className="flex justify-end gap-1.5">
                    <form action={moveCourse}>
                      <input type="hidden" name="id" value={course.id} />
                      <input type="hidden" name="direction" value="up" />
                      <button type="submit" disabled={i === 0} aria-label="เลื่อนขึ้น" className={`${btnGhostSm} disabled:opacity-30`}>
                        <ChevronUp size={15} />
                      </button>
                    </form>
                    <form action={moveCourse}>
                      <input type="hidden" name="id" value={course.id} />
                      <input type="hidden" name="direction" value="down" />
                      <button type="submit" disabled={i === courses.length - 1} aria-label="เลื่อนลง" className={`${btnGhostSm} disabled:opacity-30`}>
                        <ChevronDown size={15} />
                      </button>
                    </form>
                    <form action={toggleCourse}>
                      <input type="hidden" name="id" value={course.id} />
                      <button type="submit" className={btnGhostSm}>
                        {course.is_active ? "ซ่อน" : "แสดง"}
                      </button>
                    </form>
                    <Link href={`/admin/course/${course.id}/edit`} className={btnGhostSm}>แก้ไข</Link>
                    <form action={deleteCourse}>
                      <input type="hidden" name="id" value={course.id} />
                      <ConfirmSubmitButton confirmText={`ลบหลักสูตร "${course.title}" ?`} className={btnDangerSm}>ลบ</ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-text-muted">ยังไม่มีหลักสูตร</td></tr>
            )}
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}
