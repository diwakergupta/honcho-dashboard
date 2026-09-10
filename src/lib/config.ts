export interface DashConfig {
  apiKey?: string;
  baseURL?: string;
  workspaceId?: string;
}

const KEY = "honcho.config.v1";

export function loadConfig(): DashConfig | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DashConfig;
    if (typeof parsed !== "object" || parsed === null) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveConfig(config: DashConfig): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(config));
}

export function clearConfig(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(KEY);
}
