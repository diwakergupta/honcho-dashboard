import { describe, expect, test, beforeEach } from "bun:test";
import { loadConfig, saveConfig, clearConfig } from "../src/lib/config";

// Bun provides a localStorage shim in the test runtime? No — it does not.
// These functions guard on typeof localStorage. In the Bun test env,
// localStorage is undefined, so we stub it.
const store = new Map<string, string>();
(globalThis as Record<string, unknown>).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};

beforeEach(() => store.clear());

describe("config", () => {
  test("saveConfig then loadConfig round-trips", () => {
    saveConfig({ apiKey: "honcho_abc", baseURL: "http://x", workspaceId: "w" });
    expect(loadConfig()).toEqual({
      apiKey: "honcho_abc",
      baseURL: "http://x",
      workspaceId: "w",
    });
  });

  test("loadConfig returns null when nothing saved", () => {
    expect(loadConfig()).toBeNull();
  });

  test("loadConfig returns config when apiKey is empty (unauthenticated Honcho)", () => {
    saveConfig({ apiKey: "", baseURL: "http://localhost:3001", workspaceId: "hermes" });
    expect(loadConfig()).toEqual({
      apiKey: "",
      baseURL: "http://localhost:3001",
      workspaceId: "hermes",
    });
  });

  test("clearConfig removes config", () => {
    saveConfig({ apiKey: "k" });
    clearConfig();
    expect(loadConfig()).toBeNull();
  });
});
