import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAsync } from "@/lib/use-async";
import { getClient } from "@/lib/client";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/async-view";
import { MarkdownView } from "@/components/shared/markdown-view";
import { PeerAvatar } from "@/lib/avatar";
import { CopyButton } from "@/components/shared/copy-button";
import { GitCompareArrows, ArrowLeftRight, FileText, IdCard, Sparkles } from "lucide-react";

export default function ComparePage() {
  const client = getClient();
  const [searchParams] = useSearchParams();
  const peers = useAsync(() => client.listPeers(), []);

  const [a, setA] = useState(searchParams.get("a") || "");
  const [b, setB] = useState(searchParams.get("b") || "");
  const [target, setTarget] = useState(searchParams.get("target") || "");

  // Auto-fill A and B with first two peers once loaded if not already selected
  useEffect(() => {
    if (peers.data && peers.data.items.length >= 2 && !a && !b) {
      setA(peers.data.items[0].id);
      setB(peers.data.items[1].id);
    } else if (peers.data && peers.data.items.length === 1 && !a) {
      setA(peers.data.items[0].id);
    }
  }, [peers.data]);

  const handleSwap = () => {
    const temp = a;
    setA(b);
    setB(temp);
  };

  const comparison = useAsync<{ peerId: string; representation: string | null; card: string | null }[]>(
    async () => {
      if (!a) return [];
      const ids = [a, b, target].filter(Boolean);
      const unique = Array.from(new Set(ids));
      const results: { peerId: string; representation: string | null; card: string | null }[] = [];
      for (const id of unique) {
        const [rep, card] = await Promise.all([
          client.peerRepresentation(id, {
            target: target || undefined,
          }).catch(() => null),
          client.peerCard(id, target || undefined).catch(() => null),
        ]);
        results.push({ peerId: id, representation: rep, card });
      }
      return results;
    },
    [a, b, target]
  );

  const peerOptions = peers.data?.items.map((p) => p.id) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Compare Perspectives</h1>
        <p className="text-sm text-muted-foreground">
          Inspect how different agents perceive the world or each other. Each column displays what <em>that specific peer</em> believes.
        </p>
      </div>

      {/* Peer Selectors Card */}
      <Card className="border-border/70 bg-card/60">
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-7 items-center">
            {/* Peer A */}
            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-400" /> Perspective A
              </label>
              <select
                value={a}
                onChange={(e) => setA(e.target.value)}
                className="w-full rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select Peer A…</option>
                {peerOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="sm:col-span-1 flex justify-center pt-5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-full border-border/70 hover:border-primary/40 hover:bg-primary/10"
                onClick={handleSwap}
                disabled={!a || !b}
                title="Swap Peer A and B"
              >
                <ArrowLeftRight className="h-4 w-4 text-primary" />
              </Button>
            </div>

            {/* Peer B */}
            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-400" /> Perspective B
              </label>
              <select
                value={b}
                onChange={(e) => setB(e.target.value)}
                className="w-full rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select Peer B…</option>
                {peerOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Subject Selector */}
          <div className="mt-4 pt-4 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Subject / Target (optional):</span>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="rounded-md border border-border/70 bg-background/60 px-3 py-1.5 text-xs font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">None (Self-models)</option>
                {peerOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-[11px] text-muted-foreground">
              {target
                ? `Comparing what each peer knows about "${target}".`
                : "Comparing each peer's internal self-representation."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Columns */}
      <Card className="border-border/70 bg-card/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <GitCompareArrows className="h-4 w-4 text-primary" /> Side-by-Side Perspectives
            </CardTitle>
            {comparison.data && (
              <Badge variant="muted" className="font-mono text-xs">
                {comparison.data.length} perspective{comparison.data.length === 1 ? "" : "s"}
              </Badge>
            )}
          </div>
          <CardDescription>
            {target
              ? `What ${a || "Peer A"} and ${b || "Peer B"} independently conclude about ${target}.`
              : "Direct contrast of each agent's self-representation and peer card."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {comparison.loading && <LoadingState rows={4} />}
          {comparison.error && <ErrorState error={comparison.error} onRetry={comparison.refetch} />}
          {comparison.data && (
            <>
              {comparison.data.length === 0 ? (
                <EmptyState
                  icon={GitCompareArrows}
                  message="Select at least one peer above to begin comparison."
                />
              ) : (
                <div
                  className={`grid gap-6 ${
                    comparison.data.length === 1
                      ? "grid-cols-1"
                      : comparison.data.length === 2
                      ? "grid-cols-1 md:grid-cols-2"
                      : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                  }`}
                >
                  {comparison.data.map((c) => (
                    <div
                      key={c.peerId}
                      className="flex flex-col space-y-4 rounded-xl border border-border/60 bg-card/40 p-4"
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between border-b border-border/40 pb-3">
                        <div className="flex items-center gap-2.5">
                          <PeerAvatar peerId={c.peerId} size="md" />
                          <div>
                            <span className="font-mono font-semibold text-sm text-foreground block">
                              {c.peerId}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                              Observer
                            </span>
                          </div>
                        </div>
                        <CopyButton text={c.peerId} />
                      </div>

                      {/* Representation */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                            <FileText className="h-3.5 w-3.5 text-primary" /> Representation
                          </span>
                          {c.representation && (
                            <span className="font-mono text-[10px] text-muted-foreground">
                              ~{Math.round(c.representation.length / 4)} tokens
                            </span>
                          )}
                        </div>

                        {c.representation ? (
                          <MarkdownView
                            content={c.representation}
                            maxHeightClass="max-h-96"
                          />
                        ) : (
                          <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
                            No representation available.
                          </div>
                        )}
                      </div>

                      {/* Peer Card */}
                      {c.card && (
                        <div className="space-y-1.5 pt-2 border-t border-border/40">
                          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                            <IdCard className="h-3.5 w-3.5 text-indigo-400" /> Peer Card
                          </span>
                          <MarkdownView
                            content={c.card}
                            maxHeightClass="max-h-48"
                            className="bg-background/40"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
