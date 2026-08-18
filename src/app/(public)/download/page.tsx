import type { Metadata } from "next";
import { Download as DownloadIcon, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/public/container";
import { PageHero } from "@/components/public/page-hero";
import { formatDateTh, formatFileSize } from "@/lib/format";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "ดาวน์โหลดเอกสาร",
};

export default async function DownloadIndexPage() {
  const documents = await prisma.download.findMany({
    include: { category: true },
    orderBy: { id: "desc" },
  });

  return (
    <div>
      <PageHero title="ดาวน์โหลดเอกสาร" subtitle="เอกสาร แบบฟอร์ม และคู่มือต่าง ๆ ของหน่วยกู้ชีพ REH101" />

      <Container className="py-12">
        {documents.length === 0 ? (
          <p className="py-16 text-center text-sm text-text-muted">ยังไม่มีเอกสารให้ดาวน์โหลด</p>
        ) : (
          <div className="flex flex-col gap-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text">{doc.title}</h3>
                    {doc.description && <p className="mt-0.5 text-xs text-text-muted">{doc.description}</p>}
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
                      {doc.category && <span>{doc.category.name}</span>}
                      <span>{doc.file_type?.toUpperCase()}</span>
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>{formatDateTh(doc.created_at)}</span>
                      <span>ดาวน์โหลด {doc.download_count.toLocaleString("th-TH")} ครั้ง</span>
                    </div>
                  </div>
                </div>
                <a
                  href={`/download/file/${doc.id}`}
                  className="flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
                >
                  <DownloadIcon size={14} /> ดาวน์โหลด
                </a>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
