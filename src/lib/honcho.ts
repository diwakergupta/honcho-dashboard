import { Honcho } from "@honcho-ai/sdk";
import type {
  Page,
  Filters,
  Message,
  Peer,
  Session,
  Conclusion,
  QueueStatus,
} from "@honcho-ai/sdk";

export type { Message, Peer, Session, Conclusion, Page, Filters, QueueStatus };

export interface ListOptions {
  page?: number;
  size?: number;
  reverse?: boolean;
  filters?: Filters;
}

export interface SessionSummaryInfo {
  content: string;
  summaryType: string;
  createdAt: string;
  tokenCount?: number;
}

export interface SessionSummariesResult {
  shortSummary: SessionSummaryInfo | null;
  longSummary: SessionSummaryInfo | null;
}

export interface SessionContextResult {
  sessionId: string;
  messages: Message[];
  summary: SessionSummaryInfo | null;
  peerRepresentation: string | null;
  peerCard: string | null;
  length: number;
}

export interface PeerContextResult {
  peerId: string;
  targetId: string;
  representation: string | null;
  peerCard: string | null;
}

export interface PeerRepresentationOptions {
  target?: string;
  session?: string;
  searchQuery?: string;
  searchTopK?: number;
  includeMostFrequent?: boolean;
  maxConclusions?: number;
}

function summaryInfo(
  s:
    | { content: string; summaryType?: string; createdAt: string; tokenCount?: number }
    | null
    | undefined
): SessionSummaryInfo | null {
  if (!s) return null;
  return {
    content: s.content,
    summaryType: s.summaryType ?? "",
    createdAt: s.createdAt,
    tokenCount: s.tokenCount,
  };
}

function cardToString(card: string[] | string | null | undefined): string | null {
  if (card == null) return null;
  if (Array.isArray(card)) return card.join("\n");
  return String(card);
}

/**
 * A thin, testable wrapper around the Honcho SDK (v3 API). The SPA calls this
 * directly from the browser; the SDK handles transport/auth to the
 * self-hosted server.
 */
// Ensure global process.env exists in browser runtimes so the SDK does not throw
// ReferenceError when evaluating fallback environment variables (e.g. HONCHO_API_KEY).
if (typeof globalThis.process === "undefined") {
  (globalThis as unknown as { process: { env: Record<string, string | undefined> } }).process = {
    env: {},
  };
}

export class HonchoClient {
  private client: Honcho;

  constructor(apiKey?: string, baseURL?: string, workspaceId?: string) {
    if (typeof globalThis.process === "undefined") {
      (globalThis as unknown as { process: { env: Record<string, string | undefined> } }).process = {
        env: {},
      };
    }
    this.client = new Honcho({
      apiKey: apiKey?.trim() || undefined,
      baseURL: baseURL || undefined,
      workspaceId: workspaceId || undefined,
      maxRetries: 1,
      timeout: 180000,
    });
  }

  get workspaceId(): string {
    return this.client.workspaceId;
  }

  async workspaces(): Promise<string[]> {
    const page = await this.client.workspaces();
    return page.items;
  }

  async listPeers(options?: ListOptions): Promise<Page<Peer>> {
    return this.client.peers({
      page: options?.page,
      size: options?.size,
      reverse: options?.reverse,
      filters: options?.filters,
    });
  }

  async listSessions(options?: ListOptions): Promise<Page<Session>> {
    return this.client.sessions({
      page: options?.page,
      size: options?.size,
      reverse: options?.reverse,
      filters: options?.filters,
    });
  }

  async peer(id: string): Promise<Peer> {
    return this.client.peer(id);
  }

  async session(id: string): Promise<Session> {
    return this.client.session(id);
  }

  async peerChat(
    peerId: string,
    query: string,
    options?: {
      target?: string;
      session?: string;
      reasoningLevel?: "minimal" | "low" | "medium" | "high" | "max";
    }
  ): Promise<string | null> {
    const peer = await this.client.peer(peerId);
    const answer = await peer.chat(query, {
      target: options?.target as never,
      session: options?.session as never,
      reasoningLevel: options?.reasoningLevel,
    });
    return answer ?? null;
  }

