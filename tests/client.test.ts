import { describe, expect, test, mock } from "bun:test";

// Patch the SDK module *before* importing HonchoClient so its `new Honcho(...)`
// resolves to our fake. mock.module must run before the import of the module
// under test.
const calls: Array<{ method: string; args: unknown[] }> = [];

// Fakes mirror the ACTUAL installed SDK (v2.4.0 / v3-style) method surface:
//   client: peers, sessions, peer, session, workspaces, search,
//           queueStatus, getMetadata
//   peer:   chat, representation, context, getCard, sessions, search,
//           conclusionsOf
//   session: peers, messages, context, summaries, search
class FakePeer {
  id: string;
  constructor(id: string) {
    this.id = id;
  }
  async chat(query: string, opts?: unknown) {
    calls.push({ method: "peer.chat", args: [query, opts] });
    if (query === "empty") return null;
    return "answer from " + this.id;
  }
  async representation(_opts?: unknown) {
    calls.push({ method: "peer.representation", args: [] });
    return "rep of " + this.id;
  }
  async context(_opts?: unknown) {
    calls.push({ method: "peer.context", args: [] });
    return {
      peerId: this.id,
      targetId: "",
      representation: "ctx rep",
      peerCard: ["card line 1", "card line 2"],
    };
  }
  async getCard(_target?: unknown) {
    calls.push({ method: "peer.getCard", args: [] });
    return ["card a", "card b"];
  }
  async sessions(_opts?: unknown) {
    calls.push({ method: "peer.sessions", args: [] });
    return { items: [{ id: "s1" }], total: 1, page: 1, size: 50, pages: 1, hasNextPage: false };
  }
  async search(_q: string, _opts?: unknown) {
    calls.push({ method: "peer.search", args: [] });
    return [
      { id: "m1", peerId: this.id, content: "hi", createdAt: "", tokenCount: 3 },
    ];
  }
  conclusionsOf(target: string) {
    return {
      list: async (_opts?: unknown) => {
        calls.push({ method: "peer.conclusionsOf.list", args: [target] });
        return {
          items: [
            {
              id: "c1",
              content: "conclusion content",
              observerId: this.id,
              observedId: target,
              sessionId: "s1",
              level: "explicit",
              createdAt: "2024-01-01",
            },
          ],
          total: 1,
          page: 1,
          size: 50,
          pages: 1,
          hasNextPage: false,
        };
      },
      query: async () => [],
    };
  }
}

class FakeSession {
  id: string;
  constructor(id: string) {
    this.id = id;
  }
  async peers() {
    calls.push({ method: "session.peers", args: [] });
    return [{ id: "p1" }];
  }
  async messages(_o?: unknown) {
    calls.push({ method: "session.messages", args: [] });
    return {
      items: [
        { id: "m1", content: "hello", peerId: "p1", createdAt: "", tokenCount: 1 },
      ],
      total: 1,
      page: 1,
      size: 50,
      pages: 1,
      hasNextPage: false,
    };
  }
  async context(_o?: unknown) {
    calls.push({ method: "session.context", args: [] });
    return {
      sessionId: this.id,
      messages: [
        { id: "m1", content: "hello", peerId: "p1", createdAt: "", tokenCount: 1 },
      ],
      summary: { content: "sum", summaryType: "short", createdAt: "", tokenCount: 5 },
      peerRepresentation: "rep",
      peerCard: ["c1"],
      length: 10,
    };
  }
  async summaries() {
    calls.push({ method: "session.summaries", args: [] });
    return {
      shortSummary: {
        content: "short",
        summaryType: "short",
        createdAt: "",
        tokenCount: 2,
      },
      longSummary: null,
    };
  }
  async search(_q: string, _o?: unknown) {
    calls.push({ method: "session.search", args: [] });
    return [];
  }
}

class FakeHoncho {
  workspaceId: string;
  constructor(cfg: { apiKey?: string; workspaceId?: string }) {
    this.workspaceId = cfg.workspaceId ?? "default";
  }
  async peers(_o?: unknown) {
    calls.push({ method: "client.peers", args: [] });
    return {
      items: [new FakePeer("a"), new FakePeer("b")],
      total: 2,
      page: 1,
      size: 50,
      pages: 1,
      hasNextPage: false,
    };
  }
  async sessions(_o?: unknown) {
    calls.push({ method: "client.sessions", args: [] });
    return {
      items: [new FakeSession("s1")],
      total: 1,
      page: 1,
      size: 50,
      pages: 1,
      hasNextPage: false,
    };
  }
  async peer(id: string) {
    calls.push({ method: "client.peer", args: [id] });
    return new FakePeer(id);
  }
  async session(id: string) {
    calls.push({ method: "client.session", args: [id] });
    return new FakeSession(id);
  }
  async workspaces(_o?: unknown) {
    calls.push({ method: "client.workspaces", args: [] });
    return {
      items: ["w1", "w2"],
      total: 2,
      page: 1,
      size: 50,
      pages: 1,
      hasNextPage: false,
    };
  }
  async search(_q: string, _o?: unknown) {
    calls.push({ method: "client.search", args: [] });
    return [];
  }
  async queueStatus(_o?: unknown) {
    calls.push({ method: "client.queueStatus", args: [] });
    return {
      totalWorkUnits: 2,
      completedWorkUnits: 1,
      inProgressWorkUnits: 1,
      pendingWorkUnits: 0,
    };
  }
  async getMetadata() {
    calls.push({ method: "client.getMetadata", args: [] });
    return {};
  }
}

