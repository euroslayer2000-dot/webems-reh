import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-6"
      style={{ background: "linear-gradient(120deg, #1a9c80 0%, #3aab8f 45%, #ff8fb3 130%)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.22), transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.16), transparent 45%)",
        }}
      />

      <div className="relative z-[2] w-full max-w-[420px] rounded-[var(--radius-xl)] border border-white/70 bg-white/96 p-10 shadow-[var(--shadow-lg)] backdrop-blur-[14px]">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 grid h-24 w-24 place-items-center overflow-hidden rounded-[14px] bg-white p-1 shadow-[var(--shadow-primary)]">
            <Image src="/assets/img/logoems.jpg" alt="EMS ROI-ET HOSPITAL" width={96} height={96} className="h-full w-full rounded-xl object-contain" />
          </span>
          <h1 className="mb-1 text-xl font-bold text-primary-700">เข้าสู่ระบบจัดการ</h1>
          <p className="text-sm text-[#5c7069]">EMS ROI-ET HOSPITAL</p>
        </div>

        <LoginForm next={next && next.startsWith("/admin") ? next : "/admin/dashboard"} />

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-[#5c7069] hover:text-primary-700">
            ← กลับหน้าเว็บไซต์
          </Link>
        </div>
      </div>
    </div>
  );
}
