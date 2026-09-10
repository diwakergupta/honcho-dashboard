import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveConfig, loadConfig } from "@/lib/config";
import { connect, resetClient } from "@/lib/client";
import { normalizeBaseURL } from "@/lib/utils";
import { Brain, Eye, EyeOff, KeyRound, Server, Layers, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const existing = loadConfig();

  const [apiKey, setApiKey] = useState(existing?.apiKey ?? "");
  const [baseURL, setBaseURL] = useState(existing?.baseURL ?? "http://localhost:3001");
  const [workspaceId, setWorkspaceId] = useState(existing?.workspaceId ?? "hermes");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    resetClient();

    // Gracefully normalize baseURL (e.g. "localhost:3001" -> "http://localhost:3001")
    const cleanBaseURL = normalizeBaseURL(baseURL) ?? "http://localhost:3001";
    const cleanWorkspaceId = workspaceId.trim() || "hermes";
    const cleanApiKey = apiKey.trim();

    try {
      const client = connect(cleanApiKey, cleanBaseURL, cleanWorkspaceId);
      // Validate credentials / server availability by fetching metadata
      await client.metadata();
      saveConfig({
        apiKey: cleanApiKey,
        baseURL: cleanBaseURL,
        workspaceId: cleanWorkspaceId,
      });
      navigate("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("networkerror")) {
        setError(`Failed to connect to Honcho at ${cleanBaseURL}. Ensure your Honcho instance is running and CORS_ORIGINS includes http://localhost:3000.`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#090d16] p-4 sm:p-6 overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

      <Card className="relative w-full max-w-md border-border/70 bg-card/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="items-center text-center pb-6">
          <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/15">
            <Brain className="h-7 w-7" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Honcho Dashboard</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1.5 max-w-xs">
            Connect to your local or remote Honcho memory service to inspect what agents have learned.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="apiKey" className="flex items-center gap-1.5 text-xs font-medium">
                  <KeyRound className="h-3.5 w-3.5 text-primary" /> API Key
                </Label>
                <span className="text-[11px] text-muted-foreground">Optional</span>
              </div>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Leave empty for unauthenticated Honcho"
                  className="pr-10 font-mono text-sm bg-background/50"
                  autoFocus={!apiKey}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  title={showKey ? "Hide API key" : "Show API key"}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Optional for self-hosted local instances without authentication enabled.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseURL" className="flex items-center gap-1.5 text-xs font-medium">
                <Server className="h-3.5 w-3.5 text-muted-foreground" /> Server URL
              </Label>
              <Input
                id="baseURL"
                value={baseURL}
                onChange={(e) => setBaseURL(e.target.value)}
                placeholder="http://localhost:3001"
                className="font-mono text-sm bg-background/50"
              />
              <p className="text-[11px] text-muted-foreground">
                Defaults to <code className="text-foreground">http://localhost:3001</code>. <code className="text-foreground">http://</code> is added automatically if omitted.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workspaceId" className="flex items-center gap-1.5 text-xs font-medium">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" /> Workspace ID
              </Label>
              <Input
                id="workspaceId"
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
                placeholder="hermes"
                className="font-mono text-sm bg-background/50"
              />
              <p className="text-[11px] text-muted-foreground">
                Defaults to <code className="text-foreground">hermes</code>.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full font-medium shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting…
                </>
              ) : (
                <>
                  Connect
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 border-t border-border/50 pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Config is stored locally in your browser's <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">localStorage</code>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
