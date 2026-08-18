import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  CheckCircle2,
  Download,
  FileDown,
  HeartPulse,
  MessageCircle,
  Newspaper,
  Phone,
  PhoneCall,
  PhoneIncoming,
  ShieldCheck,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/public/container";
import { SectionTitle } from "@/components/public/section-title";
import { NewsCard } from "@/components/public/news-card";
import { PersonnelCard } from "@/components/public/personnel-card";
import { getSettings } from "@/lib/settings";
import { uploadUrl } from "@/lib/upload";
import { Reveal } from "@/components/public/reveal";
import { HeroBannerCarousel } from "@/components/public/hero-banner-carousel";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, latestNews, personnel, galleries, newsCount, personnelCount, downloadSum, heroBanners] = await Promise.all([
    getSettings(),
    prisma.news.findMany({
      where: { status: "published" },
      include: { category: true },
      orderBy: { published_at: "desc" },
      take: 6,
    }),
    prisma.personnel.findMany({
      where: { is_active: true },
      include: { group: true },
      orderBy: { sort_order: "asc" },
      take: 4,
    }),
    prisma.gallery.findMany({
      include: { _count: { select: { images: true } } },
      orderBy: { id: "desc" },
      take: 6,
    }),
    prisma.news.count({ where: { status: "published" } }),
    prisma.personnel.count({ where: { is_active: true } }),
    prisma.download.aggregate({ _sum: { download_count: true } }),
    prisma.banner.findMany({
      where: { position: "hero", is_active: true },
      orderBy: { sort_order: "asc" },
      select: { id: true, title: true, image: true, link_url: true },
    }),
  ]);

  const siteName = settings.site_name || "หน่วยกู้ชีพและการแพทย์ฉุกเฉิน REH101";
  const tagline = settings.site_tagline || "บริการการแพทย์ฉุกเฉิน ด้วยหัวใจ ตลอด 24 ชั่วโมง พร้อมทีมกู้ชีพมืออาชีพ";
  const emergencyPhone = settings.emergency_phone || "1669";

  const stats = [
    { icon: Newspaper, label: "ข่าวประชาสัมพันธ์", value: newsCount },
    { icon: Users, label: "บุคลากรผู้เชี่ยวชาญ", value: personnelCount },
    { icon: Download, label: "ยอดดาวน์โหลดเอกสาร", value: downloadSum._sum.download_count ?? 0 },
    { icon: Award, label: "ปีที่ให้บริการ", value: 12, suffix: "+" },
  ];

  const quickLinks = [
    { icon: PhoneCall, title: "แจ้งเหตุฉุกเฉิน", subtitle: `โทร ${emergencyPhone}`, href: `tel:${emergencyPhone}` },
    { icon: FileDown, title: "ดาวน์โหลดเอกสาร", subtitle: "แบบฟอร์ม/คู่มือ", href: "/download" },
    { icon: Users, title: "ทำเนียบบุคลากร", subtitle: "ทีมกู้ชีพของเรา", href: "/personnel" },
    { icon: MessageCircle, title: "ติดต่อสอบถาม", subtitle: "ส่งข้อความถึงเรา", href: "/contact" },
  ];

  return (
    <div>
      {/* ---------------------------------------------------------- Hero --- */}
      <section className="relative overflow-hidden bg-[image:var(--grad-hero)] text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 25%, rgba(255,255,255,0.14), transparent 40%), radial-gradient(circle at 85% 75%, rgba(255,107,157,0.28), transparent 45%)",
          }}
        />
        <span className="pointer-events-none absolute -top-20 -right-15 h-[340px] w-[340px] animate-[float_9s_ease-in-out_infinite] rounded-full bg-accent-500 opacity-50 blur-[60px]" />
        <span className="pointer-events-none absolute -bottom-20 -left-10 h-[260px] w-[260px] animate-[float_11s_ease-in-out_infinite_reverse] rounded-full bg-primary-300 opacity-50 blur-[60px]" />

        <Container className="relative z-[2] py-[clamp(3.5rem,8vw,7rem)]">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal direction="right">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/16 px-4 py-2 text-sm font-semibold backdrop-blur-md">
                <ShieldCheck size={16} /> หน่วยบริการการแพทย์ฉุกเฉินที่ได้มาตรฐาน
              </span>
              <h1 className="text-[clamp(2rem,5vw,3.4rem)] leading-[1.15] font-extrabold">{siteName}</h1>
              <p className="mt-4 max-w-[560px] text-[clamp(1rem,2vw,1.2rem)] text-white/94">{tagline}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`tel:${emergencyPhone}`}
                  className="inline-flex items-center rounded-[var(--radius)] bg-[image:var(--grad-accent)] px-6 py-3.5 text-base font-bold shadow-[var(--shadow-accent)] transition-transform hover:-translate-y-0.5"
                >
                  <Phone size={18} className="mr-2" /> โทรฉุกเฉิน {emergencyPhone}
                </a>
                <Link
                  href="/news"
                  className="inline-flex items-center rounded-[var(--radius)] border-[1.5px] border-white/50 bg-white/14 px-6 py-3.5 text-base font-bold backdrop-blur-md transition-colors hover:bg-white/25"
                >
                  <Newspaper size={18} className="mr-2" /> ข่าวสารล่าสุด
                </Link>
              </div>
            </Reveal>

            <Reveal
              direction="left"
              className="rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-8 text-text shadow-[var(--shadow-lg)] backdrop-blur-[14px] transition-transform hover:-translate-y-1"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="grid h-[66px] w-[66px] shrink-0 place-items-center rounded-[20px] bg-[image:var(--grad-primary)] text-2xl text-white shadow-[var(--shadow-primary)]">
                  <PhoneIncoming size={28} />
                </div>
                <div>
                  <div className="text-sm text-text-muted">สายด่วนการแพทย์ฉุกเฉิน</div>
                  <div className="bg-[image:var(--grad-accent)] bg-clip-text text-[3.2rem] leading-none font-extrabold text-transparent">
                    {emergencyPhone}
                  </div>
                </div>
              </div>
              <hr className="my-4 border-border" />
              <ul className="grid gap-2">
                <li className="flex items-start gap-2"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary-500" />ทีมกู้ชีพพร้อมออกปฏิบัติการทันที</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary-500" />รถพยาบาลอุปกรณ์ครบครัน</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary-500" />บุคลากรผ่านการอบรมมาตรฐาน EMT/Paramedic</li>
              </ul>
            </Reveal>
          </div>
        </Container>

        <div className="relative z-[2] mt-8 leading-[0]">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="block h-[60px] w-full">
            <path d="M0,30 C360,80 1080,-20 1440,30 L1440,60 L0,60 Z" fill="var(--color-bg)" />
          </svg>
        </div>
      </section>

      {heroBanners.length > 0 && (
        <section className="py-12">
          <Container>
            <HeroBannerCarousel banners={heroBanners} />
          </Container>
        </section>
      )}

      {/* ---------------------------------------------------- Stats strip --- */}
      <section className="bg-[image:var(--grad-soft)] py-12">
        <Container>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} direction="zoom" delay={i * 100} className="p-4 text-center">
                <div
                  className={`mx-auto mb-3.5 grid h-[66px] w-[66px] place-items-center rounded-[20px] text-2xl text-white shadow-[var(--shadow-primary)] transition-transform hover:-translate-y-1 ${
                    i % 2 === 1 ? "bg-[image:var(--grad-accent)] shadow-[var(--shadow-accent)]" : "bg-[image:var(--grad-primary)]"
                  }`}
                >
                  <stat.icon size={28} />
                </div>
                <div className="text-[2.4rem] leading-none font-extrabold text-text">
                  {stat.value.toLocaleString("th-TH")}
                  {stat.suffix}
                </div>
                <div className="mt-1.5 font-medium text-text-muted">{stat.label}</div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------- Quick links --- */}
      <section className="py-12">
        <Container>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((ql, i) => (
              <Reveal key={ql.title} direction="up" delay={i * 80}>
                <a
                  href={ql.href}
                  className="flex h-full items-center gap-4 rounded-[var(--radius)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-[var(--shadow-md)]"
                >
                  <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-2xl bg-[image:var(--grad-primary)] text-white transition-transform">
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
        </Container>
      </section>

      {/* --------------------------------------------------------- News --- */}
      <section className="py-[4.5rem]">
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

      {/* --------------------------------------------------------- About --- */}
      <section className="bg-[image:var(--grad-soft)] py-[4.5rem]">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal direction="right" className="relative mx-auto w-fit">
              <Image
                src="/assets/img/reh8.jpg"
                alt="แนะนำหน่วยงาน"
                width={400}
                height={500}
                className="h-[500px] w-[400px] max-w-full rounded-[var(--radius-lg)] bg-surface object-cover shadow-[var(--shadow-lg)]"
              />
              <div className="absolute -bottom-[22px] -right-[14px] hidden rounded-[var(--radius)] border border-border bg-surface p-4 shadow-[var(--shadow-md)] lg:block">
                <div className="flex items-center gap-2">
                  <HeartPulse size={26} className="bg-[image:var(--grad-accent)] bg-clip-text text-transparent" />
                  <div>
                    <strong className="block text-text">พร้อมช่วยเหลือ</strong>
                    <small className="text-text-muted">ตลอด 24 ชั่วโมง</small>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal direction="left">
              <span className="mb-3 inline-block text-sm font-bold tracking-[0.12em] text-accent-500 uppercase">ABOUT US</span>
              <h2 className="mb-3 text-2xl font-bold text-text">เกี่ยวกับหน่วยกู้ชีพ REH101</h2>
              <p className="text-text-muted">
                เราคือหน่วยบริการการแพทย์ฉุกเฉินที่มุ่งมั่นให้บริการช่วยเหลือผู้ป่วยฉุกเฉิน ณ จุดเกิดเหตุอย่างรวดเร็วและมีมาตรฐาน
                ด้วยทีมบุคลากรที่ผ่านการฝึกอบรมและอุปกรณ์การแพทย์ที่ทันสมัย
              </p>
              <div className="mt-6 flex flex-col gap-3.5">
                <div className="flex gap-3">
                  <BadgeCheck size={20} className="mt-0.5 shrink-0 text-primary-500" />
                  <div><strong className="text-text">ทีมกู้ชีพมืออาชีพ</strong> — EMT และ Paramedic ที่ผ่านการรับรอง</div>
                </div>
                <div className="flex gap-3">
                  <BadgeCheck size={20} className="mt-0.5 shrink-0 text-primary-500" />
                  <div><strong className="text-text">ตอบสนองรวดเร็ว</strong> — พร้อมออกปฏิบัติการทันทีเมื่อได้รับแจ้ง</div>
                </div>
                <div className="flex gap-3">
                  <BadgeCheck size={20} className="mt-0.5 shrink-0 text-primary-500" />
                  <div><strong className="text-text">อุปกรณ์ครบครัน</strong> — รถพยาบาลและเครื่องมือแพทย์มาตรฐาน</div>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------ Personnel --- */}
      {personnel.length > 0 && (
        <section className="py-[4.5rem]">
          <Container>
            <Reveal direction="up"><SectionTitle eyebrow="Our Team" title="ทีมบุคลากรของเรา" /></Reveal>
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {personnel.map((person, i) => (
                <Reveal key={person.id} direction="zoom" delay={(i % 4) * 100}>
                  <PersonnelCard person={person} />
                </Reveal>
              ))}
            </div>
            <Reveal direction="up" className="mt-8 text-center">
              <Link
                href="/personnel"
                className="inline-flex items-center rounded-[var(--radius)] border border-border bg-surface px-6 py-2.5 text-sm font-semibold text-text shadow-[var(--shadow-sm)] transition-colors hover:border-primary-500 hover:text-primary-500"
              >
                ดูบุคลากรทั้งหมด <ArrowRight size={16} className="ml-1.5" />
              </Link>
            </Reveal>
          </Container>
        </section>
      )}

      {/* -------------------------------------------------------- Gallery --- */}
      {galleries.length > 0 && (
        <section className="bg-bg-soft py-[4.5rem]">
          <Container>
            <Reveal direction="up"><SectionTitle eyebrow="Gallery" eyebrowClassName="bg-surface text-text" title="ภาพกิจกรรม" /></Reveal>
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

      {/* ------------------------------------------------------- CTA banner --- */}
      <section className="py-12">
        <Container>
          <Reveal direction="zoom" className="rounded-[var(--radius-xl)] bg-[image:var(--grad-hero)] p-8 text-center text-white shadow-[var(--shadow-lg)] lg:p-14">
            <h2 className="mb-2 text-2xl font-bold">เหตุฉุกเฉินทางการแพทย์?</h2>
            <p className="mb-6 opacity-90">อย่ารอช้า ทุกวินาทีมีค่า โทรสายด่วนได้ทันทีตลอด 24 ชั่วโมง</p>
            <a
              href={`tel:${emergencyPhone}`}
              className="inline-flex items-center rounded-[var(--radius)] bg-white px-8 py-3.5 text-base font-bold text-primary-700 shadow-[var(--shadow-md)] transition-transform hover:-translate-y-0.5"
            >
              <Phone size={18} className="mr-2" /> โทร {emergencyPhone}
            </a>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
