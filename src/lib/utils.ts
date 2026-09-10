import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string | undefined | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + "…";
}

/**
 * Normalizes a user-provided Honcho server URL:
 * - Gracefully handles omitted scheme (e.g. "localhost:3001" -> "http://localhost:3001")
 * - Trims surrounding whitespace and trailing slashes
 * - Returns undefined if empty or not provided
 */
export function normalizeBaseURL(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  let trimmed = url.trim();
  if (!trimmed) return undefined;
  // Strip trailing slashes
  trimmed = trimmed.replace(/\/+$/, "");
  // If no scheme is present, default to http://
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `http://${trimmed}`;
  }
  return trimmed;
}
