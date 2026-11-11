"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import type { Category, Source } from "@/lib/news/feeds";
import type { NewsItem } from "@/lib/news/rss";
import NewsCard from "./NewsCard";

const PAGE_SIZE = 24;
const READ_KEY = "beritaindo:read";
const MAX_REMEMBERED = 1000; // links are tiny, but don't grow forever

const TIME_FORMAT = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

/** Page numbers with gaps, e.g. 1 … 4 5 6 … 12. */
function pageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, 5, null, total];
  if (current >= total - 2)
    return [1, null, total - 4, total - 3, total - 2, total - 1, total];
  return [1, null, current - 1, current, current + 1, null, total];
}

function loadRead(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

function saveRead(read: Set<string>) {
  try {
    localStorage.setItem(
      READ_KEY,
      JSON.stringify([...read].slice(-MAX_REMEMBERED)),
    );
  } catch {
    // Private browsing or storage full: read marks just won't persist.
  }
}

export default function NewsBrowser({
  items,
  sources,
  categories,
  failed,
  updatedAt,
}: {
  items: NewsItem[];
  sources: Source[];
  categories: Category[];
  failed: string[];
  updatedAt: string;
}) {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState<Category | null>(() => {
    const fromUrl = params.get("category");
    return categories.find((c) => c.toLowerCase() === fromUrl) ?? null;
  });
  const [selected, setSelected] = useState<string[]>(
    params.get("source")?.split(",").filter(Boolean) ?? [],
  );
  const [page, setPage] = useState(1);
  const [read, setRead] = useState<Set<string>>(new Set());
  const listRef = useRef<HTMLDivElement>(null);

  // Read marks live in this browser only.
  useEffect(() => setRead(loadRead()), []);

  // Keep the search and filter in the URL so a view can be shared. This
  // replaces history directly, so typing doesn't trigger a server request.
  useEffect(() => {
    const next = new URLSearchParams();
    if (category) next.set("category", category.toLowerCase());
    if (query) next.set("q", query);
    if (selected.length) next.set("source", selected.join(","));
    const qs = next.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
  }, [category, query, selected]);

  const colorOf = useMemo(
    () => Object.fromEntries(sources.map((s) => [s.name, s.color])),
    [sources],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (item) =>
        (!category || item.categories.includes(category)) &&
        (selected.length === 0 || selected.includes(item.source)) &&
        (!q ||
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q)),
    );
  }, [items, category, query, selected]);

  // How many stories each source has in the current category, so a source
  // with nothing there is shown as empty rather than silently matching none.
  const countBySource = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      if (!category || item.categories.includes(category)) {
        counts[item.source] = (counts[item.source] ?? 0) + 1;
      }
    }
    return counts;
  }, [items, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const unread = filtered.filter((item) => !read.has(item.link)).length;

  function markRead(links: string[]) {
    setRead((prev) => {
      const next = new Set(prev);
      links.forEach((link) => next.add(link));
      saveRead(next);
      return next;
    });
  }

  function toggleSource(name: string) {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name],
    );
    setPage(1);
  }

  function goToPage(n: number) {
    setPage(n);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const chip =
    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors";

  const tab = (active: boolean) =>
    `shrink-0 border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
      active
        ? "border-foreground text-foreground"
        : "border-transparent text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div>
      {/* Scrolls sideways on narrow screens instead of wrapping into rows. */}
      <nav
        aria-label="Categories"
        className="-mx-4 mb-5 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0"
      >
        <div className="flex gap-5">
          {[null, ...categories].map((c) => (
            <button
              key={c ?? "all"}
              type="button"
              aria-pressed={category === c}
              onClick={() => {
                setCategory(c);
                setPage(1);
              }}
              className={tab(category === c)}
            >
              {c ?? "All"}
            </button>
          ))}
        </div>
      </nav>

      <div className="relative">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search headlines"
          aria-label="Search headlines"
          className="h-11 w-full cursor-text rounded-lg border border-input bg-transparent pl-10 pr-4 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Filter by source">
        <button
          type="button"
          aria-pressed={selected.length === 0}
          onClick={() => {
            setSelected([]);
            setPage(1);
          }}
          className={`${chip} ${
            selected.length === 0
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-foreground hover:bg-accent"
          }`}
        >
          All sources
        </button>
        {sources.map((source) => {
          const isSelected = selected.includes(source.name);
          const count = countBySource[source.name] ?? 0;
          return (
            <button
              key={source.name}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggleSource(source.name)}
              className={`${chip} ${
                isSelected
                  ? "border-primary bg-accent text-foreground"
                  : "border-border text-foreground hover:bg-accent"
              } ${count === 0 && !isSelected ? "opacity-50" : ""}`}
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: source.color }}
                aria-hidden="true"
              />
              {source.name}
              <span className="text-xs text-muted-foreground">{count}</span>
            </button>
          );
        })}
      </div>

      <div
        ref={listRef}
        className="mt-6 flex scroll-mt-20 flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-muted-foreground"
      >
        <p aria-live="polite">
          {filtered.length} stories · {unread} unread · updated{" "}
          {TIME_FORMAT.format(new Date(updatedAt))} WIB
        </p>
        <button
          type="button"
          onClick={() => markRead(filtered.map((item) => item.link))}
          disabled={unread === 0}
          className="font-medium text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:no-underline"
        >
          Mark all as read
        </button>
      </div>

      {failed.length > 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          Couldn&apos;t reach {failed.length} feed
          {failed.length > 1 ? "s" : ""} this time ({failed.join(", ")}).
          They&apos;ll be retried on the next update.
        </p>
      )}

      {visible.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <NewsCard
              key={item.link}
              item={item}
              color={colorOf[item.source] ?? "#94a3b8"}
              isRead={read.has(item.link)}
              onRead={() => markRead([item.link])}
            />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-muted-foreground">
          {items.length === 0
            ? "No news could be loaded right now. Please check back soon."
            : "No stories match these filters."}
        </p>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Pages"
          className="mt-8 flex items-center justify-center gap-1"
        >
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
          </button>
          {pageNumbers(currentPage, totalPages).map((n, i) =>
            n === null ? (
              <span
                key={`gap-${i}`}
                className="hidden size-9 items-center justify-center text-muted-foreground sm:flex"
              >
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => goToPage(n)}
                aria-current={n === currentPage ? "page" : undefined}
                className={`size-9 rounded-lg text-sm font-medium ${
                  n === currentPage
                    ? "bg-primary text-primary-foreground"
                    : "hidden text-foreground hover:bg-accent sm:block"
                }`}
              >
                {n}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRightIcon className="size-4" aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  );
}
