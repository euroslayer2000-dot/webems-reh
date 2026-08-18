import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  equipmentBorrow: { findMany: vi.fn() },
  notification: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
};

vi.mock("./prisma", () => ({ prisma: prismaMock }));

// Import after the mock is registered so the module under test picks it up.
const { syncEquipmentDueSoon } = await import("./equipment-notifications");

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

const BASE_LOAN = {
  id: 1,
  equipment_id: 10,
  borrower_name: "ทดสอบ ผู้ยืม",
  equipment: { name: "เครื่องทดสอบ" },
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("syncEquipmentDueSoon()", () => {
  it("creates a new due_soon notification for a loan due within the window", async () => {
    prismaMock.equipmentBorrow.findMany.mockResolvedValue([{ ...BASE_LOAN, due_date: daysFromNow(2) }]);
    prismaMock.notification.findUnique.mockResolvedValue(null);

    await syncEquipmentDueSoon(3);

    expect(prismaMock.notification.create).toHaveBeenCalledTimes(1);
    const data = prismaMock.notification.create.mock.calls[0][0].data;
    expect(data.level).toBe("due_soon");
    expect(data.borrow_id).toBe(1);
    expect(data.is_read).toBe(false);
    expect(data.message).toContain("ทดสอบ ผู้ยืม");
  });

  it("creates a new overdue notification for a loan already past due", async () => {
    prismaMock.equipmentBorrow.findMany.mockResolvedValue([{ ...BASE_LOAN, due_date: daysFromNow(-2) }]);
    prismaMock.notification.findUnique.mockResolvedValue(null);

    await syncEquipmentDueSoon(3);

    const data = prismaMock.notification.create.mock.calls[0][0].data;
    expect(data.level).toBe("overdue");
    expect(data.message).toContain("เกินกำหนดแล้ว 2 วัน");
  });

  it("leaves an existing notification untouched when the level hasn't changed", async () => {
    prismaMock.equipmentBorrow.findMany.mockResolvedValue([{ ...BASE_LOAN, due_date: daysFromNow(2) }]);
    prismaMock.notification.findUnique.mockResolvedValue({ id: 99, level: "due_soon", is_read: true });

    await syncEquipmentDueSoon(3);

    expect(prismaMock.notification.create).not.toHaveBeenCalled();
    expect(prismaMock.notification.update).not.toHaveBeenCalled();
  });

  it("escalates due_soon -> overdue and resets is_read to false", async () => {
    prismaMock.equipmentBorrow.findMany.mockResolvedValue([{ ...BASE_LOAN, due_date: daysFromNow(-1) }]);
    prismaMock.notification.findUnique.mockResolvedValue({ id: 99, level: "due_soon", is_read: true });

    await syncEquipmentDueSoon(3);

    expect(prismaMock.notification.update).toHaveBeenCalledWith({
      where: { id: 99 },
      data: expect.objectContaining({ level: "overdue", is_read: false }),
    });
  });

  it("purges notifications for returned or due_date-less loans", async () => {
    prismaMock.equipmentBorrow.findMany.mockResolvedValue([]);

    await syncEquipmentDueSoon(3);

    expect(prismaMock.notification.deleteMany).toHaveBeenCalledWith({
      where: {
        type: "equipment_borrow_due",
        borrow: { OR: [{ return_date: { not: null } }, { due_date: null }] },
      },
    });
  });
});
