const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

/** e.g. "10 กรกฎาคม 2569" — Buddhist Era year, matches format_date_th() in the Laravel app. */
export function formatDateTh(date: Date | string | null | undefined, withTime = false): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "-";

  const result = `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
  if (!withTime) return result;

  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${result} เวลา ${hh}:${mm} น.`;
}

/** Strips HTML and truncates to `length` chars, matching str_excerpt() in the Laravel app. */
export function strExcerpt(html: string | null | undefined, length = 120): string {
  const text = (html ?? "").replace(/<[^>]*>/g, "").trim();
  if (text.length <= length) return text;
  return `${text.slice(0, length)}…`;
}

export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${Math.round(value * 10) / 10} ${units[i]}`;
}

type StationType = "ALS" | "BLS";

const STATION_TYPE_META: Record<StationType, { label: string; short: string; color: string }> = {
  ALS: { label: "หน่วย ALS (Advanced Life Support)", short: "ALS", color: "#e5342b" },
  BLS: { label: "หน่วย BLS (Basic Life Support)", short: "BLS", color: "#f4b400" },
};

export function stationTypeMeta(type: string) {
  return STATION_TYPE_META[type as StationType] ?? STATION_TYPE_META.ALS;
}
