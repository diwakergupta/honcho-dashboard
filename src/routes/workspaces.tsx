import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAsync } from "@/lib/use-async";
import { getClient, connect, resetClient } from "@/lib/client";
import { loadConfig, saveConfig } from "@/lib/config";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/async-view";
import { CopyButton } from "@/components/shared/copy-button";
import { Brain, Check, ArrowRight, Search, PlusCircle } from "lucide-react";

export default function WorkspacesPage() {
  const client = getClient();
  const navigate = useNavigate();
  const config = loadConfig();
  const [filter, setFilter] = useState("");
  const [customWorkspace, setCustomWorkspace] = useState("");

  const workspaces = useAsync(() => client.workspaces(), []);

  const switchTo = (id: string) => {
    if (!id.trim()) return;
    const currentConfig = config ?? {
      apiKey: "",
      baseURL: "http://localhost:3001",
      workspaceId: "hermes",
    };
    resetClient();
    connect(currentConfig.apiKey, currentConfig.baseURL, id.trim());
    saveConfig({ ...currentConfig, workspaceId: id.trim() });
    navigate("/");
  };

  const filtered = (workspaces.data ?? []).filter((id) =>
    id.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Workspaces</h1>
        <p className="text-sm text-muted-foreground">
          All workspaces your API key can access. Switch contexts or enter a workspace name directly.
        </p>
      </header>

      {/* Quick workspace switch input */}
      <Card className="border-border/70 bg-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <PlusCircle className="h-4 w-4 text-primary" /> Switch or Create Workspace
          </CardTitle>
          <CardDescription>
            Enter any workspace ID to switch context. If it doesn't exist yet, Honcho will initialize it upon first use.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customWorkspace.trim()) {
                switchTo(customWorkspace.trim());
              }
            }}
            className="flex gap-2 max-w-md"
          >
            <Input
              value={customWorkspace}
              onChange={(e) => setCustomWorkspace(e.target.value)}
              placeholder="e.g. hermes"
              className="font-mono text-sm"
            />
            <Button type="submit" disabled={!customWorkspace.trim()}>
              Switch <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Workspaces List */}
      <Card className="border-border/70 bg-card/60">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4 text-primary" /> Available Workspaces
            </CardTitle>
            <CardDescription className="mt-1">
              Currently viewing: <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-primary">{client.workspaceId}</code>
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter workspaces…"
              className="pl-8 text-xs"
            />
          </div>
        </CardHeader>

        <CardContent>
          {workspaces.loading && <LoadingState rows={4} />}
          {workspaces.error && (
            <ErrorState error={workspaces.error} onRetry={workspaces.refetch} />
          )}
          {workspaces.data && (
            <>
              {filtered.length === 0 ? (
                <EmptyState
                  message={filter ? "No workspaces matching your filter." : "No workspaces found for this API key."}
                  description={filter ? "Try a different search term or enter a new workspace ID above." : "You can enter a workspace ID above to start using it."}
                />
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((id) => {
                    const active = id === client.workspaceId;
                    return (
                      <li key={id}>
                        <div
                          className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                            active
                              ? "border-primary/50 bg-primary/5 shadow-sm shadow-primary/5 ring-1 ring-primary/20"
                              : "border-border/70 bg-card/40 hover:border-border hover:bg-accent/30"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="min-w-0 flex-1">
                              <span className="truncate font-mono text-sm font-semibold block text-foreground">
                                {id}
                              </span>
                              {active && (
                                <Badge variant="default" className="mt-1 text-[10px] h-5 bg-primary/20 text-primary border-primary/30">
                                  <Check className="mr-1 h-3 w-3" /> Active Workspace
                                </Badge>
                              )}
                            </div>
                            <CopyButton text={id} label="Copy ID" />
                          </div>

                          <div className="mt-2 pt-2 border-t border-border/40 flex justify-end">
                            <Button
                              size="sm"
                              variant={active ? "secondary" : "default"}
                              disabled={active}
                              onClick={() => switchTo(id)}
                              className="text-xs h-8"
                            >
                              {active ? "Current" : "Switch context"}
                            </Button>
                          </div>
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
