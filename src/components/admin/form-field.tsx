import type { ReactNode } from "react";

export function FormField({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-semibold text-text">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-sm text-text focus:border-primary-500 focus:outline-none focus:shadow-[0_0_0_0.2rem_rgba(31,138,112,0.18)]";
