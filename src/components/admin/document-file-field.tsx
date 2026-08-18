import { FileText } from "lucide-react";
import { FormField, inputClass } from "./form-field";

export function DocumentFileField({
  label,
  id,
  name,
  currentUrl,
  accept = ".pdf,image/*",
  required,
  error,
}: {
  label: string;
  id: string;
  name: string;
  currentUrl?: string | null;
  accept?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <FormField label={label} htmlFor={id} required={required} error={error}>
      {currentUrl && (
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:underline"
        >
          <FileText size={13} /> ไฟล์ปัจจุบัน — เปิดดู
        </a>
      )}
      <input id={id} name={name} type="file" accept={accept} className={inputClass} />
    </FormField>
  );
}
