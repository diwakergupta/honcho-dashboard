import { describe, expect, test } from "bun:test";
import { cn, truncate, normalizeBaseURL } from "../src/lib/utils";

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

describe("normalizeBaseURL", () => {
  test("prepends http:// when scheme is omitted", () => {
    expect(normalizeBaseURL("localhost:3001")).toBe("http://localhost:3001");
    expect(normalizeBaseURL("127.0.0.1:8000")).toBe("http://127.0.0.1:8000");
  });

  test("strips trailing slashes", () => {
    expect(normalizeBaseURL("http://localhost:3001/")).toBe("http://localhost:3001");
    expect(normalizeBaseURL("localhost:3001///")).toBe("http://localhost:3001");
  });

  test("preserves existing https:// and http:// schemes", () => {
    expect(normalizeBaseURL("https://api.honcho.dev")).toBe("https://api.honcho.dev");
    expect(normalizeBaseURL("http://localhost:8000")).toBe("http://localhost:8000");
  });

  test("returns undefined for empty, null, or whitespace inputs", () => {
    expect(normalizeBaseURL("")).toBeUndefined();
    expect(normalizeBaseURL("   ")).toBeUndefined();
    expect(normalizeBaseURL(undefined)).toBeUndefined();
    expect(normalizeBaseURL(null)).toBeUndefined();
  });
});
