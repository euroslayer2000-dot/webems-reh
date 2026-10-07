import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  FileDown,
  MessageCircle,
  PhoneCall,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/public/container";
import { SectionTitle } from "@/components/public/section-title";
import { NewsCard } from "@/components/public/news-card";
import { getSettings } from "@/lib/settings";
import { uploadUrl } from "@/lib/upload";
import { Reveal } from "@/components/public/reveal";
import { HeroBannerCarousel } from "@/components/public/hero-banner-carousel";
import { CourseHighlightCard } from "@/components/public/course-highlight-card";

export const revalidate = 60;

export default async function HomePage() {
  const currentYear = new Date().getFullYear();
  const yearStart = new Date(Date.UTC(currentYear, 0, 1));
  const yearEnd = new Date(Date.UTC(currentYear + 1, 0, 1));

  const [settings, latestNews, galleries, patientStats, heroBanners, emrCourse, emtbCourse, eduPortalCourse] =
    await Promise.all([
      getSettings(),
      prisma.news.findMany({
        where: { status: "published" },
        include: { category: true },
        orderBy: { published_at: "desc" },
        take: 6,
      }),
      prisma.gallery.findMany({
        include: { _count: { select: { images: true } } },
        orderBy: { id: "desc" },
        take: 6,
      }),
      prisma.patientReport.aggregate({
        where: { report_date: { gte: yearStart, lt: yearEnd } },
        _sum: {
          patient_count: true,
          emergency_count: true,
          traffic_injury_count: true,
          general_injury_count: true,
        },
      }),
      prisma.banner.findMany({
        where: { position: "hero", is_active: true },
        orderBy: { sort_order: "asc" },
        select: { id: true, title: true, image: true, link_url: true },
      }),
      prisma.course.findFirst({ where: { slug: "emr", is_active: true } }),
      prisma.course.findFirst({ where: { slug: "emt-b", is_active: true } }),
      prisma.course.findFirst({ where: { slug: "education-portal", is_active: true } }),
    ]);

  const emergencyPhone = settings.emergency_phone || "1669";

  const stats = [
    { image: "/assets/img/3.jpg", label: "จำนวนผู้ป่วยต่อปี", value: patientStats._sum.patient_count ?? 0 },
    { image: "/assets/img/4.jpg", label: "จำนวนผู้ป่วยฉุกเฉิน", value: patientStats._sum.emergency_count ?? 0 },
    { image: "/assets/img/2.jpg", label: "จำนวนผู้บาดเจ็บจราจร", value: patientStats._sum.traffic_injury_count ?? 0 },
    { image: "/assets/img/1.jpg", label: "จำนวนผู้บาดเจ็บอุบัติเหตุทั่วไป", value: patientStats._sum.general_injury_count ?? 0 },
  ];

  const quickLinks = [
    { icon: PhoneCall, title: "แจ้งเหตุฉุกเฉิน", subtitle: `โทร ${emergencyPhone}`, href: `tel:${emergencyPhone}` },
    { icon: FileDown, title: "ดาวน์โหลดเอกสาร", subtitle: "แบบฟอร์ม/คู่มือ", href: "/download" },
    { icon: Users, title: "ทำเนียบบุคลากร", subtitle: "ทีมกู้ชีพของเรา", href: "/personnel" },
    { icon: MessageCircle, title: "ติดต่อสอบถาม", subtitle: "ส่งข้อความถึงเรา", href: "/contact" },
  ];

  return (
    <div>
      {heroBanners.length > 0 && <HeroBannerCarousel banners={heroBanners} />}

      {/* ------------------------------------------- Welcome + stats hero --- */}
      <section className="py-10">
        <Container>
          <div className="rounded-[var(--radius-xl)] bg-[#F8F8FF] p-6 shadow-[var(--shadow-lg)]">
            <Reveal direction="up" className="text-center">
              <p className="font-[Arial,sans-serif] text-[2.78rem] font-normal text-black sm:text-[3.48rem]">WELCOME TO</p>
              <h2 className="mt-1 font-[Arial,sans-serif] text-[2.93rem] font-extrabold text-primary-500 sm:text-[3.51rem]">
                EMS ROI-ET HOSPITAL
              </h2>
            </Reveal>

            <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <Reveal key={stat.label} direction="zoom" delay={i * 100} className="p-4 text-center">
                  <span className="mx-auto mb-3 grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-white shadow-[var(--shadow-sm)]">
                    <Image src={stat.image} alt={stat.label} width={56} height={56} className="h-14 w-14 object-contain" />
                  </span>
                  <div className="text-[2.4rem] leading-none font-extrabold text-[#1a2b32]">
                    {stat.value.toLocaleString("th-TH")}
                  </div>
                  <div className="mt-1.5 font-medium text-[#1a2b32]">{stat.label}</div>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------- Quick links --- */}
      <section className="bg-surface py-12">
        <Container>
          <div className="rounded-[var(--radius-xl)] bg-[#F8F8FF] p-6 shadow-[var(--shadow-lg)]">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {quickLinks.map((ql, i) => (
                <Reveal key={ql.title} direction="up" delay={i * 80}>
                  <a
                    href={ql.href}
                    className="flex h-full items-center gap-4 rounded-[var(--radius)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-[var(--shadow-md)]"
                  >
                    <span
                      className={`grid h-[52px] w-[52px] shrink-0 place-items-center rounded-2xl text-white transition-transform ${
                        i % 2 === 0 ? "bg-[image:var(--grad-primary)]" : "bg-[image:var(--grad-accent)]"
                      }`}
                    >
                      <ql.icon size={22} />
                    </span>
                    <span>
                      <strong className="block font-bold text-text">{ql.title}</strong>
                      <small className="text-text-muted">{ql.subtitle}</small>
                    </span>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* --------------------------------------------------------- News --- */}
      <section className="bg-surface py-[4.5rem]">
        <Container>
          <Reveal direction="up"><SectionTitle eyebrow="News & Updates" title="ข่าวประชาสัมพันธ์ล่าสุด" /></Reveal>
          {latestNews.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {latestNews.map((news, i) => (
                  <Reveal key={news.slug} direction="up" delay={(i % 3) * 100}>
                    <NewsCard news={news} />
                  </Reveal>
                ))}
              </div>
              <Reveal direction="up" className="mt-8 text-center">
                <Link
                  href="/news"
                  className="inline-flex items-center rounded-[var(--radius)] bg-[image:var(--grad-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-primary)] transition-transform hover:-translate-y-0.5"
                >
                  ดูข่าวทั้งหมด <ArrowRight size={16} className="ml-1.5" />
                </Link>
              </Reveal>
            </>
          ) : (
            <p className="py-8 text-center text-text-muted">ยังไม่มีข่าวประชาสัมพันธ์ในขณะนี้</p>
          )}
        </Container>
      </section>

      {/* ----------------------------------------------------- Courses --- */}
      <section className="py-[4.5rem]">
        <Container>
          <div className="rounded-[var(--radius-xl)] bg-[#F8F8FF] p-6 shadow-[var(--shadow-lg)]">
            <Reveal direction="up"><SectionTitle eyebrow="Courses" title="หลักสูตรการเรียน" /></Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Reveal direction="up" delay={0}>
                <CourseHighlightCard
                  title={emrCourse?.title ?? "Emergency Medical Responder (EMR Course)"}
                  imageUrl={emrCourse ? uploadUrl(emrCourse.cover_image) : null}
                  href={emrCourse ? `/courses/${emrCourse.slug}` : "/courses"}
                  ctaLabel="Learn more"
                />
              </Reveal>
              <Reveal direction="up" delay={100}>
                <CourseHighlightCard
                  title={emtbCourse?.title ?? "Emergency Medical Technician - Basic (EMT-B Course)"}
                  imageUrl={emtbCourse ? uploadUrl(emtbCourse.cover_image) : null}
                  href={emtbCourse ? `/courses/${emtbCourse.slug}` : "/courses"}
                  ctaLabel="Learn more"
                />
              </Reveal>
              <Reveal direction="up" delay={200}>
                <CourseHighlightCard
                  title={eduPortalCourse?.title ?? "Education Portal"}
                  imageUrl={eduPortalCourse ? uploadUrl(eduPortalCourse.cover_image) : null}
                  href={eduPortalCourse ? `/courses/${eduPortalCourse.slug}` : "/courses"}
                  ctaLabel="View more"
                />
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------- Gallery --- */}
      {galleries.length > 0 && (
        <section className="bg-surface py-[4.5rem]">
          <Container>
            <Reveal direction="up"><SectionTitle eyebrow="Gallery" eyebrowClassName="bg-[#FFBBDA] text-accent-600" title="ภาพกิจกรรม" /></Reveal>
            <div className="flex flex-wrap gap-3">
              {galleries.map((gallery, i) => (
                <Reveal
                  key={gallery.id}
                  direction="up"
                  delay={(i % 6) * 60}
                  className="aspect-[4/3] w-[calc(65%-0.375rem)] md:w-[calc(43.333%-0.5rem)] lg:w-[calc(21.667%-0.6rem)]"
                >
                  <Link href="/gallery" className="group relative block h-full w-full overflow-hidden rounded-[var(--radius)] bg-bg-soft">
                    <Image
                      src={uploadUrl(gallery.cover_image)}
                      alt={gallery.title}
                      fill
                      sizes="(max-width: 768px) 65vw, (max-width: 1024px) 43vw, 22vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-white/94 to-transparent to-60% p-4 font-semibold text-[#1a2b32] opacity-0 transition-opacity group-hover:opacity-100">
                      <span>{gallery.title}</span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* --------------------------------------------------------- About --- */}
      <section className="py-[4.5rem]">
        <Container>
          <div className="rounded-[var(--radius-xl)] bg-[#F8F8FF] p-6 shadow-[var(--shadow-lg)]">
            <Reveal className="flex justify-center">
              <Image
                src="/assets/img/emslogo.jpg"
                alt="REH101"
                width={2016}
                height={1074}
                className="h-auto w-[2016px] max-w-full rounded-[var(--radius-lg)]"
              />
            </Reveal>
          </div>
        </Container>
      </section>
    </div>
  );
}
