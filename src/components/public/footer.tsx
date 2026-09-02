import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

function FacebookIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a2.994 2.994 0 0 0-2.107-2.117C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.391.524A2.994 2.994 0 0 0 .502 6.186 31.26 31.26 0 0 0 0 12a31.26 31.26 0 0 0 .502 5.814 2.994 2.994 0 0 0 2.107 2.117c1.886.524 9.391.524 9.391.524s7.505 0 9.391-.524a2.994 2.994 0 0 0 2.107-2.117A31.26 31.26 0 0 0 24 12a31.26 31.26 0 0 0-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function Footer({ settings }: { settings: Record<string, string> }) {
  const siteName = settings.site_name || "หน่วยกู้ชีพ REH101";
  const tagline = settings.site_tagline || "บริการการแพทย์ฉุกเฉิน ด้วยหัวใจ ตลอด 24 ชั่วโมง";
  const emergencyPhone = settings.emergency_phone || "1669";
  const buddhistYear = new Date().getFullYear() + 543;

  const linkClass = "text-[#c9d6d0] transition-[color,padding-left] hover:pl-[5px] hover:text-accent-300";

  return (
    <footer className="mt-16 bg-[#0d1b17] pt-14 text-[#c9d6d0] dark:bg-[#08110e]">
      <div className="mx-auto grid max-w-[1180px] gap-10 px-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-3.5 flex items-center gap-2.5">
            <Image
              src="/assets/img/logoems.jpg"
              alt={siteName}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
            <h2 className="text-base font-bold text-white">{siteName}</h2>
          </div>
          <p className="text-sm">{tagline}</p>
          <div className="mt-4 flex gap-2">
            {settings.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="grid h-10 w-10 place-items-center rounded-xl bg-white/8 text-white transition-all hover:-translate-y-[3px] hover:bg-[image:var(--grad-accent)]"
              >
                <FacebookIcon />
              </a>
            )}
            {settings.line && (
              <a
                href={settings.line}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Line"
                className="grid h-10 w-10 place-items-center rounded-xl bg-white/8 text-white transition-all hover:-translate-y-[3px] hover:bg-[image:var(--grad-accent)]"
              >
                <MessageCircle size={16} />
              </a>
            )}
            {settings.youtube && (
              <a
                href={settings.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="grid h-10 w-10 place-items-center rounded-xl bg-white/8 text-white transition-all hover:-translate-y-[3px] hover:bg-[image:var(--grad-accent)]"
              >
                <YoutubeIcon />
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-[1.1rem] font-bold text-white">เมนูลัด</h3>
          <ul className="grid gap-3 text-sm">
            <li><Link href="/news" className={linkClass}>ข่าวสาร</Link></li>
            <li><Link href="/personnel" className={linkClass}>บุคลากร</Link></li>
            <li><Link href="/gallery" className={linkClass}>แกลเลอรี</Link></li>
            <li><Link href="/download" className={linkClass}>ดาวน์โหลด</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-[1.1rem] font-bold text-white">บริการ</h3>
          <ul className="grid gap-3 text-sm">
            <li><Link href="/contact" className={linkClass}>ติดต่อเรา</Link></li>
            <li><a href={`tel:${emergencyPhone}`} className={linkClass}>สายด่วนฉุกเฉิน</a></li>
            <li><Link href="/admin/login" className={linkClass}>เข้าสู่ระบบ</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-[1.1rem] font-bold text-white">ติดต่อเรา</h3>
          <ul className="grid gap-3 text-sm">
            <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0" />{settings.address || "-"}</li>
            <li className="flex gap-2"><Phone size={16} className="mt-0.5 shrink-0" />{settings.office_phone || "-"}</li>
            <li className="flex gap-2"><Mail size={16} className="mt-0.5 shrink-0" />{settings.email || "-"}</li>
            <li className="flex gap-2 font-bold text-warning">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              ฉุกเฉิน โทร {emergencyPhone}
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-white/10 px-4 py-[1.3rem]">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-2 text-[0.85rem] md:flex-row">
          <span>© {buddhistYear} {siteName}. สงวนลิขสิทธิ์.</span>
        </div>
      </div>
    </footer>
  );
}
