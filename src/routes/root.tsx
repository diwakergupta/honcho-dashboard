import { useState } from "react";
import { Outlet, useLocation, Navigate, Link } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { loadConfig } from "@/lib/config";
import { Menu, X, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RootLayout() {
  const path = useLocation().pathname;
  const [mobileOpen, setMobileOpen] = useState(false);

  if (path === "/login") {
    return <Outlet />;
  }

  const config = loadConfig();
  if (!config) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex w-64 max-w-[80vw] flex-1 flex-col z-10 shadow-2xl">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="flex h-14 items-center justify-between border-b border-border/70 px-4 md:hidden bg-card/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Brain className="h-5 w-5 text-primary" />
              <span className="tracking-tight">Honcho</span>
            </Link>
          </div>
          <span className="truncate rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
            {config.workspaceId || "hermes"}
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
