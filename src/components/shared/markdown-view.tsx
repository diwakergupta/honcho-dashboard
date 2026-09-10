import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Copy, Code, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MarkdownViewProps {
  content: string;
  className?: string;
  allowToggle?: boolean;
  maxHeightClass?: string;
  showCopy?: boolean;
}

export function MarkdownView({
  content,
  className,
  allowToggle = true,
  maxHeightClass = "max-h-96",
  showCopy = true,
}: MarkdownViewProps) {
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments where navigator.clipboard is unavailable
      const ta = document.createElement("textarea");
      ta.value = content;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn("group relative rounded-lg border bg-card/60 transition-all", className)}>
      {(showCopy || allowToggle) && (
        <div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1.5 opacity-80 backdrop-blur-md transition-opacity hover:opacity-100 group-hover:opacity-100">
          {allowToggle && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowRaw(!showRaw)}
              title={showRaw ? "Show rendered markdown" : "Show raw source"}
            >
              {showRaw ? (
                <>
                  <Eye className="mr-1 h-3.5 w-3.5" />
                  Formatted
                </>
              ) : (
                <>
                  <Code className="mr-1 h-3.5 w-3.5" />
                  Raw
                </>
              )}
            </Button>
          )}
          {showCopy && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 px-2 text-xs transition-colors",
                copied
                  ? "text-emerald-400 hover:text-emerald-300"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="mr-1 h-3.5 w-3.5 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </Button>
          )}
        </div>
      )}

      <div className={cn("overflow-y-auto p-4 pr-16 text-sm", maxHeightClass)}>
        {showRaw ? (
          <pre className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">
            {content}
          </pre>
        ) : (
          <div className="prose prose-invert max-w-none space-y-2 text-sm leading-relaxed text-foreground/90">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="border-b border-border/50 pb-1 text-lg font-semibold text-foreground">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="mt-3 text-base font-semibold text-foreground">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mt-2 text-sm font-semibold text-foreground">
                    {children}
                  </h3>
                ),
                ul: ({ children }) => (
                  <ul className="my-1.5 list-disc space-y-1 pl-5 text-sm text-foreground/90">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-1.5 list-decimal space-y-1 pl-5 text-sm text-foreground/90">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="text-sm">{children}</li>,
                p: ({ children }) => (
                  <p className="my-1.5 leading-relaxed text-foreground/90">{children}</p>
                ),
                code: ({ children, className }) => {
                  const isInline = !className && typeof children === "string" && !children.includes("\n");
                  if (isInline) {
                    return (
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <pre className="my-2 overflow-x-auto rounded-md bg-zinc-900/90 p-3 font-mono text-xs text-zinc-200">
                      <code>{children}</code>
                    </pre>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="my-2 border-l-2 border-primary/50 pl-3 italic text-muted-foreground">
                    {children}
                  </blockquote>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">{children}</strong>
                ),
                hr: () => <hr className="my-3 border-border/40" />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
