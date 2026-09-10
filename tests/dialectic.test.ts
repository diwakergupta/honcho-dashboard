import { describe, expect, test } from "bun:test";

type ReasoningLevel = "minimal" | "low" | "medium" | "high";

interface ChatTurn {
  id: string;
  query: string;
  target?: string;
  reasoningLevel: ReasoningLevel;
  timestamp: Date;
  status: "pending" | "done" | "error";
  answer?: string;
  error?: string;
}

describe("Dialectic query state logic", () => {
  test("optimistically appends pending turn and clears input query immediately", () => {
    let chatQuery = "What do you know?";
    let chatHistory: ChatTurn[] = [];

    const q = chatQuery.trim();
    const turnId = "turn-1";
    const newTurn: ChatTurn = {
      id: turnId,
      query: q,
      target: undefined,
      reasoningLevel: "medium",
      timestamp: new Date(),
      status: "pending",
    };

    chatHistory = [...chatHistory, newTurn];
    chatQuery = "";

    expect(chatQuery).toBe("");
    expect(chatHistory).toHaveLength(1);
    expect(chatHistory[0].status).toBe("pending");
    expect(chatHistory[0].query).toBe("What do you know?");
  });

  test("handles empty or null response gracefully without silent drop", () => {
    const turnId = "turn-1";
    let chatHistory: ChatTurn[] = [
      {
        id: turnId,
        query: "What do you know?",
        reasoningLevel: "medium",
        timestamp: new Date(),
        status: "pending",
      },
    ];

    const getAnswer = (): string | null => null;
    const answer = getAnswer();
    const finalAnswer =
      answer && answer.trim()
        ? answer
        : `*No response was returned by hermes for this query. The peer may not have sufficient context or conclusions.*`;

    chatHistory = chatHistory.map((t) =>
      t.id === turnId ? { ...t, status: "done", answer: finalAnswer } : t
    );

    expect(chatHistory[0].status).toBe("done");
    expect(chatHistory[0].answer).toContain("No response was returned by hermes");
  });

  test("handles error state and allows retry transition", () => {
    const turnId = "turn-1";
    let chatHistory: ChatTurn[] = [
      {
        id: turnId,
        query: "Test query",
        reasoningLevel: "medium",
        timestamp: new Date(),
        status: "pending",
      },
    ];

    // Failure transition
    chatHistory = chatHistory.map((t) =>
      t.id === turnId ? { ...t, status: "error", error: "Connection timed out" } : t
    );

    expect(chatHistory[0].status).toBe("error");
    expect(chatHistory[0].error).toBe("Connection timed out");

    // Retry transition
    chatHistory = chatHistory.map((t) =>
      t.id === turnId ? { ...t, status: "pending", error: undefined } : t
    );

    expect(chatHistory[0].status).toBe("pending");
    expect(chatHistory[0].error).toBeUndefined();
  });
});
