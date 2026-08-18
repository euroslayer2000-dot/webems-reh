import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./fixtures";

const TITLE = "E2E ทดสอบข่าว (ลบอัตโนมัติ)";

test.describe("admin news CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test.afterEach(async ({ page }) => {
    // Best-effort cleanup so a failed assertion mid-test doesn't leave data behind.
    await page.goto("/admin/news");
    const row = page.locator("tr", { hasText: TITLE });
    if (await row.count()) {
      page.once("dialog", (d) => d.accept());
      await row.getByRole("button", { name: "ลบ" }).click();
    }
  });

  test("creates, publishes, and deletes a news article", async ({ page }) => {
    await page.goto("/admin/news/create");
    await page.fill("#title", TITLE);
    await page.fill("#excerpt", "สรุปย่อสำหรับ E2E test");

    const editor = page.locator(".ck-editor__editable");
    await editor.click();
    await page.keyboard.type("เนื้อหาทดสอบจาก Playwright E2E");
    await page.selectOption("#status", "published");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/admin/news**");
    const row = page.locator("tr", { hasText: TITLE });
    await expect(row).toBeVisible();
    await expect(row.getByText("เผยแพร่")).toBeVisible();

    // Public site should now show it.
    await page.goto("/news");
    await expect(page.getByText(TITLE)).toBeVisible();

    // Toggle back to draft and confirm it disappears from the public list.
    await page.goto("/admin/news");
    await page.locator("tr", { hasText: TITLE }).getByRole("button", { name: "เป็นร่าง" }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("tr", { hasText: TITLE }).getByText("แบบร่าง")).toBeVisible();

    await page.goto("/news");
    await expect(page.getByText(TITLE)).not.toBeVisible();

    // Delete and confirm removal.
    page.once("dialog", (d) => d.accept());
    await page.goto("/admin/news");
    await page.locator("tr", { hasText: TITLE }).getByRole("button", { name: "ลบ" }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("tr", { hasText: TITLE })).toHaveCount(0);
  });
});
