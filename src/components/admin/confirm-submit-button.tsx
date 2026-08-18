"use client";

import type { ReactNode } from "react";

/** Wraps a Server Action `<form>` so submission requires a confirm() first —
 * a lightweight stand-in for the original app's SweetAlert2 confirm dialogs. */
export function ConfirmSubmitButton({
  confirmText,
  className,
  children,
}: {
  confirmText: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
