// Publishers' official RSS feeds, one per section, so every story can be
// labelled with a category. Each entry only links back to the source: the
// page shows a headline, a short summary and the feed's own image, and the
// article opens on the publisher's site.
//
// All of these were checked to respond with current stories. Left out:
// - Kompas: its feed rejects the old API key ("Invalid API key").
// - Tempo: its section feeds sit behind a Cloudflare bot check, and its main
//   feed is mostly Tempo English, so it doesn't fit the categories.
// - Republika's sepakbola, olahraga and leisure feeds (last updated 2018-2023)
//   and tekno feed (links to unrelated stories).
// - CNBC's investment feed (404) and SINDOnews' metro feed (empty).

export const CATEGORIES = [
  "National",
  "World",
  "Business",
  "Sports",
  "Tech",
  "Entertainment",
  "Lifestyle",
  "Health",
  "Automotive",
  "Education",
  "Regional",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Source = {
  name: string;
  /** Dot color in the source filter. */
  color: string;
};

export const SOURCES: Source[] = [
  { name: "ANTARA", color: "#16a34a" },
  { name: "CNBC Indonesia", color: "#0284c7" },
  { name: "CNN Indonesia", color: "#dc2626" },
  { name: "Detik", color: "#ea580c" },
  { name: "Kumparan", color: "#0d9488" },
  { name: "Liputan6", color: "#ca8a04" },
  { name: "Republika", color: "#059669" },
  { name: "SINDOnews", color: "#7c3aed" },
];

export type Feed = {
  source: string;
  url: string;
  /** "tagged" means the category comes from each story's own tags. */
  category: Category | "tagged";
};

const feeds = (
  category: Category,
  entries: [source: string, url: string][],
): Feed[] => entries.map(([source, url]) => ({ source, url, category }));

export const FEEDS: Feed[] = [
  ...feeds("National", [
    ["ANTARA", "https://www.antaranews.com/rss/politik.xml"],
    ["ANTARA", "https://www.antaranews.com/rss/hukum.xml"],
    ["CNN Indonesia", "https://www.cnnindonesia.com/nasional/rss"],
    ["Detik", "https://news.detik.com/berita/rss"],
    ["Liputan6", "https://feed.liputan6.com/rss/news"],
    ["Republika", "https://www.republika.co.id/rss/news"],
    ["SINDOnews", "https://nasional.sindonews.com/rss"],
  ]),
  ...feeds("World", [
    ["ANTARA", "https://www.antaranews.com/rss/dunia.xml"],
    ["CNN Indonesia", "https://www.cnnindonesia.com/internasional/rss"],
    ["Detik", "https://news.detik.com/internasional/rss"],
    ["Liputan6", "https://feed.liputan6.com/rss/global"],
    ["Republika", "https://www.republika.co.id/rss/internasional"],
    ["SINDOnews", "https://international.sindonews.com/rss"],
  ]),
  ...feeds("Business", [
    ["ANTARA", "https://www.antaranews.com/rss/ekonomi.xml"],
    ["CNN Indonesia", "https://www.cnnindonesia.com/ekonomi/rss"],
    ["CNBC Indonesia", "https://www.cnbcindonesia.com/news/rss"],
    ["CNBC Indonesia", "https://www.cnbcindonesia.com/market/rss"],
    ["CNBC Indonesia", "https://www.cnbcindonesia.com/entrepreneur/rss"],
    ["CNBC Indonesia", "https://www.cnbcindonesia.com/syariah/rss"],
    ["Detik", "https://finance.detik.com/rss"],
    ["Liputan6", "https://feed.liputan6.com/rss/bisnis"],
    ["Republika", "https://www.republika.co.id/rss/ekonomi"],
    ["SINDOnews", "https://ekbis.sindonews.com/rss"],
  ]),
  ...feeds("Sports", [
    ["ANTARA", "https://www.antaranews.com/rss/sepakbola.xml"],
    ["CNN Indonesia", "https://www.cnnindonesia.com/olahraga/rss"],
    ["Detik", "https://sport.detik.com/rss"],
    ["Liputan6", "https://feed.liputan6.com/rss/bola"],
    ["Liputan6", "https://feed.liputan6.com/rss/sport"],
    ["SINDOnews", "https://sports.sindonews.com/rss"],
  ]),
  ...feeds("Tech", [
    ["ANTARA", "https://www.antaranews.com/rss/tekno.xml"],
    ["CNN Indonesia", "https://www.cnnindonesia.com/teknologi/rss"],
    ["CNBC Indonesia", "https://www.cnbcindonesia.com/tech/rss"],
    ["Detik", "https://inet.detik.com/rss"],
    ["Liputan6", "https://feed.liputan6.com/rss/tekno"],
    ["SINDOnews", "https://tekno.sindonews.com/rss"],
  ]),
  ...feeds("Entertainment", [
    ["ANTARA", "https://www.antaranews.com/rss/hiburan.xml"],
    ["CNN Indonesia", "https://www.cnnindonesia.com/hiburan/rss"],
    ["Detik", "https://hot.detik.com/rss"],
    ["Liputan6", "https://feed.liputan6.com/rss/showbiz"],
  ]),
  ...feeds("Lifestyle", [
    ["ANTARA", "https://www.antaranews.com/rss/lifestyle.xml"],
    ["CNN Indonesia", "https://www.cnnindonesia.com/gaya-hidup/rss"],
    ["CNBC Indonesia", "https://www.cnbcindonesia.com/lifestyle/rss"],
    ["Detik", "https://travel.detik.com/rss"],
    ["Detik", "https://food.detik.com/rss"],
    ["Liputan6", "https://feed.liputan6.com/rss/lifestyle"],
    ["SINDOnews", "https://lifestyle.sindonews.com/rss"],
  ]),
  ...feeds("Health", [
    ["Detik", "https://health.detik.com/rss"],
    ["Liputan6", "https://feed.liputan6.com/rss/health"],
  ]),
  ...feeds("Automotive", [
    ["ANTARA", "https://www.antaranews.com/rss/otomotif.xml"],
    ["Detik", "https://oto.detik.com/rss"],
    ["Liputan6", "https://feed.liputan6.com/rss/otomotif"],
    ["SINDOnews", "https://otomotif.sindonews.com/rss"],
  ]),
  ...feeds("Education", [
    ["ANTARA", "https://www.antaranews.com/rss/humaniora.xml"],
    ["SINDOnews", "https://edukasi.sindonews.com/rss"],
    ["Republika", "https://www.republika.co.id/rss/khazanah"],
  ]),
  ...feeds("Regional", [
    ["ANTARA", "https://www.antaranews.com/rss/metro.xml"],
    ["SINDOnews", "https://daerah.sindonews.com/rss"],
  ]),
  // Kumparan has no section feeds, but tags each story in its main feed.
  {
    source: "Kumparan",
    url: "https://lapi.kumparan.com/v2.0/rss/",
    category: "tagged",
  },
];

/** Kumparan's tags, mapped onto the categories above. Untagged or unknown
 * stories fall back to National, Kumparan's most common section. */
const KUMPARAN_TAGS: Record<string, Category> = {
  news: "National",
  "bola & sports": "Sports",
  bola: "Sports",
  sports: "Sports",
  entertainment: "Entertainment",
  bisnis: "Business",
  tech: "Tech",
  otomotif: "Automotive",
  oto: "Automotive",
  mom: "Lifestyle",
  woman: "Lifestyle",
  food: "Lifestyle",
  travel: "Lifestyle",
  health: "Health",
};

export function categoryFromTags(tags: string[]): Category {
  for (const tag of tags) {
    const match = KUMPARAN_TAGS[tag.trim().toLowerCase()];
    if (match) return match;
  }
  return "National";
}
