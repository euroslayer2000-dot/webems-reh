import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./fixtures";

test.describe("admin login", () => {
  test("redirects unauthenticated visitors away from /admin/dashboard", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("rejects invalid credentials", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill("#username", "admin");
    await page.fill("#password", "wrong-password");
    await page.click('button[type="submit"]');
    await expect(page.getByText("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("logs in with valid credentials and reaches the dashboard", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByRole("heading", { name: "แดชบอร์ด", exact: true })).toBeVisible();
  });

  test("redirects an already-authenticated user away from the login page", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/login");
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test("logs out and blocks the dashboard again", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("button", { name: "ออกจากระบบ" }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
