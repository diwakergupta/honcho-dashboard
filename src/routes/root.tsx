import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { loadConfig } from "@/lib/config";

export function RootLayout() {
  const path = useLocation().pathname;
  if (path === "/login") {
    return <Outlet />;
  }
  if (!loadConfig()) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-sm space-y-3 text-center">
          <p className="font-medium">Not authenticated</p>
          <p className="text-sm text-muted-foreground">
            Please sign in to view the dashboard.
          </p>
          <a
            href="/login"
            className="text-sm text-primary underline underline-offset-4"
          >
            Go to login
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
