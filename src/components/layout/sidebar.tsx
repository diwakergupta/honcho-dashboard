import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MessagesSquare,
  GitCompareArrows,
  LogOut,
  Brain,
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

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const config = loadConfig();
  const activePath = location.pathname;

  const handleSignOut = () => {
    clearConfig();
    resetClient();
    navigate("/login");
  };

  return (
    <aside className="flex w-56 flex-col border-r bg-card/40">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Brain className="h-5 w-5 text-primary" />
        <span className="font-semibold tracking-tight">Honcho</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {config?.workspaceId ?? ""}
        </span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const isActive =
            item.to === "/"
              ? activePath === "/"
              : activePath.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
