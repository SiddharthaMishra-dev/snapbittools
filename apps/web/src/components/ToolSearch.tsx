import React from "react";

import { IconClock, IconSearch } from "@tabler/icons-react";
import { Dialog } from "radix-ui";
import { useLocation, useNavigate } from "@tanstack/react-router";

import { tools, type ToolDefinition } from "@/data/tools";
import { readRecentSearches, rememberSearch, searchTools } from "@/lib/toolSearch";
import { cn } from "@/lib/utils";

function browserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function shortcutLabel(isMac: boolean) {
  return isMac ? "⌘K" : "Ctrl K";
}

function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim().split(/\s+/)[0] ?? "";
  if (!needle) return text;

  const index = text.toLowerCase().indexOf(needle.toLowerCase());
  if (index < 0) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-transparent text-brand-primary p-0 font-semibold">{text.slice(index, index + needle.length)}</mark>
      {text.slice(index + needle.length)}
    </>
  );
}

export function ToolSearch() {
  const [open, setOpen] = React.useState(false);
  const [isMac, setIsMac] = React.useState(false);

  React.useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  const pathname = useLocation({ select: (location) => location.pathname });

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing || event.repeat) return;
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return;
      if (event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      setOpen((current) => !current);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Search tools (${shortcutLabel(isMac)})`}
        title={`Search tools (${shortcutLabel(isMac)})`}
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-2 px-2.5 py-2 rounded-lg shrink-0 border text-brand-primary transition-colors duration-200",
          "bg-brand-primary/10 border-brand-primary/20 dark:bg-brand-primary/20 dark:border-brand-primary/35",
          "hover:bg-brand-primary/15 hover:border-brand-primary/30 dark:hover:bg-brand-primary/25",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary",
          open && "bg-brand-primary/20 border-brand-primary/40 dark:bg-brand-primary/30",
        )}
      >
        <IconSearch size={18} stroke={1.75} />
        <span className="hidden xl:inline text-sm font-medium">Search</span>
        <kbd className="hidden md:inline-flex items-center rounded-md border border-brand-primary/20 bg-brand-primary/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-brand-primary">
          {shortcutLabel(isMac)}
        </kbd>
      </button>
      <ToolSearchDialog open={open} onOpenChange={setOpen} isMac={isMac} />
    </>
  );
}

function ToolSearchDialog({ open, onOpenChange, isMac }: { open: boolean; onOpenChange: (open: boolean) => void; isMac: boolean }) {
  const navigate = useNavigate();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = React.useState("");
  const [recents, setRecents] = React.useState<string[]>([]);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const results = React.useMemo(() => searchTools(query, tools), [query]);
  const hasQuery = query.trim().length > 0;

  React.useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    setRecents(readRecentSearches(browserStorage()));
  }, [open]);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const goToTool = React.useCallback(
    (tool: ToolDefinition, searchQuery = query) => {
      setRecents(rememberSearch(searchQuery, browserStorage()));
      onOpenChange(false);
      void navigate({ to: tool.href });
    },
    [navigate, onOpenChange, query],
  );

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      if (results.length === 0) return;
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
      return;
    }

    if (event.key === "ArrowUp") {
      if (results.length === 0) return;
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
      return;
    }

    if (event.key === "Enter") {
      const tool = results[activeIndex];
      if (!tool) return;
      event.preventDefault();
      goToTool(tool);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/50" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-[16vh] z-[81] w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-theme-border bg-theme-surface-elevated shadow-[0_18px_50px_rgba(15,23,42,0.22)] outline-none"
          onCloseAutoFocus={(event) => event.preventDefault()}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <Dialog.Title className="sr-only">Search tools</Dialog.Title>

          <div className="flex items-center gap-3 border-b border-theme-border px-4">
            <IconSearch className="text-theme-muted shrink-0" size={20} stroke={1.75} />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Search tools…"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              aria-autocomplete="list"
              aria-controls="tool-search-results"
              aria-activedescendant={hasQuery && results[activeIndex] ? `tool-search-option-${results[activeIndex].slug}` : undefined}
              className="w-full bg-transparent py-3.5 text-base text-theme-heading placeholder:text-theme-muted outline-none"
            />
            <kbd className="hidden sm:inline-flex shrink-0 items-center rounded-md border border-theme-border bg-theme-surface-muted px-1.5 py-0.5 text-[10px] font-semibold text-theme-muted">
              Esc
            </kbd>
          </div>

          <div className="max-h-[min(24rem,52vh)] overflow-y-auto p-2">
            {!hasQuery && recents.length > 0 ? (
              <div className="mb-1">
                <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-theme-muted">Recent</p>
                <ul className="space-y-0.5">
                  {recents.map((recent) => (
                    <li key={recent}>
                      <button
                        type="button"
                        onClick={() => {
                          setQuery(recent);
                          inputRef.current?.focus();
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm text-theme-heading hover:bg-theme-nav-link-hover-bg"
                      >
                        <IconClock className="text-theme-muted shrink-0" size={16} stroke={1.75} />
                        <span className="truncate">{recent}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {!hasQuery && recents.length === 0 ? (
              <p className="px-2.5 py-8 text-center text-sm text-theme-muted">
                Search by name or job — compress, PDF, JSON, Base64.
                <span className="mt-2 block text-xs">Shortcut {shortcutLabel(isMac)}</span>
              </p>
            ) : null}

            {hasQuery && results.length === 0 ? (
              <p className="px-2.5 py-8 text-center text-sm text-theme-muted">
                No tools match “{query.trim()}”. Try compress, PDF, or JSON.
              </p>
            ) : null}

            {hasQuery && results.length > 0 ? (
              <ul id="tool-search-results" role="listbox" aria-label="Tools">
                {results.map((tool, index) => {
                  const Icon = tool.icon;
                  const active = index === activeIndex;
                  return (
                    <li key={tool.slug} role="presentation">
                      <button
                        type="button"
                        role="option"
                        id={`tool-search-option-${tool.slug}`}
                        aria-selected={active}
                        onMouseEnter={() => setActiveIndex(index)}
                        onPointerDown={(event) => {
                          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
                          event.preventDefault();
                          goToTool(tool);
                        }}
                        onClick={(event) => {
                          event.preventDefault();
                          goToTool(tool);
                        }}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors",
                          active ? "bg-theme-nav-link-hover-bg" : "hover:bg-theme-surface-muted",
                        )}
                      >
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-b from-brand-primary to-brand-hover text-white shadow-sm ring-1 ring-brand-primary/70">
                          <Icon size={18} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-theme-heading">
                              <Highlight text={tool.name} query={query} />
                            </span>
                            <span className="shrink-0 rounded-full bg-theme-surface-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-theme-muted">
                              {tool.category}
                            </span>
                          </span>
                          <span className="mt-0.5 line-clamp-1 block text-xs text-theme-muted">{tool.description}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
