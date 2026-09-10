import { AlertCircle, FolderOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function LoadingState({
  rows = 4,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3 py-2 animate-pulse", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-12 w-full rounded-lg bg-card/60" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
  className,
}: {
  error: Error;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-foreground",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div className="flex-1 space-y-1">
          <p className="font-semibold text-destructive">Request failed</p>
          <p className="text-xs text-muted-foreground break-words">
            {error.message || "An unexpected error occurred while communicating with Honcho."}
          </p>
          {onRetry && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 border-destructive/30 text-xs hover:bg-destructive/20"
                onClick={onRetry}
              >
                <RefreshCw className="mr-1.5 h-3 w-3" />
                Try again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  message,
  description,
  icon: Icon = FolderOpen,
  className,
  action,
}: {
  message: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 p-8 text-center",
        className
      )}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-foreground">{message}</p>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
