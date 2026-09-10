import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAsync } from "@/lib/use-async";
import { getClient } from "@/lib/client";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/async-view";
import { MarkdownView } from "@/components/shared/markdown-view";
import { PeerAvatar } from "@/lib/avatar";
import { CopyButton } from "@/components/shared/copy-button";
import {
  FileText,
  MessagesSquare,
  Search,
  Users,
  ArrowLeft,
  Clock,
  Sparkles,
  Bot,
  Layers,
} from "lucide-react";

export default function SessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const id = sessionId ?? "";
  const client = getClient();

  const messages = useAsync(() => client.sessionMessages(id), [id]);
  const peers = useAsync(() => client.sessionPeers(id), [id]);
  const summaries = useAsync(() => client.sessionSummaries(id), [id]);
  const context = useAsync(
    () => client.sessionContext(id, { summary: true, tokens: 2048 }),
    [id]
  );

  const [searchQ, setSearchQ] = useState("");
  const search = useAsync(
    async () => (searchQ.trim() ? client.sessionSearch(id, searchQ.trim(), { limit: 20 }) : []),
    [id, searchQ]
  );

  const [activeSummaryTab, setActiveSummaryTab] = useState<"short" | "long">("short");

  // Construct complete LLM context string for easy copying
  const fullContextString = context.data
    ? [
        context.data.peerRepresentation ? `=== PEER REPRESENTATION ===\n${context.data.peerRepresentation}` : null,
        context.data.peerCard ? `=== PEER CARD ===\n${context.data.peerCard}` : null,
        context.data.summary ? `=== SUMMARY (${context.data.summary.summaryType}) ===\n${context.data.summary.content}` : null,
        `=== RECENT MESSAGES ===\n` + context.data.messages.map((m) => `${m.peerId}: ${m.content}`).join("\n\n"),
      ]
        .filter(Boolean)
        .join("\n\n")
    : "";

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="space-y-3">
        <Link
          to="/sessions"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to all sessions
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <MessagesSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">{id}</h1>
                <CopyButton text={id} label="Copy ID" />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Session transcript, generated summaries, and LLM context window
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Grid: Participants, Summaries, Session Search */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Participants */}
        <Card className="border-border/70 bg-card/60 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-cyan-400" /> Participants
            </CardTitle>
            <CardDescription>Peers actively engaging in this dialogue.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {peers.loading && <LoadingState rows={2} />}
            {peers.error && <ErrorState error={peers.error} onRetry={peers.refetch} />}
            {peers.data && (
              <ul className="space-y-2">
                {peers.data.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/peers/${p.id}`}
                      className="group flex items-center justify-between rounded-lg border border-border/50 bg-background/40 p-2.5 text-xs transition-all hover:border-primary/40 hover:bg-accent/40"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <PeerAvatar peerId={p.id} size="sm" />
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {p.id}
                        </span>
                      </div>
                      <span className="text-primary text-[11px] group-hover:translate-x-0.5 transition-transform">
                        Inspect →
                      </span>
                    </Link>
                  </li>
                ))}
                {peers.data.length === 0 && <EmptyState message="No participants observed." />}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Summaries */}
        <Card className="border-border/70 bg-card/60 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" /> Summaries
              </CardTitle>
              {summaries.data && (
                <div className="flex rounded-md border border-border/60 bg-background/50 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveSummaryTab("short")}
                    className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                      activeSummaryTab === "short"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Short
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSummaryTab("long")}
                    className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                      activeSummaryTab === "long"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Long
                  </button>
                </div>
              )}
            </div>
            <CardDescription>
              Hierarchical summaries Honcho synthesizes as conversation grows.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {summaries.loading && <LoadingState rows={3} />}
            {summaries.error && <ErrorState error={summaries.error} onRetry={summaries.refetch} />}
            {summaries.data && (
              <>
                {activeSummaryTab === "short" && (
                  <div>
                    {summaries.data.shortSummary ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>Updated {new Date(summaries.data.shortSummary.createdAt).toLocaleDateString()}</span>
                          {summaries.data.shortSummary.tokenCount && (
                            <span className="font-mono">{summaries.data.shortSummary.tokenCount} tokens</span>
                          )}
                        </div>
                        <MarkdownView
                          content={summaries.data.shortSummary.content}
                          maxHeightClass="max-h-52"
                        />
                      </div>
                    ) : (
                      <EmptyState
                        icon={FileText}
                        message="No short summary yet."
                        description="Summaries are generated as messages accumulate."
                      />
                    )}
                  </div>
                )}

                {activeSummaryTab === "long" && (
                  <div>
                    {summaries.data.longSummary ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>Updated {new Date(summaries.data.longSummary.createdAt).toLocaleDateString()}</span>
                          {summaries.data.longSummary.tokenCount && (
                            <span className="font-mono">{summaries.data.longSummary.tokenCount} tokens</span>
                          )}
                        </div>
                        <MarkdownView
                          content={summaries.data.longSummary.content}
                          maxHeightClass="max-h-52"
                        />
                      </div>
                    ) : (
                      <EmptyState
                        icon={FileText}
                        message="No long summary yet."
                        description="Long summaries are created once longer conversations are observed."
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Session Scoped Search */}
        <Card className="border-border/70 bg-card/60 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-4 w-4 text-emerald-400" /> Session Search
            </CardTitle>
            <CardDescription>Semantic search isolated to this session.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search dialogue in this session…"
                className="pl-8 text-xs bg-background/50 h-8"
              />
            </div>

            {search.loading && <LoadingState rows={2} />}
            {search.data && search.data.length > 0 && (
              <ul className="max-h-52 space-y-2 overflow-y-auto pr-1">
                {search.data.map((m) => (
                  <li key={m.id} className="rounded-lg border border-border/50 bg-background/40 p-2.5 text-xs">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <PeerAvatar peerId={m.peerId} size="sm" />
                        <span className="font-medium">{m.peerId}</span>
                      </div>
                      <CopyButton text={m.content} />
                    </div>
                    <p className="text-foreground/90 pl-7 text-[11px] leading-relaxed">{m.content}</p>
                  </li>
                ))}
              </ul>
            )}
            {!search.loading && search.data && search.data.length === 0 && searchQ && (
              <EmptyState icon={Search} message="No matching statements." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Messages Transcript */}
      <Card className="border-border/70 bg-card/60">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessagesSquare className="h-4 w-4 text-indigo-400" /> Conversation Transcript
              </CardTitle>
              <CardDescription>
                Chronological record of messages observed in this session.
              </CardDescription>
            </div>
            {messages.data && (
              <Badge variant="muted" className="font-mono text-xs">
                {messages.data.items.length} message{messages.data.items.length === 1 ? "" : "s"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {messages.loading && <LoadingState rows={6} />}
          {messages.error && <ErrorState error={messages.error} onRetry={messages.refetch} />}
          {messages.data && (
            <>
              {messages.data.items.length === 0 ? (
                <EmptyState
                  icon={MessagesSquare}
                  message="No messages recorded in this session yet."
                />
              ) : (
                <ol className="space-y-3">
                  {messages.data.items.map((m) => (
                    <li
                      key={m.id}
                      className="group rounded-xl border border-border/60 bg-card/40 p-4 transition-all hover:border-border hover:bg-card/70"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <PeerAvatar peerId={m.peerId} size="sm" />
                          <Link
                            to={`/peers/${m.peerId}`}
                            className="text-xs font-semibold text-foreground hover:text-primary hover:underline font-mono"
                          >
                            {m.peerId}
                          </Link>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(m.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {m.tokenCount !== undefined && (
                            <span className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                              {m.tokenCount} tokens
                            </span>
                          )}
                          <CopyButton text={m.content} />
                        </div>
                      </div>

                      <div className="pl-8">
                        <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/90 font-sans">
                          {m.content}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* LLM Context Assembly Inspector */}
      <Card className="border-border/70 bg-card/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bot className="h-4 w-4 text-primary" /> LLM-Ready Context Assembly
              </CardTitle>
              <CardDescription>
                The exact consolidated prompt context Honcho assembles when an agent requests context for this session.
              </CardDescription>
            </div>
            {fullContextString && (
              <CopyButton text={fullContextString} label="Copy Complete Prompt" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {context.loading && <LoadingState rows={3} />}
          {context.error && <ErrorState error={context.error} onRetry={context.refetch} />}
          {context.data && (
            <>
              {context.data.peerRepresentation && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                    Peer Representation
                  </span>
                  <MarkdownView
                    content={context.data.peerRepresentation}
                    maxHeightClass="max-h-48"
                  />
                </div>
              )}

              {context.data.peerCard && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                    Peer Card
                  </span>
                  <MarkdownView content={context.data.peerCard} maxHeightClass="max-h-40" />
                </div>
              )}

              {context.data.summary && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                    Session Summary ({context.data.summary.summaryType})
                  </span>
                  <MarkdownView
                    content={context.data.summary.content}
                    maxHeightClass="max-h-40"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                  Context Window Messages ({context.data.messages.length})
                </span>
                <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border/50 bg-background/40 p-3">
                  {context.data.messages.map((m) => (
                    <div key={m.id} className="text-xs">
                      <span className="font-mono font-semibold text-primary">{m.peerId}: </span>
                      <span className="text-foreground/90">{m.content}</span>
                    </div>
                  ))}
                  {context.data.messages.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      No windowed messages in context.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
