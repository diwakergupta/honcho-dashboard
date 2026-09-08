import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAsync } from "@/lib/use-async";
import { getClient } from "@/lib/client";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/async-view";
import { FileText, MessagesSquare, Search, User } from "lucide-react";

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
    async () => (searchQ.trim() ? client.sessionSearch(id, searchQ, { limit: 20 }) : []),
    [id, searchQ]
  );

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Link to="/sessions" className="text-xs text-muted-foreground hover:text-foreground">
          ← All sessions
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{id}</h1>
        <p className="text-sm text-muted-foreground">
          Messages, summaries, and the exact context an LLM sees for this session.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" /> Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            {peers.loading && <LoadingState rows={2} />}
            {peers.error && <ErrorState error={peers.error} onRetry={peers.refetch} />}
            {peers.data && (
              <ul className="space-y-2">
                {peers.data.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/peers/${p.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {p.id}
                    </Link>
                  </li>
                ))}
                {peers.data.length === 0 && <EmptyState message="No participants." />}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" /> Summaries
            </CardTitle>
            <CardDescription>
              Short and long summaries Honcho generates as the conversation grows.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {summaries.loading && <LoadingState rows={2} />}
            {summaries.error && <ErrorState error={summaries.error} onRetry={summaries.refetch} />}
            {summaries.data && (
              <>
                <SummaryBlock
                  label="Short summary"
                  summary={summaries.data.shortSummary}
                />
                <SummaryBlock
                  label="Long summary"
                  summary={summaries.data.longSummary}
                />
                {!summaries.data.shortSummary && !summaries.data.longSummary && (
                  <EmptyState message="No summaries generated yet." />
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-4 w-4" /> Session search
            </CardTitle>
            <CardDescription>
              Semantic search scoped to this session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search this session…"
            />
            {search.loading && <LoadingState rows={2} />}
            {search.data && search.data.length > 0 && (
              <ul className="max-h-64 space-y-2 overflow-y-auto">
                {search.data.map((m) => (
                  <li key={m.id} className="rounded-md border p-2 text-xs">
                    <Badge variant="muted" className="mb-1">{m.peerId}</Badge>
                    <p>{m.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessagesSquare className="h-4 w-4" />
            Messages
            {messages.data && (
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {messages.data.items.length} shown
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages.loading && <LoadingState rows={6} />}
          {messages.error && <ErrorState error={messages.error} onRetry={messages.refetch} />}
          {messages.data && (
            <>
              {messages.data.items.length === 0 ? (
                <EmptyState message="No messages in this session yet." />
              ) : (
                <ol className="space-y-3">
                  {messages.data.items.map((m) => (
                    <li key={m.id} className="rounded-md border p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <Link
                          to={`/peers/${m.peerId}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {m.peerId}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {new Date(m.createdAt).toLocaleString()}
                        </span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {m.tokenCount} tokens
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">LLM-ready context</CardTitle>
          <CardDescription>
            What Honcho assembles when an agent requests context for this session:
            the summary, peer representation, peer card, and recent messages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {context.loading && <LoadingState rows={3} />}
          {context.error && <ErrorState error={context.error} onRetry={context.refetch} />}
          {context.data && (
            <>
              {context.data.peerRepresentation && (
                <ContextBlock title="Peer representation">
                  {context.data.peerRepresentation}
                </ContextBlock>
              )}
              {context.data.peerCard && (
                <ContextBlock title="Peer card">{context.data.peerCard}</ContextBlock>
              )}
              {context.data.summary && (
                <ContextBlock title={`Summary (${context.data.summary.summaryType})`}>
                  {context.data.summary.content}
                </ContextBlock>
              )}
              <div>
                <h3 className="mb-2 text-sm font-medium">
                  Recent messages ({context.data.messages.length})
                </h3>
                <div className="max-h-80 space-y-2 overflow-y-auto">
                  {context.data.messages.map((m) => (
                    <div key={m.id} className="rounded-md bg-muted/50 p-2 text-xs">
                      <span className="font-medium">{m.peerId}:</span> {m.content}
                    </div>
                  ))}
                  {context.data.messages.length === 0 && (
                    <EmptyState message="No recent messages in context window." />
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

function SummaryBlock({
  label,
  summary,
}: {
  label: string;
  summary: { content: string; createdAt: string } | null;
}) {
  if (!summary) return null;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-medium">{label}</h3>
        <span className="text-xs text-muted-foreground">
          {new Date(summary.createdAt).toLocaleDateString()}
        </span>
      </div>
      <pre className="max-h-40 whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-xs">
        {summary.content}
      </pre>
    </div>
  );
}

function ContextBlock({ title, children }: { title: string; children: string }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium">{title}</h3>
      <pre className="max-h-64 whitespace-pre-wrap overflow-y-auto rounded-md bg-muted/50 p-3 text-xs">
        {children}
      </pre>
    </div>
  );
}
