import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAsync } from "@/lib/use-async";
import { getClient } from "@/lib/client";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/async-view";
import { PeerAvatar } from "@/lib/avatar";
import { CopyButton } from "@/components/shared/copy-button";
import {
  Users,
  MessagesSquare,
  Activity,
  Search,
  ArrowRight,
  Sparkles,
  GitCompareArrows,
  X,
  Clock,
} from "lucide-react";

export function Overview() {
  const client = getClient();

  const peers = useAsync(() => client.listPeers(), []);
  const sessions = useAsync(() => client.listSessions(), []);

  const [query, setQuery] = useState("");
  const search = useAsync(
    async () => (query.trim() ? client.workspaceSearch(query.trim(), { limit: 20 }) : []),
    [query]
  );

  const sampleQueries = [
    "user preferences",
    "project architecture",
    "goals and constraints",
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Workspace Overview</h1>
            <Badge variant="default" className="bg-primary/15 text-primary border-primary/20 text-xs font-mono">
              {client.workspaceId}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Real-time inspection of what Honcho has learned and what your agents see.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Link to="/compare">
              <GitCompareArrows className="h-3.5 w-3.5" />
              Compare Peers
            </Link>
          </Button>
          <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
            <Link to="/workspaces">
              Switch Workspace
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Peers"
          value={peers.data ? peers.data.items.length : undefined}
          to="/peers"
          icon={Users}
          badgeText="Active identities"
          description="Agents and users Honcho is tracking"
          accentColor="cyan"
        />
        <StatCard
          title="Sessions"
          value={sessions.data ? sessions.data.items.length : undefined}
          to="/sessions"
          icon={MessagesSquare}
          badgeText="Recorded dialogues"
          description="Conversations Honcho has observed"
          accentColor="indigo"
        />
        <Card className="flex flex-col justify-between border-border/70 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Processing Queue
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <QueueStatusCard />
          </CardContent>
        </Card>
      </div>

      {/* Semantic Search Section */}
      <Card className="border-border/70 bg-card/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-4 w-4 text-primary" /> Semantic Knowledge Search
              </CardTitle>
              <CardDescription>
                Search across all messages, conclusions, and memories stored in this workspace.
              </CardDescription>
            </div>
            {search.data && search.data.length > 0 && (
              <Badge variant="muted" className="font-mono text-xs">
                {search.data.length} match{search.data.length === 1 ? "" : "es"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question or enter keywords (e.g. 'what tools does the user prefer?')"
              className="pl-9 pr-9 bg-background/50 h-10 text-sm"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {!query && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-medium">
                <Sparkles className="h-3 w-3 text-primary" /> Suggestions:
              </span>
              {sampleQueries.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuery(s)}
                  className="rounded-md border border-border/60 bg-muted/40 px-2 py-1 hover:border-primary/40 hover:text-primary transition-colors"
                >
                  "{s}"
                </button>
              ))}
            </div>
          )}

          {search.loading && <LoadingState rows={3} />}
          {search.error && <ErrorState error={search.error} onRetry={search.refetch} />}
          {!search.loading && !search.error && search.data && search.data.length > 0 && (
            <ul className="space-y-2.5 pt-2">
              {search.data.map((m) => (
                <li
                  key={m.id}
                  className="group rounded-lg border border-border/60 bg-card/40 p-3.5 transition-all hover:border-border hover:bg-accent/20"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <PeerAvatar peerId={m.peerId} size="sm" />
                      <Link
                        to={`/peers/${m.peerId}`}
                        className="font-medium text-xs text-foreground hover:text-primary hover:underline"
                      >
                        {m.peerId}
                      </Link>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(m.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {m.tokenCount !== undefined && (
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {m.tokenCount} tokens
                        </span>
                      )}
                      <CopyButton text={m.content} />
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/90 pl-8">
                    {m.content}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {!search.loading && !search.error && search.data && search.data.length === 0 && query && (
            <EmptyState
              icon={Search}
              message="No matching records found."
              description="Try broadening your query terms or searching for different concepts."
            />
          )}
        </CardContent>
      </Card>

      {/* Recent Peers & Sessions Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Peers */}
        <Card className="border-border/70 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-cyan-400" /> Recent Peers
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-primary">
              <Link to="/peers">
                View all ({peers.data?.items.length ?? 0})
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {peers.loading && <LoadingState rows={4} />}
            {peers.error && <ErrorState error={peers.error} onRetry={peers.refetch} />}
            {!peers.loading && peers.data && (
              <ul className="space-y-2">
                {peers.data.items.slice(0, 6).map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/peers/${p.id}`}
                      className="group flex items-center justify-between rounded-lg border border-border/50 bg-background/40 p-2.5 text-sm transition-all hover:border-primary/40 hover:bg-accent/40"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <PeerAvatar peerId={p.id} size="sm" />
                        <span className="truncate font-medium text-foreground group-hover:text-primary transition-colors">
                          {p.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.metadata && Object.keys(p.metadata).length > 0 && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                            {Object.keys(p.metadata).length} meta
                          </span>
                        )}
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  </li>
                ))}
                {peers.data.items.length === 0 && (
                  <EmptyState message="No peers recorded yet in this workspace." />
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card className="border-border/70 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessagesSquare className="h-4 w-4 text-indigo-400" /> Recent Sessions
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-primary">
              <Link to="/sessions">
                View all ({sessions.data?.items.length ?? 0})
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {sessions.loading && <LoadingState rows={4} />}
            {sessions.error && <ErrorState error={sessions.error} onRetry={sessions.refetch} />}
            {!sessions.loading && sessions.data && (
              <ul className="space-y-2">
                {sessions.data.items.slice(0, 6).map((s) => (
                  <li key={s.id}>
                    <Link
                      to={`/sessions/${s.id}`}
                      className="group flex items-center justify-between rounded-lg border border-border/50 bg-background/40 p-2.5 text-sm transition-all hover:border-primary/40 hover:bg-accent/40"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                          <MessagesSquare className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate font-mono text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                          {s.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.metadata && Object.keys(s.metadata).length > 0 && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                            {Object.keys(s.metadata).length} meta
                          </span>
                        )}
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  </li>
                ))}
                {sessions.data.items.length === 0 && (
                  <EmptyState message="No sessions recorded yet in this workspace." />
                )}
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
  badgeText,
  description,
  accentColor,
}: {
  title: string;
  value?: number;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeText: string;
  description: string;
  accentColor: "cyan" | "indigo";
}) {
  const iconColors =
    accentColor === "cyan"
      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
      : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";

  return (
    <Link to={to} className="group">
      <Card className="h-full border-border/70 bg-card/60 transition-all hover:border-primary/40 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${iconColors}`}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {value !== undefined ? value.toLocaleString() : "—"}
            </p>
            <span className="text-[11px] font-mono text-muted-foreground">{badgeText}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function QueueStatusCard() {
  const client = getClient();
  const status = useAsync(() => client.queueStatus(), []);

  if (status.loading) return <LoadingState rows={1} />;
  if (status.error) return <ErrorState error={status.error} onRetry={status.refetch} />;

  const s = status.data;
  const completed = s?.completedWorkUnits ?? 0;
  const inProgress = s?.inProgressWorkUnits ?? 0;
  const pending = s?.pendingWorkUnits ?? 0;
  const total = completed + inProgress + pending;

  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 100;
  const inProgressPct = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Visual Progress Bar */}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/60 flex">
        <div
          style={{ width: `${completedPct}%` }}
          className="bg-emerald-500 transition-all duration-500"
          title={`Completed: ${completed} (${completedPct}%)`}
        />
        <div
          style={{ width: `${inProgressPct}%` }}
          className="bg-amber-400 animate-pulse transition-all duration-500"
          title={`In Progress: ${inProgress} (${inProgressPct}%)`}
        />
        <div
          style={{ width: `${pendingPct}%` }}
          className="bg-zinc-600 transition-all duration-500"
          title={`Pending: ${pending} (${pendingPct}%)`}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center pt-1">
        <div className="rounded-md bg-muted/40 p-1.5">
          <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Done
          </div>
          <span className="font-mono text-xs font-semibold text-foreground">{completed}</span>
        </div>
        <div className="rounded-md bg-muted/40 p-1.5">
          <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Active
          </div>
          <span className="font-mono text-xs font-semibold text-foreground">{inProgress}</span>
        </div>
        <div className="rounded-md bg-muted/40 p-1.5">
          <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
            Pending
          </div>
          <span className="font-mono text-xs font-semibold text-foreground">{pending}</span>
        </div>
      </div>
    </div>
  );
}
