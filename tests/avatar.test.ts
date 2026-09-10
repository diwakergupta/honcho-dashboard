import { describe, expect, test } from "bun:test";
import { getPeerInitials, getPeerPalette, hashString } from "../src/lib/avatar";

describe("avatar utils", () => {
  describe("hashString", () => {
    test("hashes strings deterministically", () => {
      expect(hashString("alice")).toBe(hashString("alice"));
      expect(hashString("bob")).toBe(hashString("bob"));
      expect(hashString("alice")).not.toBe(hashString("bob"));
    });
  });

  describe("getPeerPalette", () => {
    test("returns a valid palette with required color classes", () => {
      const palette = getPeerPalette("alice");
      expect(palette).toHaveProperty("bg");
      expect(palette).toHaveProperty("border");
      expect(palette).toHaveProperty("text");
      expect(palette).toHaveProperty("gradient");
    });

    test("returns consistent palette for the same peerId", () => {
      expect(getPeerPalette("agent-01")).toEqual(getPeerPalette("agent-01"));
    });
  });

  describe("getPeerInitials", () => {
    test("returns two-letter initials for single words", () => {
      expect(getPeerInitials("assistant")).toBe("AS");
      expect(getPeerInitials("user")).toBe("US");
    });

    test("returns first letters of multi-word separated IDs", () => {
      expect(getPeerInitials("agent-alpha")).toBe("AA");
      expect(getPeerInitials("coder_bot")).toBe("CB");
      expect(getPeerInitials("super.user")).toBe("SU");
    });

    test("handles empty or falsy strings gracefully", () => {
      expect(getPeerInitials("")).toBe("?");
    });
  });
});
