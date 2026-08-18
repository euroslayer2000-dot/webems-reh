import type { ReactNode } from "react";

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-sm)] ${className}`}>
      {children}
    </div>
  );
}

export function AdminCardHead({ title, action }: { title: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
      <h2 className="font-bold text-text">{title}</h2>
      {action}
    </div>
  );
}

export function AdminCardBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
