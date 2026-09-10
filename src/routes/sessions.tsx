import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAsync } from "@/lib/use-async";
import { getClient } from "@/lib/client";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/async-view";
import { CopyButton } from "@/components/shared/copy-button";
import { MessagesSquare, Search, ArrowRight, Clock } from "lucide-react";

export default function SessionsPage() {
  const client = getClient();
  const navigate = useNavigate();
  const sessions = useAsync(() => client.listSessions(), []);
  const [filter, setFilter] = useState("");

  const items = sessions.data?.items ?? [];
  const filtered = items.filter((s) => {
    const q = filter.toLowerCase();
    if (s.id.toLowerCase().includes(q)) return true;
    if (s.metadata && Object.keys(s.metadata).some((k) => k.toLowerCase().includes(q))) {
      return true;
    }
    return false;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sessions</h1>
          <p className="text-sm text-muted-foreground">
            All conversations and agent interactions observed by Honcho. Inspect message histories, summaries, and LLM-ready context.
          </p>
        </div>
      </div>

      <Card className="border-border/70 bg-card/60">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MessagesSquare className="h-4 w-4 text-indigo-400" />
              Recorded Sessions
            </CardTitle>
            {sessions.data && (
              <Badge variant="muted" className="font-mono text-xs">
                {filter ? `${filtered.length} of ${items.length}` : `${items.length} total`}
              </Badge>
            )}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search sessions by ID or metadata…"
              className="pl-8 text-xs bg-background/50 h-9"
            />
          </div>
        </CardHeader>

        <CardContent>
          {sessions.loading && <LoadingState rows={6} />}
          {sessions.error && <ErrorState error={sessions.error} onRetry={sessions.refetch} />}
          {sessions.data && (
            <>
              {items.length === 0 ? (
                <EmptyState
                  icon={MessagesSquare}
                  message="No sessions in this workspace yet."
                  description="Sessions are created automatically when agents or users start sending messages."
                />
              ) : filtered.length === 0 ? (
                <EmptyState
                  icon={Search}
                  message="No sessions match your search."
                  description="Try a different search query or clear the filter."
                />
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((s) => (
                    <li key={s.id}>
                      <div
                        onClick={() => navigate(`/sessions/${s.id}`)}
                        className="group flex flex-col justify-between rounded-xl border border-border/60 bg-card/40 p-4 transition-all hover:border-primary/40 hover:bg-accent/30 hover:shadow-md hover:shadow-primary/5 cursor-pointer"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                <MessagesSquare className="h-4 w-4" />
                              </div>
                              <span className="font-mono font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                                {s.id}
                              </span>
                            </div>
                            <CopyButton text={s.id} label="Copy ID" />
                          </div>

                          {s.metadata && Object.keys(s.metadata).length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 my-2">
                              {Object.entries(s.metadata).slice(0, 3).map(([key, val]) => (
                                <Badge
                                  key={key}
                                  variant="secondary"
                                  className="text-[10px] font-mono py-0 px-1.5 bg-muted/60 text-muted-foreground"
                                >
                                  {key}: {String(val)}
                                </Badge>
                              ))}
                              {Object.keys(s.metadata).length > 3 && (
                                <span className="text-[10px] text-muted-foreground font-mono self-center">
                                  +{Object.keys(s.metadata).length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground/60 italic my-2">
                              No additional metadata
                            </p>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                          <span className="text-[11px] flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Inspect transcript
                          </span>
                          <span className="text-primary font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            View <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
