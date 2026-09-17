export const EQUIPMENT_AUTO_CODE_PREFIX = "NOCODE-";

export function isAutoEquipmentCode(code: string): boolean {
  return code.startsWith(EQUIPMENT_AUTO_CODE_PREFIX);
}
