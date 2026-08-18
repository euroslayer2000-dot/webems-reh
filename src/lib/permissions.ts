export const ROLES = ["superadmin", "admin", "editor"] as const;
export type Role = (typeof ROLES)[number];

/**
 * Ported from the Laravel app's config/permissions.php: module slug -> allowed
 * roles. superadmin bypasses this map entirely (see `can` below), and modules
 * absent from the map default-deny for everyone else.
 */
export const modulePermissions: Record<string, Role[]> = {
  dashboard: ["superadmin", "admin", "editor"],

  news: ["superadmin", "admin", "editor"],
  category: ["superadmin", "admin", "editor"],
  personnel: ["superadmin", "admin", "editor"],
  structure: ["superadmin", "admin", "editor"],
  station: ["superadmin", "admin", "editor"],
  gallery: ["superadmin", "admin", "editor"],
  download: ["superadmin", "admin", "editor"],
  banner: ["superadmin", "admin", "editor"],
  equipment: ["superadmin", "admin", "editor"],
  equipmentcategory: ["superadmin", "admin", "editor"],
  equipmentborrow: ["superadmin", "admin", "editor"],
  notification: ["superadmin", "admin", "editor"],

  contact: ["superadmin", "admin"],
  setting: ["superadmin", "admin"],

  user: ["superadmin"],
};

export function can(role: Role, module: string): boolean {
  if (role === "superadmin") return true;
  const roles = modulePermissions[module];
  return roles ? roles.includes(role) : false;
}
