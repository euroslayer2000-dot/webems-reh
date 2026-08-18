import Link from "next/link";
import type { LucideIcon } from "lucide-react";

const COLOR_CLASS = {
  green: "bg-[image:var(--grad-primary)]",
  pink: "bg-[image:var(--grad-accent)]",
  blue: "bg-[linear-gradient(135deg,#3b82f6,#2563eb)]",
  orange: "bg-[linear-gradient(135deg,#f5a623,#e8890b)]",
  red: "bg-[linear-gradient(135deg,#e5484d,#c53a3e)]",
} as const;

export function StatCard({
  icon: Icon,
  value,
  label,
  color,
  href,
  breakdown,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
  color: keyof typeof COLOR_CLASS;
  href?: string;
  breakdown?: { label: string; value: number }[];
}) {
  const content = (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
      <div className={`grid h-[54px] w-[54px] place-items-center rounded-2xl text-white ${COLOR_CLASS[color]}`}>
        <Icon size={22} />
      </div>
      <div className="mt-3 text-2xl font-extrabold leading-none text-text">{value.toLocaleString("th-TH")}</div>
      <div className="mt-1 text-sm text-text-muted">{label}</div>
      {breakdown && breakdown.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {breakdown.map((b) => (
            <span key={b.label} className="rounded-full bg-bg-soft px-2 py-0.5 text-[11px] font-medium text-text-muted">
              {b.label} {b.value.toLocaleString("th-TH")}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
