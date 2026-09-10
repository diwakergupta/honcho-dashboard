import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MessagesSquare,
  GitCompareArrows,
  LogOut,
  Brain,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { clearConfig, loadConfig } from "@/lib/config";
import { resetClient } from "@/lib/client";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/workspaces", label: "Workspaces", icon: Brain },
  { to: "/peers", label: "Peers", icon: Users },
  { to: "/sessions", label: "Sessions", icon: MessagesSquare },
  { to: "/compare", label: "Compare", icon: GitCompareArrows },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const config = loadConfig();
  const activePath = location.pathname;

  const handleSignOut = () => {
    clearConfig();
    resetClient();
    navigate("/login");
  };

  const serverDisplay = config?.baseURL
    ? config.baseURL.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "localhost:3001";

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border/70 bg-card/60 backdrop-blur-md">
      {/* Brand & Workspace Header */}
      <div className="flex flex-col gap-2 border-b border-border/70 p-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            onClick={onNavigate}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 shadow-sm shadow-cyan-500/10">
              <Brain className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <span className="font-semibold tracking-tight text-foreground text-sm">Honcho</span>
              <span className="block text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Dashboard</span>
            </div>
          </Link>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium font-mono text-primary border border-primary/20">
            v3 API
          </span>
        </div>

        {/* Current Workspace quick-switch card */}
        <Link
          to="/workspaces"
          onClick={onNavigate}
          className="group mt-1 flex items-center justify-between rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-xs transition-all hover:border-primary/40 hover:bg-accent/40"
          title="Switch workspace"
        >
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Workspace</span>
            <span className="truncate font-medium text-foreground group-hover:text-primary">
              {config?.workspaceId || "hermes"}
            </span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1.5 p-3">
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 font-mono">
          Explore
        </p>
        {nav.map((item) => {
          const isActive =
            item.to === "/"
              ? activePath === "/"
              : activePath.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/15 text-primary shadow-sm shadow-primary/5"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary" />
              )}
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Server info & Sign out */}
      <div className="border-t border-border/70 p-3 space-y-2">
        <div className="flex items-center gap-2 px-2 py-1 text-[11px] text-muted-foreground">
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span className="truncate font-mono" title={config?.baseURL || "Honcho Cloud"}>
            {serverDisplay}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <a
            href="https://docs.honcho.dev"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
          >
            <span>Docs</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>
      </div>
    </aside>
  );
}
