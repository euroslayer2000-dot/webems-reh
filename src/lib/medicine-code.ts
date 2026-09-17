export const MEDICINE_AUTO_CODE_PREFIX = "NOCODE-";

export function isAutoMedicineCode(code: string): boolean {
  return code.startsWith(MEDICINE_AUTO_CODE_PREFIX);
}
