import { HonchoClient } from "./honcho";
import { loadConfig } from "./config";

let client: HonchoClient | null = null;

export function getClient(): HonchoClient {
  if (client) return client;
  const config = loadConfig();
  if (!config) throw new Error("Not authenticated. Call connect() first.");
  client = new HonchoClient(config.apiKey, config.baseURL, config.workspaceId);
  return client;
}

export function setClient(newClient: HonchoClient): void {
  client = newClient;
}

export function resetClient(): void {
  client = null;
}

export function connect(apiKey?: string, baseURL?: string, workspaceId?: string): HonchoClient {
  const c = new HonchoClient(apiKey, baseURL, workspaceId);
  client = c;
  return c;
}
