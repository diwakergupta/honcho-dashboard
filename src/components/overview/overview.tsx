import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAsync } from "@/lib/use-async";
import { getClient } from "@/lib/client";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/async-view";
import { Users, MessagesSquare, Brain, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export function Overview() {
  const client = getClient();

  const peers = useAsync(() => client.listPeers(), []);
  const sessions = useAsync(() => client.listSessions(), []);
  const meta = useAsync(() => client.metadata(), []);

  const [query, setQuery] = useState("");
  const search = useAsync(
    async () => (query.trim() ? client.workspaceSearch(query, { limit: 20 }) : []),
    [query]
  );

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Workspace <code className="rounded bg-muted px-1.5 py-0.5">{client.workspaceId}</code> —
          what Honcho has learned and what your agents see.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Peers"
          value={peers.data ? peers.data.items.length : undefined}
          to="/peers"
          icon={Users}
          description="Agents and users Honcho knows about"
        />
        <StatCard
          title="Sessions"
          value={sessions.data ? sessions.data.items.length : undefined}
          to="/sessions"
          icon={MessagesSquare}
          description="Conversations Honcho has observed"
        />
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4 text-primary" /> Queue status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <QueueStatus />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" /> Semantic search
          </CardTitle>
          <CardDescription>
            Search everything Honcho has learned across this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. what does the user prefer?"
            />
          </div>
          {search.loading && <LoadingState rows={2} />}
          {search.error && <ErrorState error={search.error} onRetry={search.refetch} />}
          {!search.loading && !search.error && search.data && search.data.length > 0 && (
            <ul className="space-y-3">
              {search.data.map((m) => (
                <li key={m.id} className="rounded-md border p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant="muted">{m.peerId}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{m.content}</p>
                </li>
              ))}
            </ul>
          )}
          {!search.loading && !search.error && search.data && search.data.length === 0 && query && (
            <EmptyState message="No matches found." />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent peers</CardTitle>
          </CardHeader>
          <CardContent>
            {peers.loading && <LoadingState rows={3} />}
            {peers.error && <ErrorState error={peers.error} onRetry={peers.refetch} />}
            {!peers.loading && peers.data && (
              <ul className="space-y-2">
                {peers.data.items.slice(0, 8).map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/peers/${p.id}`}
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent"
                    >
                      <span className="font-medium">{p.id}</span>
                      <span className="text-xs text-muted-foreground" />
                    </Link>
                  </li>
                ))}
                {peers.data.items.length === 0 && <EmptyState message="No peers yet." />}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.loading && <LoadingState rows={3} />}
            {sessions.error && <ErrorState error={sessions.error} onRetry={sessions.refetch} />}
            {!sessions.loading && sessions.data && (
              <ul className="space-y-2">
                {sessions.data.items.slice(0, 8).map((s) => (
                  <li key={s.id}>
                    <Link
                      to={`/sessions/${s.id}`}
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent"
                    >
                      <span className="font-medium">{s.id}</span>
                      <span className="text-xs text-muted-foreground" />
                    </Link>
                  </li>
                ))}
                {sessions.data.items.length === 0 && <EmptyState message="No sessions yet." />}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  to,
  icon: Icon,
  description,
}: {
  title: string;
  value?: number;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}) {
  return (
    <Link to={to} className="group">
      <Card className="h-full transition-colors group-hover:border-primary/40">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="h-4 w-4" /> {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{value ?? "—"}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function QueueStatus() {
  const client = getClient();
  const status = useAsync(() => client.queueStatus(), []);
  if (status.loading) return <LoadingState rows={1} />;
  if (status.error) return <ErrorState error={status.error} onRetry={status.refetch} />;
  const s = status.data;
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Completed</span>
        <span className="font-medium">{s?.completedWorkUnits ?? 0}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">In progress</span>
        <span className="font-medium">{s?.inProgressWorkUnits ?? 0}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Pending</span>
        <span className="font-medium">{s?.pendingWorkUnits ?? 0}</span>
      </div>
    </div>
  );
}
