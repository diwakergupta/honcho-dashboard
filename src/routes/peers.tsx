import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAsync } from "@/lib/use-async";
import { getClient } from "@/lib/client";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/async-view";
import { cn } from "@/lib/utils";

export default function PeersPage() {
  const client = getClient();
  const navigate = useNavigate();
  const peers = useAsync(() => client.listPeers(), []);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Peers</h1>
        <p className="text-sm text-muted-foreground">
          Every agent or user Honcho is tracking. Click one to see what it knows
          and what it can answer.
        </p>
      </header>

      <Card>
        {peers.loading && <CardContent><LoadingState rows={6} /></CardContent>}
        {peers.error && <CardContent><ErrorState error={peers.error} onRetry={peers.refetch} /></CardContent>}
        {peers.data && (
          <>
            <CardHeader>
              <CardTitle className="text-base">
                {peers.data.items.length} peer{peers.data.items.length === 1 ? "" : "s"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {peers.data.items.length === 0 ? (
                <EmptyState message="No peers in this workspace yet." />
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {peers.data.items.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => navigate(`/peers/${p.id}`)}
                        className={cn(
                          "w-full rounded-md border p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent/50"
                        )}
                      >
                        <div className="font-medium">{p.id}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {p.metadata && Object.keys(p.metadata).length > 0
                            ? `${Object.keys(p.metadata).length} metadata fields`
                            : "no metadata"}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
