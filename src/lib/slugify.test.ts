import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify()", () => {
  it("keeps Thai characters and separates words with hyphens", () => {
    expect(slugify("ประกาศรับสมัคร อาสาสมัคร")).toBe("ประกาศรับสมัคร-อาสาสมัคร");
  });

  it("lowercases Latin characters", () => {
    expect(slugify("EMT-B Training")).toBe("emt-b-training");
  });

  it("collapses repeated separators and trims leading/trailing hyphens", () => {
    expect(slugify("  hello   world  ")).toBe("hello-world");
    expect(slugify("/hello/world/")).toBe("hello-world");
  });

  it("strips punctuation that isn't a letter, digit, or separator", () => {
    expect(slugify("hello, world! (test)")).toBe("hello-world-test");
  });

  it("falls back to a random item- slug for input with nothing sluggable", () => {
    expect(slugify("!!!")).toMatch(/^item-[0-9a-f]{8}$/);
  });
});
