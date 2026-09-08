import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAsync } from "@/lib/use-async";
import { getClient } from "@/lib/client";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/async-view";
import { Brain, FileText, MessagesSquare, MessageSquare } from "lucide-react";

export default function PeerDetail() {
  const { peerId } = useParams<{ peerId: string }>();
  const id = peerId ?? "";
  const client = getClient();

  const context = useAsync(() => client.peerContext(id), [id]);
  const selfConclusions = useAsync(
    () => client.conclusionsOf(id, id),
    [id]
  );
  const sessions = useAsync(() => client.peerSessions(id), [id]);

  const [target, setTarget] = useState("");
  const [chatQuery, setChatQuery] = useState("");
  const chat = useAsync(
    async () =>
      chatQuery.trim()
        ? client.peerChat(id, chatQuery, {
            target: target || undefined,
          })
        : null,
    [id, chatQuery, target]
  );

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Link to="/peers" className="text-xs text-muted-foreground hover:text-foreground">
          ← All peers
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{id}</h1>
        <p className="text-sm text-muted-foreground">
          What this peer knows, and what it can answer.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Working representation
            </CardTitle>
            <CardDescription>
              The curated, human-readable summary of everything Honcho has
              learned about this peer. This is what an agent gets when it asks
              Honcho “what do you know about {id}?”.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {context.loading && <LoadingState rows={4} />}
            {context.error && <ErrorState error={context.error} onRetry={context.refetch} />}
            {context.data?.representation ? (
              <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-md bg-muted/50 p-4 text-sm">
                {context.data.representation}
              </pre>
            ) : (
              !context.loading && (
                <EmptyState message="No representation yet — this peer has no observed activity." />
              )
            )}
            {context.data?.peerCard && (
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-medium">Peer card</h3>
                <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md bg-muted/50 p-4 text-sm">
                  {context.data.peerCard}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4" /> Ask the peer (dialectic)
            </CardTitle>
            <CardDescription>
              Ask a question and see how this peer answers from its own
              knowledge — exactly what an agent built on Honcho would hear.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              placeholder="e.g. What do you know about the user?"
              rows={2}
              className="min-h-[64px]"
            />
            <div className="flex items-center gap-2 text-sm">
              <label className="text-muted-foreground">Viewpoint</label>
              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="optional: another peer id"
                className="flex-1 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            {chatQuery.trim() && (
              <>
                {chat.loading && <p className="text-sm text-muted-foreground">Thinking…</p>}
                {chat.error && <ErrorState error={chat.error} onRetry={chat.refetch} />}
                {chat.data && (
                  <pre className="whitespace-pre-wrap rounded-md bg-muted/50 p-4 text-sm">
                    {chat.data}
                  </pre>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4" /> Conclusions about itself
            </CardTitle>
            <CardDescription>
              Individual facts and inferences Honcho has derived about this peer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selfConclusions.loading && <LoadingState rows={4} />}
            {selfConclusions.error && (
              <ErrorState error={selfConclusions.error} onRetry={selfConclusions.refetch} />
            )}
            {selfConclusions.data && (
              <ul className="max-h-96 space-y-2 overflow-y-auto">
                {selfConclusions.data.map((o) => (
                  <li key={o.id} className="rounded-md border p-3 text-sm">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant="muted">{o.sessionId || "general"}</Badge>
                      {o.level && <Badge variant="secondary">{o.level}</Badge>}
                      <span className="text-xs text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {o.content}
                  </li>
                ))}
                {selfConclusions.data.length === 0 && (
                  <EmptyState message="No conclusions derived yet." />
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessagesSquare className="h-4 w-4" /> Sessions this peer appears in
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.loading && <LoadingState rows={3} />}
          {sessions.error && <ErrorState error={sessions.error} onRetry={sessions.refetch} />}
          {sessions.data && (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.data.items.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/sessions/${s.id}`}
                    className="block rounded-md border p-3 text-sm hover:border-primary/50 hover:bg-accent/50"
                  >
                    <div className="font-medium">{s.id}</div>
                  </Link>
                </li>
              ))}
              {sessions.data.items.length === 0 && (
                <EmptyState message="No sessions for this peer." />
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
