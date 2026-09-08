import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAsync } from "@/lib/use-async";
import { getClient } from "@/lib/client";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/async-view";
import { cn } from "@/lib/utils";

export default function SessionsPage() {
  const client = getClient();
  const navigate = useNavigate();
  const sessions = useAsync(() => client.listSessions(), []);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Sessions</h1>
        <p className="text-sm text-muted-foreground">
          Conversations Honcho has observed. Click one to see its messages,
          summaries, and the LLM-ready context.
        </p>
      </header>

      <Card>
        {sessions.loading && <CardContent><LoadingState rows={6} /></CardContent>}
        {sessions.error && <CardContent><ErrorState error={sessions.error} onRetry={sessions.refetch} /></CardContent>}
        {sessions.data && (
          <>
            <CardHeader>
              <CardTitle className="text-base">
                {sessions.data.items.length} session
                {sessions.data.items.length === 1 ? "" : "s"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.data.items.length === 0 ? (
                <EmptyState message="No sessions in this workspace yet." />
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {sessions.data.items.map((s) => (
                    <li key={s.id}>
                      <button
                        onClick={() => navigate(`/sessions/${s.id}`)}
                        className={cn(
                          "w-full rounded-md border p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent/50"
                        )}
                      >
                        <div className="font-medium">{s.id}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {s.metadata && Object.keys(s.metadata).length > 0
                            ? `${Object.keys(s.metadata).length} metadata fields`
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
