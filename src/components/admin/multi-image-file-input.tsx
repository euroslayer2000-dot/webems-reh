"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { inputClass } from "./form-field";

export function MultiImageFileInput({ id, name, label }: { id?: string; name: string; label: string }) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    previews.forEach((url) => URL.revokeObjectURL(url));
    const files = Array.from(e.target.files ?? []);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  }

  return (
    <div className="min-w-[240px] flex-1">
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-text">
        {label}
      </label>
      <input id={id} name={name} type="file" accept="image/*" multiple onChange={handleChange} className={inputClass} />
      {previews.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {previews.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- object URL preview, next/image can't optimize it
            <img key={i} src={src} alt="" className="h-16 w-16 rounded-lg border border-border object-cover" />
          ))}
        </div>
      )}
    </div>
  );
}
