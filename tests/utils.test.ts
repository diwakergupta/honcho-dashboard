import { describe, expect, test } from "bun:test";
import { cn, truncate } from "../src/lib/utils";

describe("cn", () => {
  test("merges className with tailwind-merge", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
  test("keeps non-conflicting classes", () => {
    expect(cn("px-2", "text-red-500")).toBe("px-2 text-red-500");
  });
});

describe("truncate", () => {
  test("returns short strings unchanged", () => {
    expect(truncate("hi", 5)).toBe("hi");
  });
  test("truncates long strings with an ellipsis", () => {
    expect(truncate("abcdefghij", 4)).toBe("abc…");
  });
});
