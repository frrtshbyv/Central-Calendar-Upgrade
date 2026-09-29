import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert a tag display name into one or more lowercase hashtag tokens.
 *
 *   "Economy & Finance"        -> ["economy", "finance"]
 *   "Marketing / Media"        -> ["marketing", "media"]
 *   "Politics and Diplomacy"   -> ["politics", "diplomacy"]
 *   "Energy"                   -> ["energy"]
 *
 * The database value is unchanged — this is a UI-only transformation.
 */
export function splitTagName(name: string | null | undefined): string[] {
  if (!name) return [];
  return name
    .split(/\s*(?:&|,|\/| and | и )\s*/i)
    .map((part) => part.trim().toLowerCase().replace(/\s+/g, "-"))
    .filter(Boolean);
}
