import type { Metadata } from "next";
import { Suspense } from "react";
import NewsBrowser from "@/components/news/NewsBrowser";
import { CATEGORIES, SOURCES } from "@/lib/news/feeds";
import { getNews } from "@/lib/news/rss";

// Must match REVALIDATE_SECONDS in src/lib/news/rss.ts. Next.js needs a
// literal here. The page is rebuilt from the feeds at most every 15 minutes.
export const revalidate = 900;

export const metadata: Metadata = {
  title: "BeritaIndo",
  description:
    "The latest Indonesian news by category, from ANTARA, Detik, CNN Indonesia, CNBC Indonesia and more, gathered from the publishers' RSS feeds.",
};

export default async function Home() {
  const { items, failed, updatedAt } = await getNews();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          BeritaIndo
        </h1>
        <p className="mt-2 text-muted-foreground">
          The latest Indonesian news, gathered from the publishers&apos; own RSS
          feeds. Every story opens on the original site.
        </p>
      </header>

      {/* useSearchParams in NewsBrowser needs a Suspense boundary. */}
      <Suspense>
        <NewsBrowser
          items={items}
          sources={SOURCES}
          // Only categories that have stories right now get a tab.
          categories={CATEGORIES.filter((c) =>
            items.some((item) => item.categories.includes(c)),
          )}
          failed={failed}
          updatedAt={updatedAt}
        />
      </Suspense>
    </div>
  );
}
