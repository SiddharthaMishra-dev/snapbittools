import type { ToolDefinition } from "@/data/tools";

export const TOOL_SEARCH_STORAGE_KEY = "snapbit-recent-tool-searches";
export const MAX_RECENT_SEARCHES = 3;

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function normalizeSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ").toLowerCase();
}

function scoreToken(token: string, tool: ToolDefinition): number {
  const name = tool.name.toLowerCase();
  const slug = tool.slug.toLowerCase().replace(/-/g, " ");
  const category = tool.category.toLowerCase();
  const description = tool.description.toLowerCase();
  const keywords = tool.keywords.map((keyword) => keyword.toLowerCase());

  if (name === token) return 100;
  if (name.startsWith(token)) return 90;
  if (name.includes(token)) return 70;
  if (slug.startsWith(token) || slug.includes(token)) return 60;
  if (keywords.some((keyword) => keyword === token)) return 55;
  if (keywords.some((keyword) => keyword.startsWith(token))) return 45;
  if (keywords.some((keyword) => keyword.includes(token))) return 35;
  if (category === token || category.startsWith(token)) return 30;
  if (description.includes(token)) return 20;
  return 0;
}

export function searchTools(query: string, catalog: ToolDefinition[]): ToolDefinition[] {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) return [];

  const tokens = normalized.split(" ").filter(Boolean);

  return catalog
    .map((tool) => {
      const scores = tokens.map((token) => scoreToken(token, tool));
      if (scores.some((score) => score === 0)) return null;
      return { tool, score: scores.reduce((sum, score) => sum + score, 0) };
    })
    .filter((hit): hit is { tool: ToolDefinition; score: number } => hit !== null)
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
    .map((hit) => hit.tool);
}

export function readRecentSearches(storage?: StorageLike | null): string[] {
  if (!storage) return [];

  try {
    const raw = storage.getItem(TOOL_SEARCH_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const seen = new Set<string>();
    const recent: string[] = [];

    for (const item of parsed) {
      if (typeof item !== "string") continue;
      const trimmed = item.trim().replace(/\s+/g, " ");
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      recent.push(trimmed);
      if (recent.length >= MAX_RECENT_SEARCHES) break;
    }

    return recent;
  } catch {
    return [];
  }
}

export function rememberSearch(query: string, storage?: StorageLike | null): string[] {
  if (!storage) return [];

  const trimmed = query.trim().replace(/\s+/g, " ");
  const existing = readRecentSearches(storage);
  if (!trimmed) return existing;

  const next = [trimmed, ...existing.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT_SEARCHES);

  try {
    storage.setItem(TOOL_SEARCH_STORAGE_KEY, JSON.stringify(next));
  } catch {
    return existing;
  }

  return next;
}
