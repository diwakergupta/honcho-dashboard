import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAsync } from "@/lib/use-async";
import { getClient } from "@/lib/client";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/async-view";
import { MarkdownView } from "@/components/shared/markdown-view";
import { PeerAvatar } from "@/lib/avatar";
import { CopyButton } from "@/components/shared/copy-button";
import {
  Brain,
  FileText,
  MessagesSquare,
  MessageSquare,
  GitCompareArrows,
  ArrowLeft,
  Send,
  Loader2,
  Sparkles,
  IdCard,
  Search,
} from "lucide-react";

type ReasoningLevel = "minimal" | "low" | "medium" | "high";

export default function PeerDetail() {
  const { peerId } = useParams<{ peerId: string }>();
  const id = peerId ?? "";
  const client = getClient();

  const context = useAsync(() => client.peerContext(id), [id]);
  const selfConclusions = useAsync(() => client.conclusionsOf(id, id), [id]);
  const sessions = useAsync(() => client.peerSessions(id), [id]);

  const [target, setTarget] = useState("");
  const [chatQuery, setChatQuery] = useState("");
  const [reasoningLevel, setReasoningLevel] = useState<ReasoningLevel>("medium");
  const [conclusionFilter, setConclusionFilter] = useState("");

  const [chatHistory, setChatHistory] = useState<
    Array<{ query: string; answer: string; target?: string; timestamp: Date }>
  >([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<Error | null>(null);

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = chatQuery.trim();
    if (!q || chatLoading) return;

    setChatLoading(true);
    setChatError(null);
    try {
      const answer = await client.peerChat(id, q, {
        target: target.trim() || undefined,
        reasoningLevel,
      });
      if (answer) {
        setChatHistory((prev) => [
          ...prev,
          {
            query: q,
            answer,
            target: target.trim() || undefined,
            timestamp: new Date(),
          },
        ]);
        setChatQuery("");
      }
    } catch (err) {
      setChatError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setChatLoading(false);
    }
  };

  const filteredConclusions = (selfConclusions.data ?? []).filter((c) => {
    if (!conclusionFilter) return true;
    const q = conclusionFilter.toLowerCase();
    return (
      c.content.toLowerCase().includes(q) ||
      (c.sessionId && c.sessionId.toLowerCase().includes(q)) ||
      (c.level && c.level.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="space-y-3">
        <Link
          to="/peers"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to all peers
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <PeerAvatar peerId={id} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">{id}</h1>
                <CopyButton text={id} label="Copy ID" />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Observed identity and dialectic model
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Link to={`/compare?a=${id}`}>
                <GitCompareArrows className="h-3.5 w-3.5" />
                Compare in Perspective View
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Working Representation */}
        <Card className="border-border/70 bg-card/60 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-primary" /> Working Representation
                </CardTitle>
                <CardDescription>
                  The synthesized, human-readable model Honcho maintains for this peer.
                  This is the knowledge an agent receives when asking what Honcho knows about <code className="text-xs text-primary font-mono">{id}</code>.
                </CardDescription>
              </div>
              {context.data?.representation && (
                <Badge variant="muted" className="font-mono text-xs hidden sm:inline-flex">
                  ~{Math.round(context.data.representation.length / 4)} tokens
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {context.loading && <LoadingState rows={4} />}
            {context.error && <ErrorState error={context.error} onRetry={context.refetch} />}
            {context.data?.representation ? (
              <MarkdownView
                content={context.data.representation}
                maxHeightClass="max-h-[28rem]"
              />
            ) : (
              !context.loading && (
                <EmptyState
                  icon={FileText}
                  message="No representation yet."
                  description="Honcho derives a peer representation once sessions and messages involving this peer have been observed and indexed."
                />
              )
            )}

            {context.data?.peerCard && (
              <div className="mt-4 pt-4 border-t border-border/40">
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                  <IdCard className="h-3.5 w-3.5 text-primary" /> Peer Card (Structured Metadata)
                </h3>
                <MarkdownView
                  content={context.data.peerCard}
                  maxHeightClass="max-h-48"
                  className="bg-background/40"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialectic Chat Box */}
        <Card className="border-border/70 bg-card/60 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4 text-cyan-400" /> Dialectic Query
            </CardTitle>
            <CardDescription>
              Ask a question to hear this peer answer directly from its synthesized worldview.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4">
            {/* Conversation History */}
            <div className="flex-1 min-h-[160px] max-h-96 overflow-y-auto space-y-3 rounded-lg border border-border/50 bg-background/30 p-3">
              {chatHistory.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-6 text-center text-xs text-muted-foreground">
                  <Sparkles className="h-6 w-6 mb-2 text-primary/60" />
                  <p className="font-medium text-foreground">Interactive Dialectic Session</p>
                  <p className="mt-0.5 max-w-xs">
                    Ask how this peer reasons about projects, decisions, or user preferences.
                  </p>
                </div>
              ) : (
                chatHistory.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-end">
                      <div className="rounded-lg bg-primary/20 text-primary-foreground text-xs px-3 py-2 max-w-[85%] border border-primary/30">
                        <p className="text-foreground">{item.query}</p>
                        {item.target && (
                          <span className="text-[10px] text-muted-foreground block mt-1 font-mono">
                            viewpoint: {item.target}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="rounded-lg bg-card text-xs p-3 max-w-[95%] border border-border/60">
                        <div className="flex items-center gap-2 mb-1.5">
                          <PeerAvatar peerId={id} size="sm" />
                          <span className="font-mono font-medium text-foreground">{id}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {item.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <MarkdownView
                          content={item.answer}
                          maxHeightClass="max-h-60"
                          allowToggle={false}
                          className="border-none bg-transparent p-0"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}

              {chatLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Synthesizing answer from {id}'s perspective…</span>
                </div>
              )}

              {chatError && (
                <ErrorState error={chatError} />
              )}
            </div>

            {/* Input Controls */}
            <form onSubmit={handleSendChat} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Viewpoint:</span>
                  <Input
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="optional target peer ID"
                    className="h-8 text-xs bg-background/50 font-mono"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Reasoning:</span>
                  <div className="flex rounded-md border border-border/60 bg-background/50 p-0.5 text-xs">
                    {(["minimal", "low", "medium", "high"] as ReasoningLevel[]).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setReasoningLevel(level)}
                        className={`rounded px-2 py-0.5 text-[10px] uppercase font-mono transition-colors ${
                          reasoningLevel === level
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative">
                <Textarea
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                  placeholder={`Ask ${id} anything… (Press Enter to send)`}
                  rows={2}
                  className="min-h-[64px] pr-12 text-xs bg-background/50 resize-none"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={chatLoading || !chatQuery.trim()}
                  className="absolute right-2 bottom-2 h-7 w-7 p-0 rounded-md shadow-sm"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Conclusions */}
        <Card className="border-border/70 bg-card/60 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="h-4 w-4 text-indigo-400" /> Conclusions
                </CardTitle>
                <CardDescription>
                  Atomic facts, traits, and behavioral inferences Honcho has learned about {id}.
                </CardDescription>
              </div>
              {selfConclusions.data && (
                <Badge variant="muted" className="font-mono text-xs">
                  {selfConclusions.data.length}
                </Badge>
              )}
            </div>

            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={conclusionFilter}
                onChange={(e) => setConclusionFilter(e.target.value)}
                placeholder="Filter conclusions…"
                className="pl-8 text-xs h-8 bg-background/50"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {selfConclusions.loading && <LoadingState rows={4} />}
            {selfConclusions.error && (
              <ErrorState error={selfConclusions.error} onRetry={selfConclusions.refetch} />
            )}
            {selfConclusions.data && (
              <ul className="max-h-96 space-y-2.5 overflow-y-auto pr-1">
                {filteredConclusions.map((o) => (
                  <li
                    key={o.id}
                    className="rounded-lg border border-border/60 bg-background/40 p-3 text-xs leading-relaxed transition-all hover:border-border"
                  >
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <Badge variant="muted" className="text-[10px] font-mono">
                        {o.sessionId ? (
                          <Link to={`/sessions/${o.sessionId}`} className="hover:underline">
                            {o.sessionId}
                          </Link>
                        ) : (
                          "general"
                        )}
                      </Badge>
                      {o.level && (
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {o.level}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-foreground/90">{o.content}</p>
                  </li>
                ))}
                {filteredConclusions.length === 0 && (
                  <EmptyState
                    icon={Brain}
                    message={conclusionFilter ? "No matching conclusions." : "No conclusions derived yet."}
                    description="Conclusions are formed as Honcho observes consistent behavior and explicit facts."
                  />
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table/Grid */}
      <Card className="border-border/70 bg-card/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessagesSquare className="h-4 w-4 text-cyan-400" /> Associated Sessions
            </CardTitle>
            {sessions.data && (
              <Badge variant="muted" className="font-mono text-xs">
                {sessions.data.items.length} session{sessions.data.items.length === 1 ? "" : "s"}
              </Badge>
            )}
          </div>
          <CardDescription>
            Conversations where {id} has participated as a sender or observer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.loading && <LoadingState rows={3} />}
          {sessions.error && <ErrorState error={sessions.error} onRetry={sessions.refetch} />}
          {sessions.data && (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.data.items.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/sessions/${s.id}`}
                    className="group flex flex-col justify-between rounded-xl border border-border/60 bg-card/40 p-3.5 text-xs transition-all hover:border-primary/40 hover:bg-accent/40"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-400">
                        <MessagesSquare className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-mono font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {s.id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                      <span>View conversation details</span>
                      <span className="text-primary group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                  </Link>
                </li>
              ))}
              {sessions.data.items.length === 0 && (
                <EmptyState
                  icon={MessagesSquare}
                  message="No sessions found for this peer."
                  description="When sessions are started with this peer, they will appear here."
                />
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
