import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAsync } from "@/lib/use-async";
import { getClient } from "@/lib/client";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/async-view";
import { PeerAvatar } from "@/lib/avatar";
import { CopyButton } from "@/components/shared/copy-button";
import { Users, Search, MessageSquare, ArrowRight, GitCompareArrows } from "lucide-react";

export default function PeersPage() {
  const client = getClient();
  const navigate = useNavigate();
  const peers = useAsync(() => client.listPeers(), []);
  const [filter, setFilter] = useState("");

  const items = peers.data?.items ?? [];
  const filtered = items.filter((p) => {
    const query = filter.toLowerCase();
    if (p.id.toLowerCase().includes(query)) return true;
    if (p.metadata && Object.keys(p.metadata).some((k) => k.toLowerCase().includes(query))) {
      return true;
    }
    return false;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Peers</h1>
          <p className="text-sm text-muted-foreground">
            Agents and users Honcho has learned about. Select one to inspect their working representation, conclusions, and dialectic responses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Link to="/compare">
              <GitCompareArrows className="h-3.5 w-3.5" />
              Compare Perspectives
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-border/70 bg-card/60">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-400" />
              Identities
            </CardTitle>
            {peers.data && (
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
              placeholder="Search peers by name or metadata…"
              className="pl-8 text-xs bg-background/50 h-9"
            />
          </div>
        </CardHeader>

        <CardContent>
          {peers.loading && <LoadingState rows={6} />}
          {peers.error && <ErrorState error={peers.error} onRetry={peers.refetch} />}
          {peers.data && (
            <>
              {items.length === 0 ? (
                <EmptyState
                  icon={Users}
                  message="No peers in this workspace yet."
                  description="Peers will appear automatically as Honcho processes session messages."
                />
              ) : filtered.length === 0 ? (
                <EmptyState
                  icon={Search}
                  message="No peers match your search."
                  description="Try searching with a different name or clear the filter."
                />
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((p) => (
                    <li key={p.id}>
                      <div
                        onClick={() => navigate(`/peers/${p.id}`)}
                        className="group flex flex-col justify-between rounded-xl border border-border/60 bg-card/40 p-4 transition-all hover:border-primary/40 hover:bg-accent/30 hover:shadow-md hover:shadow-primary/5 cursor-pointer"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <PeerAvatar peerId={p.id} size="md" />
                              <div className="min-w-0">
                                <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors block truncate">
                                  {p.id}
                                </span>
                                <span className="text-[11px] text-muted-foreground font-mono">
                                  Peer identity
                                </span>
                              </div>
                            </div>
                            <CopyButton text={p.id} label="Copy ID" />
                          </div>

                          {p.metadata && Object.keys(p.metadata).length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 my-2">
                              {Object.entries(p.metadata).slice(0, 3).map(([key, val]) => (
                                <Badge
                                  key={key}
                                  variant="secondary"
                                  className="text-[10px] font-mono py-0 px-1.5 bg-muted/60 text-muted-foreground"
                                >
                                  {key}: {String(val)}
                                </Badge>
                              ))}
                              {Object.keys(p.metadata).length > 3 && (
                                <span className="text-[10px] text-muted-foreground font-mono self-center">
                                  +{Object.keys(p.metadata).length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground/60 italic my-2">
                              No additional metadata
                            </p>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                          <Link
                            to={`/peers/${p.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-primary hover:underline flex items-center gap-1 font-medium"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>

                          <div className="flex items-center gap-2">
                            <Button
                              asChild
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Link to={`/compare?a=${p.id}`}>
                                <GitCompareArrows className="h-3.5 w-3.5 mr-1" />
                                Compare
                              </Link>
                            </Button>
                          </div>
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
