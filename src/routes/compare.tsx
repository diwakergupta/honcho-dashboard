import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAsync } from "@/lib/use-async";
import { getClient } from "@/lib/client";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/async-view";
import { GitCompareArrows } from "lucide-react";

export default function ComparePage() {
  const client = getClient();
  const peers = useAsync(() => client.listPeers(), []);

  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [target, setTarget] = useState("");

  // Auto-fill A and B with the first two peers once loaded
  useEffect(() => {
    if (peers.data && peers.data.items.length >= 2 && !a) {
      setA(peers.data.items[0].id);
      setB(peers.data.items[1].id);
    } else if (peers.data && peers.data.items.length === 1 && !a) {
      setA(peers.data.items[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peers.data]);

  const comparison = useAsync<{ peerId: string; representation: string | null; card: string | null }[]>(
    async () => {
      if (!a) return [];
      const ids = [a, b, target].filter(Boolean);
      // Unique ordered ids to compare
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
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Compare perspectives</h1>
        <p className="text-sm text-muted-foreground">
          See the same subject through different peers' eyes. Each column is the
          representation + card that <em>that</em> peer would see — highlighting
          how knowledge differs across the agents sharing this workspace.
        </p>
      </header>

      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
          <Picker
            label="Peer A"
            value={a}
            onChange={setA}
            options={peerOptions}
          />
          <Picker
            label="Peer B"
            value={b}
            onChange={setB}
            options={peerOptions}
          />
          <Picker
            label="Subject (target)"
            value={target}
            onChange={setTarget}
            options={peerOptions}
            placeholder="optional"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompareArrows className="h-4 w-4" /> What each peer sees
          </CardTitle>
          <CardDescription>
            If a target is set, this is "what {a} and {b} each believe about the
            target". Otherwise each column is the peer's own self-model.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {comparison.loading && <LoadingState rows={3} />}
          {comparison.error && <ErrorState error={comparison.error} onRetry={comparison.refetch} />}
          {comparison.data && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {comparison.data.map((c) => (
                <div key={c.peerId} className="space-y-3">
                  <h3 className="font-semibold">{c.peerId}</h3>
                  <div>
                    <h4 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Representation
                    </h4>
                    {c.representation ? (
                      <pre className="max-h-80 whitespace-pre-wrap overflow-y-auto rounded-md bg-muted/50 p-3 text-xs">
                        {c.representation}
                      </pre>
                    ) : (
                      <EmptyState message="No representation available." />
                    )}
                  </div>
                  {c.card && (
                    <div>
                      <h4 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Peer card
                      </h4>
                      <pre className="max-h-40 whitespace-pre-wrap overflow-y-auto rounded-md bg-muted/50 p-3 text-xs">
                        {c.card}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Picker({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Input
        list={`picker-${label}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="capitalize"
      />
      <datalist id={`picker-${label}`}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </div>
  );
}
