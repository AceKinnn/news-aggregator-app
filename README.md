# BeritaIndo

An Indonesian news aggregator that gathers the latest headlines from eight publishers' RSS feeds, sorted into categories. Every story opens on the publisher's own site.

The same app also runs in my portfolio at [acekinnn-portfolio.vercel.app/indonesian-news-aggregator](https://acekinnn-portfolio.vercel.app/indonesian-news-aggregator).

## Features

- **Categories:** National, World, Business, Sports, Tech, Entertainment, Lifestyle, Health, Automotive, Education and Regional
- **Search** across headlines and summaries
- **Source filters**, combinable with a category, with a story count for each source
- **Read tracking** with "mark all as read", saved in the visitor's browser
- **Shareable views:** the category, search and sources are kept in the URL
- **Light and dark mode**, following the visitor's setting

## An aggregator, not a scraper

It only reads the publishers' official RSS feeds and shows each story's headline, short summary and the feed's own image, linking to the original article. It never fetches article pages.

| Publisher | Feeds |
|---|---|
| ANTARA | Politics, law, world, business, football, tech, entertainment, lifestyle, automotive, humanities, metro |
| CNN Indonesia | National, international, business, sports, tech, entertainment, lifestyle |
| CNBC Indonesia | News, market, entrepreneur, sharia, tech, lifestyle |
| Detik | News, international, finance, sport, inet, hot, oto, health, travel, food |
| Liputan6 | News, global, business, football, sport, tech, showbiz, health, lifestyle, automotive |
| Republika | News, international, economy, Islamic affairs |
| SINDOnews | National, international, business, sports, tech, regional, education, automotive, lifestyle |
| Kumparan | One feed, sorted into categories using its own tags |

That's 58 feeds in total, listed in `src/lib/news/feeds.ts`, with notes on the ones left out: Kompas's feed now rejects its API key, and Tempo's section feeds are behind a bot check.

## How it works

- **Rendered on the server, refreshed every 15 minutes** (`revalidate = 900`). The feeds are read a few times an hour however many people visit, and there's no public API route to abuse.
- **Fault-tolerant:** feeds are fetched 10 at a time with a 12-second timeout. One that fails is skipped and named on the page, rather than breaking it.
- **Safe input:** links must be web URLs, images must be HTTPS, and duplicate stories are merged.
- Search, filters and pagination run in the browser.

## Running it

You need Node.js 18 or newer. No API keys are required.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Stack

Next.js 15 (App Router), TypeScript, Tailwind CSS and `rss-parser`.

## History

The first version was a client-side Next.js 16 app that fetched every feed on each visit, which meant one broken feed took the whole page down. It was rebuilt as part of my portfolio, then brought back here as a standalone app.
