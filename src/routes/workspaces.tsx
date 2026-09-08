import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAsync } from "@/lib/use-async";
import { connect, resetClient, setClient } from "@/lib/client";
import { loadConfig, saveConfig } from "@/lib/config";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/async-view";
import { Brain } from "lucide-react";

export default function WorkspacesPage() {
  const client = connect(
    loadConfig()!.apiKey,
    loadConfig()?.baseURL,
    loadConfig()?.workspaceId
  );
  const navigate = useNavigate();

  const workspaces = useAsync(() => client.workspaces(), []);
  const switchTo = (id: string) => {
    if (!id) return;
    const config = loadConfig();
    if (!config) return;
    resetClient();
    connect(config.apiKey, config.baseURL, id);
    setClient(client);
    saveConfig({ ...config, workspaceId: id });
    navigate("/");
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Workspaces</h1>
        <p className="text-sm text-muted-foreground">
          All workspaces your API key can access. Select one to switch the
          dashboard context.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-4 w-4" /> Available workspaces
          </CardTitle>
          <CardDescription>
            Currently viewing <code className="rounded bg-muted px-1.5 py-0.5">{client.workspaceId}</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workspaces.loading && <LoadingState rows={4} />}
          {workspaces.error && (
            <ErrorState
              error={workspaces.error}
              onRetry={workspaces.refetch}
            />
          )}
          {workspaces.data && (
            <>
              {workspaces.data.length === 0 ? (
                <EmptyState message="No workspaces found for this key." />
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {workspaces.data.map((id) => {
                    const active = id === client.workspaceId;
                    return (
                      <li key={id}>
                        <div className="flex items-center justify-between rounded-md border p-4">
                          <div>
                            <div className="font-medium">{id}</div>
                            {active && (
                              <span className="text-xs text-primary">current</span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant={active ? "secondary" : "default"}
                            disabled={active}
                            onClick={() => switchTo(id)}
                          >
                            {active ? "Viewing" : "Switch"}
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
