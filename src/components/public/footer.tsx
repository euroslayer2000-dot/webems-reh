import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Globe, Mail, MapPin, MessageCircle, Phone, Video } from "lucide-react";

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
                <Globe size={16} />
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
                <Video size={16} />
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
          <span className="opacity-75">พัฒนาระบบด้วย Next.js</span>
        </div>
      </div>
    </footer>
  );
}