  async peerRepresentation(
    peerId: string,
    options?: PeerRepresentationOptions
  ): Promise<string> {
    const peer = await this.client.peer(peerId);
    const rep = await peer.representation({
      session: options?.session as never,
      target: options?.target as never,
      searchQuery: options?.searchQuery,
      searchTopK: options?.searchTopK,
      includeMostFrequent: options?.includeMostFrequent,
      maxConclusions: options?.maxConclusions,
    });
    return rep ?? "";
  }

  async peerContext(
    peerId: string,
    options?: { target?: string }
  ): Promise<PeerContextResult> {
    const peer = await this.client.peer(peerId);
    const ctx = await peer.context({ target: options?.target as never });
    return {
      peerId: ctx.peerId ?? peerId,
      targetId: ctx.targetId ?? options?.target ?? "",
      representation: ctx.representation ?? null,
      peerCard: cardToString(ctx.peerCard),
    };
  }

  async peerCard(peerId: string, target?: string): Promise<string | null> {
    const peer = await this.client.peer(peerId);
    const card = await peer.getCard(target as never);
    return card ? card.join("\n") : null;
  }

  async peerSessions(peerId: string, options?: ListOptions): Promise<Page<Session>> {
    const peer = await this.client.peer(peerId);
    return peer.sessions({
      page: options?.page,
      size: options?.size,
      reverse: options?.reverse,
      filters: options?.filters,
    });
  }

  async peerSearch(
    peerId: string,
    query: string,
    options?: { limit?: number; filters?: Filters }
  ): Promise<Message[]> {
    const peer = await this.client.peer(peerId);
    return peer.search(query, { limit: options?.limit, filters: options?.filters });
  }

  async sessionPeers(sessionId: string): Promise<Peer[]> {
    const session = await this.client.session(sessionId);
    return session.peers();
  }

  async sessionMessages(
    sessionId: string,
    options?: ListOptions
  ): Promise<Page<Message>> {
    const session = await this.client.session(sessionId);
    return session.messages({
      page: options?.page,
      size: options?.size,
      reverse: options?.reverse,
      filters: options?.filters,
    });
  }

  async sessionContext(
    sessionId: string,
    options?: {
      summary?: boolean;
      tokens?: number;
      peerTarget?: string;
      peerPerspective?: string;
      limitToSession?: boolean;
    }
  ): Promise<SessionContextResult> {
    const session = await this.client.session(sessionId);
    const ctx = await session.context({
      summary: options?.summary,
      tokens: options?.tokens,
      peerTarget: options?.peerTarget as never,
      peerPerspective: options?.peerPerspective as never,
      limitToSession: options?.limitToSession,
    });
    return {
      sessionId: ctx.sessionId ?? sessionId,
      messages: ctx.messages,
      summary: summaryInfo(ctx.summary),
      peerRepresentation: ctx.peerRepresentation ?? null,
      peerCard: cardToString(ctx.peerCard),
      length: ctx.length,
    };
  }

  async sessionSummaries(sessionId: string): Promise<SessionSummariesResult> {
    const session = await this.client.session(sessionId);
    const s = await session.summaries();
    return {
      shortSummary: summaryInfo(s.shortSummary),
      longSummary: summaryInfo(s.longSummary),
    };
  }

  async sessionSearch(
    sessionId: string,
    query: string,
    options?: { limit?: number; filters?: Filters }
  ): Promise<Message[]> {
    const session = await this.client.session(sessionId);
    return session.search(query, { limit: options?.limit, filters: options?.filters });
  }

  async workspaceSearch(
    query: string,
    options?: { limit?: number; filters?: Filters }
  ): Promise<Message[]> {
    return this.client.search(query, { limit: options?.limit, filters: options?.filters });
  }

  async conclusionsOf(
    peerId: string,
    target: string,
    options?: { page?: number; size?: number; reverse?: boolean }
  ): Promise<Conclusion[]> {
    const peer = await this.client.peer(peerId);
    const page = await peer.conclusionsOf(target as never).list({
      page: options?.page,
      size: options?.size,
      reverse: options?.reverse,
    });
    return page.items;
  }

  async queueStatus(options?: {
    observer?: string;
    sender?: string;
    session?: string;
  }): Promise<QueueStatus> {
    return this.client.queueStatus({
      observer: options?.observer as never,
      sender: options?.sender as never,
      session: options?.session as never,
    });
  }

  async metadata(): Promise<Record<string, unknown>> {
    return this.client.getMetadata();
  }
}
