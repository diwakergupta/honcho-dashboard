import { cn } from "./utils";

const PALETTES = [
  { bg: "bg-cyan-500/15", border: "border-cyan-500/30", text: "text-cyan-400", gradient: "from-cyan-500 to-blue-600" },
  { bg: "bg-indigo-500/15", border: "border-indigo-500/30", text: "text-indigo-400", gradient: "from-indigo-500 to-purple-600" },
  { bg: "bg-emerald-500/15", border: "border-emerald-500/30", text: "text-emerald-400", gradient: "from-emerald-500 to-teal-600" },
  { bg: "bg-amber-500/15", border: "border-amber-500/30", text: "text-amber-400", gradient: "from-amber-500 to-orange-600" },
  { bg: "bg-rose-500/15", border: "border-rose-500/30", text: "text-rose-400", gradient: "from-rose-500 to-pink-600" },
  { bg: "bg-violet-500/15", border: "border-violet-500/30", text: "text-violet-400", gradient: "from-violet-500 to-purple-600" },
  { bg: "bg-teal-500/15", border: "border-teal-500/30", text: "text-teal-400", gradient: "from-teal-500 to-emerald-600" },
  { bg: "bg-sky-500/15", border: "border-sky-500/30", text: "text-sky-400", gradient: "from-sky-500 to-blue-500" },
];

export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getPeerPalette(peerId: string) {
  if (!peerId) return PALETTES[0];
  const hash = hashString(peerId);
  return PALETTES[hash % PALETTES.length];
}

export function getPeerInitials(peerId: string): string {
  if (!peerId) return "?";
  const parts = peerId.split(/[-_.\s]+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return peerId.slice(0, 2).toUpperCase();
}

export function PeerAvatar({
  peerId,
  size = "md",
  className,
}: {
  peerId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const palette = getPeerPalette(peerId);
  const initials = getPeerInitials(peerId);

  const sizeClasses = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-8 w-8 text-xs",
    lg: "h-10 w-10 text-sm",
  }[size];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg border font-semibold tracking-wider select-none",
        palette.bg,
        palette.border,
        palette.text,
        sizeClasses,
        className
      )}
      title={peerId}
    >
      {initials}
    </div>
  );
}