mock.module("@honcho-ai/sdk", () => ({
  Honcho: FakeHoncho,
}));

// Import after mocking so HonchoClient picks up the fake.
const { HonchoClient } = await import("../src/lib/honcho");

describe("HonchoClient", () => {
  test("exposes workspaceId from config", () => {
    const c = new HonchoClient("key", "http://x", "myws");
    expect(c.workspaceId).toBe("myws");
  });

  test("listPeers delegates to client.peers", async () => {
    const c = new HonchoClient("key");
    const page = await c.listPeers({ size: 10 });
    expect(page.items).toHaveLength(2);
    expect(calls.some((x) => x.method === "client.peers")).toBe(true);
  });

  test("workspaces unwraps the Page to a plain array", async () => {
    const c = new HonchoClient("key");
    const ws = await c.workspaces();
    expect(ws).toEqual(["w1", "w2"]);
    expect(calls.some((x) => x.method === "client.workspaces")).toBe(true);
  });

  test("peerContext joins peerCard array into a string", async () => {
    const c = new HonchoClient("key");
    const ctx = await c.peerContext("bob");
    expect(ctx.representation).toBe("ctx rep");
    expect(ctx.peerCard).toBe("card line 1\ncard line 2");
  });

  test("peerRepresentation returns the peer.representation string", async () => {
    const c = new HonchoClient("key");
    const rep = await c.peerRepresentation("bob");
    expect(rep).toBe("rep of bob");
    expect(calls.some((x) => x.method === "peer.representation")).toBe(true);
  });

  test("peerCard joins the string[] from peer.getCard", async () => {
    const c = new HonchoClient("key");
    const card = await c.peerCard("bob");
    expect(card).toBe("card a\ncard b");
  });

  test("peerChat returns the peer's chat answer", async () => {
    const c = new HonchoClient("key");
    const ans = await c.peerChat("bob", "who am i?");
    expect(ans).toBe("answer from bob");
  });

  test("peerChat returns null when peer returns no content", async () => {
    const c = new HonchoClient("key");
    const ans = await c.peerChat("bob", "empty");
    expect(ans).toBeNull();
  });

  test("peerChat passes target and reasoningLevel options", async () => {
    const c = new HonchoClient("key");
    await c.peerChat("bob", "query", { target: "alice", reasoningLevel: "high" });
    const lastCall = calls[calls.length - 1];
    expect(lastCall.method).toBe("peer.chat");
    expect(lastCall.args[0]).toBe("query");
    expect(lastCall.args[1]).toEqual({ target: "alice", session: undefined, reasoningLevel: "high" });
  });

  test("conclusionsOf returns the Conclusion list", async () => {
    const c = new HonchoClient("key");
    const obs = await c.conclusionsOf("bob", "target", { size: 5 });
    expect(obs).toHaveLength(1);
    expect(obs[0].sessionId).toBe("s1");
    expect(obs[0].level).toBe("explicit");
    expect(
      calls.some(
        (x) => x.method === "peer.conclusionsOf.list" && x.args[0] === "target"
      )
    ).toBe(true);
  });

  test("sessionContext passes through summary and representation", async () => {
    const c = new HonchoClient("key");
    const ctx = await c.sessionContext("s1", { summary: true, tokens: 100 });
    expect(ctx.summary?.content).toBe("sum");
    expect(ctx.peerRepresentation).toBe("rep");
    expect(ctx.peerCard).toBe("c1");
    expect(ctx.messages).toHaveLength(1);
  });

  test("sessionSummaries normalizes short summary and null long", async () => {
    const c = new HonchoClient("key");
    const s = await c.sessionSummaries("s1");
    expect(s.shortSummary?.content).toBe("short");
    expect(s.longSummary).toBeNull();
  });

  test("queueStatus returns the camelCase work-unit counts", async () => {
    const c = new HonchoClient("key");
    const status = await c.queueStatus();
    expect(status).toEqual({
      totalWorkUnits: 2,
      completedWorkUnits: 1,
      inProgressWorkUnits: 1,
      pendingWorkUnits: 0,
    });
    expect(calls.some((x) => x.method === "client.queueStatus")).toBe(true);
  });

  test("metadata delegates to client.getMetadata", async () => {
    const c = new HonchoClient("key");
    const md = await c.metadata();
    expect(md).toEqual({});
    expect(calls.some((x) => x.method === "client.getMetadata")).toBe(true);
  });
});
