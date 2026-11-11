import Parser from "rss-parser";
import { categoryFromTags, FEEDS, type Category, type Feed } from "./feeds";

export type NewsItem = {
  source: string;
  /** A story can appear in several of a publisher's section feeds. */
  categories: Category[];
  title: string;
  link: string;
  image: string | null;
  summary: string;
  /** ISO timestamp, or null when the feed gave no usable date. */
  published: string | null;
};

export type NewsResult = {
  items: NewsItem[];
  /** Feeds that couldn't be read this time, so the page can say so. */
  failed: string[];
  updatedAt: string;
};

// Feeds are re-read at most this often, however many people visit.
export const REVALIDATE_SECONDS = 900;
// Feeds normally answer within 1-5 seconds. Downloading and parsing many at
// once on a busy build server slows each one down, so fewer run at a time
// and each gets some headroom.
const FEED_TIMEOUT_MS = 12_000;
const MAX_CONCURRENT_FEEDS = 10;
// About 60 feeds, so each contributes only its newest stories. That keeps
// the page around a few hundred stories instead of thousands.
const MAX_ITEMS_PER_FEED = 12;
const SUMMARY_LENGTH = 220;
// Identifies the aggregator honestly instead of posing as a browser.
const USER_AGENT =
  "BeritaIndo/1.0 (RSS reader; +https://github.com/AceKinnn/news-aggregator-app)";

type FeedItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  content?: string;
  contentSnippet?: string;
  summary?: string;
  contentEncoded?: string;
  img?: string;
  mediaContent?: { $?: { url?: string } }[];
  enclosure?: { url?: string; type?: string };
  categories?: (string | { _?: string })[];
};

const parser: Parser<object, FeedItem> = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["content:encoded", "contentEncoded"],
      ["img", "img"],
    ],
  },
});

/** Only real web links: a feed can't inject `javascript:` or similar. */
function safeUrl(value: string | undefined, httpsOnly = false): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    const allowed = httpsOnly ? ["https:"] : ["https:", "http:"];
    return allowed.includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

/** The feed's own image, checked in the order these publishers use. Only
 * HTTPS, so the page never loads insecure content. */
function findImage(item: FeedItem): string | null {
  const html = item.contentEncoded || item.content || item.summary || "";
  const candidates = [
    item.img,
    item.mediaContent?.[0]?.$?.url,
    item.enclosure?.type?.startsWith("image") !== false
      ? item.enclosure?.url
      : undefined,
    /<img[^>]+src=["']([^"']+)["']/i.exec(html)?.[1],
  ];
  for (const candidate of candidates) {
    const url = safeUrl(candidate, true);
    if (url) return url;
  }
  return null;
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const n =
        code[1].toLowerCase() === "x"
          ? parseInt(code.slice(2), 16)
          : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

/** Plain text, without the "SOURCE - " prefix some agencies add. */
function toSummary(item: FeedItem): string {
  const raw = item.contentSnippet || item.content || item.summary || "";
  const text = decodeEntities(raw.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .replace(/^(ANTARA|SINDOnews|CNN Indonesia|KOMPAS|DETIK|TEMPO)\s*-\s*/i, "")
    .trim();
  return text.length > SUMMARY_LENGTH
    ? `${text.slice(0, SUMMARY_LENGTH).trimEnd()}…`
    : text;
}

function toIsoDate(item: FeedItem): string | null {
  const date = new Date(item.isoDate || item.pubDate || "");
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function readFeed(feed: Feed): Promise<NewsItem[]> {
  const response = await fetch(feed.url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/rss+xml, application/xml, text/xml",
    },
    signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!response.ok) {
    throw new Error(`${feed.url} returned ${response.status}`);
  }

  const parsed = await parser.parseString(await response.text());
  return parsed.items.slice(0, MAX_ITEMS_PER_FEED).flatMap((item) => {
    const link = safeUrl(item.link);
    const title = decodeEntities(item.title ?? "")
      .replace(/\s+/g, " ")
      .trim();
    if (!link || !title) return [];
    const tags = (item.categories ?? []).map((tag) =>
      decodeEntities(typeof tag === "string" ? tag : (tag._ ?? "")),
    );
    return [
      {
        source: feed.source,
        categories: [
          feed.category === "tagged" ? categoryFromTags(tags) : feed.category,
        ],
        title,
        link,
        image: findImage(item),
        summary: toSummary(item),
        published: toIsoDate(item),
      },
    ];
  });
}

/** Like Promise.allSettled over `items`, but with at most `limit` running at
 * once. Results keep the input order. */
async function settleWithLimit<T, R>(
  items: T[],
  limit: number,
  run: (item: T) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      try {
        results[i] = { status: "fulfilled", value: await run(items[i]) };
      } catch (reason) {
        results[i] = { status: "rejected", reason };
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}

/** Reads every feed, a few at a time. A feed that fails or times out is
 * skipped, so one broken publisher never takes the page down. */
export async function getNews(): Promise<NewsResult> {
  const results = await settleWithLimit(FEEDS, MAX_CONCURRENT_FEEDS, readFeed);

  const failed: string[] = [];
  const byLink = new Map<string, NewsItem>();

  results.forEach((result, i) => {
    const feed = FEEDS[i];
    if (result.status === "rejected") {
      console.error(
        `news: ${feed.source} (${feed.category}) failed:`,
        result.reason,
      );
      failed.push(
        `${feed.source} ${feed.category === "tagged" ? "" : feed.category}`.trim(),
      );
      return;
    }
    // The same story can come from two section feeds: keep one copy, with
    // both categories.
    for (const item of result.value) {
      const existing = byLink.get(item.link);
      if (!existing) {
        byLink.set(item.link, item);
        continue;
      }
      for (const category of item.categories) {
        if (!existing.categories.includes(category)) {
          existing.categories.push(category);
        }
      }
    }
  });

  const items = [...byLink.values()].sort((a, b) =>
    (b.published ?? "").localeCompare(a.published ?? ""),
  );
  return { items, failed, updatedAt: new Date().toISOString() };
}
