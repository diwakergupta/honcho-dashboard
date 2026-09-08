import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveConfig } from "@/lib/config";
import { connect, resetClient } from "@/lib/client";
import { Brain } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");
  const [baseURL, setBaseURL] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    resetClient();
    try {
      const client = connect(apiKey, baseURL || undefined, workspaceId || undefined);
      // Validate credentials by fetching metadata (workspace must exist or be creatable)
      await client.metadata();
      saveConfig({
        apiKey,
        baseURL: baseURL || undefined,
        workspaceId: workspaceId || undefined,
      });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <Brain className="mb-2 h-8 w-8 text-primary" />
          <CardTitle className="text-2xl">Honcho Dashboard</CardTitle>
          <CardDescription>
            Connect to your self-hosted Honcho instance to explore what it has
            learned.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="honcho_..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseURL">Server URL (optional)</Label>
              <Input
                id="baseURL"
                value={baseURL}
                onChange={(e) => setBaseURL(e.target.value)}
                placeholder="http://localhost:8000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspaceId">Workspace (optional)</Label>
              <Input
                id="workspaceId"
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
                placeholder="default"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Connecting…" : "Connect"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
