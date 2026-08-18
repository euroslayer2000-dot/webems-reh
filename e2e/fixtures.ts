import type { Page } from "@playwright/test";

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.fill("#username", "admin");
  await page.fill("#password", "admin1234");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/admin/dashboard");
}
