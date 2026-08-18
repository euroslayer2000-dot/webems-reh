import type { ReactNode } from "react";

export function PageHead({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-text">{title}</h1>
        {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
