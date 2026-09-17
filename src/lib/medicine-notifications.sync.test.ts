import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  medicineBatch: { findMany: vi.fn() },
  medicine: { findMany: vi.fn() },
  medicineNotification: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
};

vi.mock("./prisma", () => ({ prisma: prismaMock }));

// Import after the mock is registered so the module under test picks it up.
const { syncMedicineAlerts } = await import("./medicine-notifications");

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

const BASE_BATCH = {
  id: 1,
  medicine_id: 10,
  lot_no: "LOT-1",
  quantity_on_hand: 5,
  medicine: { generic_name: "พาราเซตามอล", unit: "เม็ด" },
};

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.medicine.findMany.mockResolvedValue([]);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("syncMedicineAlerts() — expiry sweep", () => {
  it("creates a medicine_expiring notification for a batch expiring within the window", async () => {
    prismaMock.medicineBatch.findMany.mockResolvedValue([{ ...BASE_BATCH, expiry_date: daysFromNow(30) }]);
    prismaMock.medicineNotification.findUnique.mockResolvedValue(null);

    await syncMedicineAlerts(90);

    expect(prismaMock.medicineNotification.create).toHaveBeenCalledTimes(1);
    const data = prismaMock.medicineNotification.create.mock.calls[0][0].data;
    expect(data.type).toBe("medicine_expiring");
    expect(data.level).toBe("due_soon");
    expect(data.medicine_batch_id).toBe(1);
    expect(data.is_read).toBe(false);
  });

  it("creates a medicine_expired notification for a batch already past expiry", async () => {
    prismaMock.medicineBatch.findMany.mockResolvedValue([{ ...BASE_BATCH, expiry_date: daysFromNow(-5) }]);
    prismaMock.medicineNotification.findUnique.mockResolvedValue(null);

    await syncMedicineAlerts(90);

    const data = prismaMock.medicineNotification.create.mock.calls[0][0].data;
    expect(data.type).toBe("medicine_expired");
    expect(data.level).toBe("overdue");
    expect(data.message).toContain("หมดอายุแล้ว 5 วัน");
  });

  it("leaves an existing notification untouched when the level hasn't changed", async () => {
    prismaMock.medicineBatch.findMany.mockResolvedValue([{ ...BASE_BATCH, expiry_date: daysFromNow(30) }]);
    prismaMock.medicineNotification.findUnique.mockResolvedValue({ id: 99, level: "due_soon", is_read: true });

    await syncMedicineAlerts(90);

    expect(prismaMock.medicineNotification.create).not.toHaveBeenCalled();
    expect(prismaMock.medicineNotification.update).not.toHaveBeenCalled();
  });

  it("escalates due_soon -> overdue and resets is_read to false as a batch crosses its expiry date", async () => {
    prismaMock.medicineBatch.findMany.mockResolvedValue([{ ...BASE_BATCH, expiry_date: daysFromNow(-1) }]);
    prismaMock.medicineNotification.findUnique.mockResolvedValue({ id: 99, level: "due_soon", is_read: true });

    await syncMedicineAlerts(90);

    expect(prismaMock.medicineNotification.update).toHaveBeenCalledWith({
      where: { id: 99 },
      data: expect.objectContaining({ level: "overdue", is_read: false }),
    });
  });

  it("clears a stale expiring-type row before writing the expired-type row for the same batch", async () => {
    prismaMock.medicineBatch.findMany.mockResolvedValue([{ ...BASE_BATCH, expiry_date: daysFromNow(-1) }]);
    prismaMock.medicineNotification.findUnique.mockResolvedValue(null);

    await syncMedicineAlerts(90);

    expect(prismaMock.medicineNotification.deleteMany).toHaveBeenCalledWith({
      where: {
        medicine_batch_id: 1,
        type: { in: ["medicine_expiring", "medicine_expired"] },
        NOT: { type: "medicine_expired" },
      },
    });
  });

  it("purges expiry notifications for batches that are depleted or no longer within the window", async () => {
    prismaMock.medicineBatch.findMany.mockResolvedValue([]);

    await syncMedicineAlerts(90);

    expect(prismaMock.medicineNotification.deleteMany).toHaveBeenLastCalledWith({
      where: {
        type: { in: ["medicine_expiring", "medicine_expired"] },
        medicine_batch: { OR: [{ quantity_on_hand: 0 }, { expiry_date: { gt: expect.any(Date) } }] },
      },
    });
  });
});

describe("syncMedicineAlerts() — low stock sweep", () => {
  const BASE_MEDICINE = { id: 10, generic_name: "พาราเซตามอล", unit: "เม็ด", min_stock: 20 };

  beforeEach(() => {
    prismaMock.medicineBatch.findMany.mockResolvedValue([]);
  });

  it("creates a due_soon low-stock notification when qty is below min_stock but nonzero", async () => {
    prismaMock.medicine.findMany.mockResolvedValue([{ ...BASE_MEDICINE, batches: [{ quantity_on_hand: 5 }] }]);
    prismaMock.medicineNotification.findUnique.mockResolvedValue(null);

    await syncMedicineAlerts(90);

    const data = prismaMock.medicineNotification.create.mock.calls[0][0].data;
    expect(data.type).toBe("medicine_low_stock");
    expect(data.level).toBe("due_soon");
    expect(data.medicine_id).toBe(10);
  });

  it("creates an overdue low-stock notification when qty is exactly zero", async () => {
    prismaMock.medicine.findMany.mockResolvedValue([{ ...BASE_MEDICINE, batches: [] }]);
    prismaMock.medicineNotification.findUnique.mockResolvedValue(null);

    await syncMedicineAlerts(90);

    const data = prismaMock.medicineNotification.create.mock.calls[0][0].data;
    expect(data.level).toBe("overdue");
  });

  it("does not flag a medicine with no min_stock configured", async () => {
    prismaMock.medicine.findMany.mockResolvedValue([{ ...BASE_MEDICINE, min_stock: 0, batches: [] }]);

    await syncMedicineAlerts(90);

    expect(prismaMock.medicineNotification.create).not.toHaveBeenCalled();
  });

  it("deletes an existing low-stock notification once stock recovers above min_stock", async () => {
    prismaMock.medicine.findMany.mockResolvedValue([{ ...BASE_MEDICINE, batches: [{ quantity_on_hand: 50 }] }]);
    prismaMock.medicineNotification.findUnique.mockResolvedValue({ id: 77, level: "due_soon" });

    await syncMedicineAlerts(90);

    expect(prismaMock.medicineNotification.delete).toHaveBeenCalledWith({ where: { id: 77 } });
    expect(prismaMock.medicineNotification.create).not.toHaveBeenCalled();
  });
});
