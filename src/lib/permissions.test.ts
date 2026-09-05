import { describe, expect, it } from "vitest";
import { can, modulePermissions } from "./permissions";

describe("can()", () => {
  it("lets superadmin through every module, including ones absent from the map", () => {
    expect(can("superadmin", "user")).toBe(true);
    expect(can("superadmin", "some-module-that-does-not-exist")).toBe(true);
  });

  it("default-denies modules absent from the permissions map", () => {
    expect(can("admin", "some-module-that-does-not-exist")).toBe(false);
    expect(can("editor", "some-module-that-does-not-exist")).toBe(false);
  });

  it("restricts 'user' management to superadmin only", () => {
    expect(can("admin", "user")).toBe(false);
    expect(can("editor", "user")).toBe(false);
  });

  it("allows admin (but not editor) into contact and setting", () => {
    expect(can("admin", "contact")).toBe(true);
    expect(can("admin", "setting")).toBe(true);
    expect(can("editor", "contact")).toBe(false);
    expect(can("editor", "setting")).toBe(false);
  });

  it("allows editor into the shared content modules", () => {
    for (const moduleName of ["news", "category", "personnel", "gallery", "equipment"]) {
      expect(can("editor", moduleName)).toBe(true);
    }
  });

  it("matches the exact module set ported from the Laravel config/permissions.php", () => {
    expect(Object.keys(modulePermissions).sort()).toEqual(
      [
        "dashboard", "news", "category", "personnel", "structure", "station",
        "gallery", "course", "patientreport", "download", "banner", "equipment", "equipmentcategory",
        "equipmentborrow", "notification", "contact", "setting", "user",
      ].sort()
    );
  });
});
