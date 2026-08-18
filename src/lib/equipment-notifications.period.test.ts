import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { periodDateRange } from "./equipment-notifications";

describe("periodDateRange()", () => {
  // Wednesday 2026-08-19 12:00 local time.
  const FIXED_NOW = new Date(2026, 7, 19, 12, 0, 0);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("day: covers just today", () => {
    const range = periodDateRange("day")!;
    expect(range.gte.toDateString()).toBe(FIXED_NOW.toDateString());
    expect(range.lte.getHours()).toBe(23);
    expect(range.lte.getMinutes()).toBe(59);
  });

  it("week: Monday-start ISO week containing today", () => {
    const range = periodDateRange("week")!;
    expect(range.gte.getDay()).toBe(1); // Monday
    expect(range.lte.getDay()).toBe(0); // Sunday
    expect(range.gte.getDate()).toBe(17); // Mon 2026-08-17
    expect(range.lte.getDate()).toBe(23); // Sun 2026-08-23
  });

  it("month: first through last day of the current month", () => {
    const range = periodDateRange("month")!;
    expect(range.gte.getDate()).toBe(1);
    expect(range.gte.getMonth()).toBe(7); // August (0-indexed)
    expect(range.lte.getMonth()).toBe(7);
    expect(range.lte.getDate()).toBe(31);
  });

  it("year: Jan 1 through Dec 31 of the current year", () => {
    const range = periodDateRange("year")!;
    expect(range.gte.getMonth()).toBe(0);
    expect(range.gte.getDate()).toBe(1);
    expect(range.lte.getMonth()).toBe(11);
    expect(range.lte.getDate()).toBe(31);
  });

  it("all: no date filter", () => {
    expect(periodDateRange("all")).toBeNull();
  });
});
