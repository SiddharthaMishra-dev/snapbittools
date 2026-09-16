import { describe, expect, it } from "vitest";

import type { ToolDefinition } from "@/data/tools";

import { MAX_RECENT_SEARCHES, readRecentSearches, rememberSearch, searchTools, TOOL_SEARCH_STORAGE_KEY } from "./toolSearch";

function tool(partial: Pick<ToolDefinition, "slug" | "name" | "category"> & Partial<ToolDefinition>): ToolDefinition {
  return {
    href: `/${partial.slug}`,
    description: partial.description ?? "",
    icon: () => null,
    keywords: partial.keywords ?? [],
    ...partial,
  };
}

const catalog: ToolDefinition[] = [
  tool({
    slug: "pdf-to-jpg",
    name: "PDF to JPG",
    category: "PDF",
    description: "Convert PDF pages to JPG or PNG.",
    keywords: ["pdf to jpg", "pdf to image"],
  }),
  tool({
    slug: "image-compressor",
    name: "Image Compressor",
    category: "Images",
    description: "Shrink file size without losing quality.",
    keywords: ["compress", "optimize"],
  }),
  tool({
    slug: "pdf-compressor",
    name: "PDF Compressor",
    category: "PDF",
    description: "Shrink PDF size in your browser.",
    keywords: ["compress pdf", "shrink pdf"],
  }),
  tool({
    slug: "json-formatter",
    name: "JSON Formatter",
    category: "Data",
    description: "Format, validate, and minify JSON.",
    keywords: ["json", "format"],
  }),
];

function memoryStorage(initial: Record<string, string> = {}) {
  const store = { ...initial };
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    store,
  };
}

describe("searchTools", () => {
  it("returns nothing for a blank query", () => {
    expect(searchTools("   ", catalog)).toEqual([]);
  });

  it("ranks PDF tools ahead of unrelated tools", () => {
    const results = searchTools("pdf", catalog).map((item) => item.slug);
    expect(results.slice(0, 2)).toEqual(["pdf-compressor", "pdf-to-jpg"]);
    expect(results).not.toContain("image-compressor");
  });

  it("finds tools from keywords and descriptions", () => {
    expect(searchTools("compress", catalog).map((item) => item.slug)).toEqual(["image-compressor", "pdf-compressor"]);
    expect(searchTools("json", catalog).map((item) => item.slug)).toEqual(["json-formatter"]);
  });

  it("requires every word to match", () => {
    expect(searchTools("pdf jpg", catalog).map((item) => item.slug)).toEqual(["pdf-to-jpg"]);
    expect(searchTools("pdf banana", catalog)).toEqual([]);
  });
});

describe("rememberSearch", () => {
  it("stores unique queries, newest first, capped at three", () => {
    const storage = memoryStorage();

    rememberSearch("pdf", storage);
    rememberSearch("json", storage);
    rememberSearch("compress", storage);
    const recent = rememberSearch("csv", storage);

    expect(recent).toEqual(["csv", "compress", "json"]);
    expect(recent).toHaveLength(MAX_RECENT_SEARCHES);
    expect(JSON.parse(storage.store[TOOL_SEARCH_STORAGE_KEY])).toEqual(recent);
  });

  it("moves a repeated query to the front without duplicating it", () => {
    const storage = memoryStorage();
    rememberSearch("pdf", storage);
    rememberSearch("json", storage);
    expect(rememberSearch("PDF", storage)).toEqual(["PDF", "json"]);
  });

  it("ignores blank queries and broken stored JSON", () => {
    const storage = memoryStorage({ [TOOL_SEARCH_STORAGE_KEY]: "{not-json" });
    expect(readRecentSearches(storage)).toEqual([]);
    expect(rememberSearch("   ", storage)).toEqual([]);
  });
});
