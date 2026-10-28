import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./fixtures";

const CODE = "E2E-TEST-EQ";
const EQUIPMENT_NAME = "ครุภัณฑ์ทดสอบ E2E";
const BORROWER = "ผู้ยืมทดสอบ E2E";

test.describe("equipment borrow/return lifecycle", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test.afterEach(async ({ page }) => {
    // Best-effort cleanup: delete any leftover loan first (equipment can't be
    // deleted while a loan is open), then the equipment record itself.
    await page.goto("/admin/equipment-borrow");
    const loanRow = page.locator("tr", { hasText: BORROWER });
    if (await loanRow.count()) {
      page.once("dialog", (d) => d.accept());
      await loanRow.getByRole("button", { name: "ลบ" }).click();
      await page.waitForLoadState("networkidle");
    }

    await page.goto("/admin/equipment");
    const equipmentRow = page.locator("tr", { hasText: CODE });
    if (await equipmentRow.count()) {
      page.once("dialog", (d) => d.accept());
      await equipmentRow.getByRole("button", { name: "ลบ" }).click();
    }
  });

  test("borrowing flips equipment to borrowed; returning flips it back", async ({ page }) => {
    await page.goto("/admin/equipment/create");
    await page.fill("#code", CODE);
    await page.fill("#name", EQUIPMENT_NAME);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/admin/equipment");
    await expect(page.locator("tr", { hasText: CODE })).toBeVisible();

    await page.goto("/admin/equipment-borrow/create");
    await page.selectOption("#equipment_id", { label: await page.locator("#equipment_id option", { hasText: CODE }).innerText() });
    await page.fill("#borrower_name", BORROWER);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/admin/equipment-borrow");
    await expect(page.locator("tr", { hasText: BORROWER })).toBeVisible();

    await page.goto("/admin/equipment");
    await expect(page.locator("tr", { hasText: CODE }).getByText("ถูกยืม")).toBeVisible();

    // Can't delete equipment while a loan is open.
    page.once("dialog", (d) => d.accept());
    await page.locator("tr", { hasText: CODE }).getByRole("button", { name: "ลบ" }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("มีการยืมค้างอยู่")).toBeVisible();
    await expect(page.locator("tr", { hasText: CODE })).toBeVisible();

    // Return it.
    await page.goto("/admin/equipment-borrow");
    await page.locator("tr", { hasText: BORROWER }).getByRole("button", { name: "รับคืน" }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("tr", { hasText: BORROWER }).getByText("คืนแล้ว")).toBeVisible();

    await page.goto("/admin/equipment");
    await expect(page.locator("tr", { hasText: CODE }).getByText("พร้อมใช้งาน")).toBeVisible();
  });

  test("QR request: public submits, admin approves; return is admin-only", async ({ page, browser }) => {
    await page.goto("/admin/equipment/create");
    await page.fill("#code", CODE);
    await page.fill("#name", EQUIPMENT_NAME);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/admin/equipment");

    // Anonymous visitor scanning the QR code.
    const anon = await (await browser.newContext()).newPage();
    await anon.goto(`/equipment/show/${CODE}`);
    await anon.getByRole("button", { name: "ขอยืมครุภัณฑ์ชิ้นนี้" }).click();
    await anon.fill("#borrower_name", BORROWER);
    await anon.fill("#borrower_contact", "0812345678");
    await anon.getByRole("button", { name: "ส่งคำร้อง" }).click();
    await expect(anon.getByText("ส่งคำร้องขอยืมเรียบร้อยแล้ว")).toBeVisible();

    // Still available until an admin approves.
    await page.goto("/admin/equipment");
    await expect(page.locator("tr", { hasText: CODE }).getByText("พร้อมใช้งาน")).toBeVisible();

    await page.goto("/admin/equipment-borrow");
    page.once("dialog", (d) => d.accept());
    await page.locator("tr", { hasText: BORROWER }).getByRole("button", { name: "อนุมัติ" }).click();
    await page.waitForLoadState("networkidle");

    await page.goto("/admin/equipment");
    await expect(page.locator("tr", { hasText: CODE }).getByText("ถูกยืม")).toBeVisible();

    // The public page offers no way to borrow or return once it's on loan.
    await anon.reload();
    await expect(anon.getByText("ไม่พร้อมให้ยืมในขณะนี้")).toBeVisible();
  });
});
