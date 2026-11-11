# 📰 Personal News Aggregator

> [!NOTE]
> **Archived:** this project has been refined and merged into my portfolio.
> It now reads 58 category feeds and refreshes them on the server every 15 minutes.
>
> - Live: https://acekinnn-portfolio.vercel.app/indonesian-news-aggregator
> - Code: [acekinnn-portfolio/src/app/indonesian-news-aggregator](https://github.com/AceKinnn/acekinnn-portfolio/tree/main/src/app/indonesian-news-aggregator)
>
> This repository is kept read-only for its history.

A self-hosted, privacy-conscious RSS news reader that consolidates real-time articles from trusted Indonesian and international media outlets into a single, fast, and distraction-free interface.

Built with **Next.js**, this app fetches, filters, and displays news so you can stay informed without hopping between websites or algorithms deciding what you see.

![News Aggregator Preview](public\landing-page.png)

## ✨ Features

- **Real-time news** from 10+ reputable sources
- **Search & filter** by keyword or news source
- **Mark as read/unread** (persists in browser)
- **Pagination & adjustable page size**
- **Keyboard shortcuts**:
  - `R` → Refresh feed
  - `Esc` → Close article preview
- **URL-based state**: Search and filters appear in the URL for sharing/bookmarking
- **Responsive design**: Works on mobile, tablet, and desktop
- **New article indicators** (flashes for 2 minutes after first load)

## 📡 Supported News Sources

| Source          | Language | Notes |
|-----------------|----------|-------|
| Kompas          | ID       | General news |
| Antara          | ID / EN  | National news agency |
| Sindonews       | ID       | Politics, economy, lifestyle |
| Liputan6        | ID       | Breaking news |
| Tempo           | ID       | In-depth reporting |
| Republika       | ID       | Islamic perspective |
| CNBC Indonesia  | ID       | Business & finance |
| CNN Indonesia   | ID       | National & global news |
| Detik           | ID       | High-volume updates |
| Kumparan        | ID       | Youth-focused, digital-native |

> ℹ️ All content is fetched via public RSS feeds and displayed with proper attribution. Original articles open in new tabs.

## ⚙️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Components)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Headless UI](https://headlessui.com/)
- **Icons**: [Heroicons](https://heroicons.com/)
- **Date Handling**: [Day.js](https://day.js.org/)
- **RSS Parsing**: Custom API route using `rss-parser` (or equivalent)
- **Hosting**: [Vercel](https://vercel.com/)

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18.x
- npm / yarn / pnpm

### Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/your-username/news-aggregator.git
   cd news-aggregator
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables (Optional)
If you plan to add rate-limiting, caching, or external APIs later:
```env
# .env.local
NEXT_PUBLIC_CACHE_TTL=3600
```

## 🛠️ Project Structure

```
/news-aggregator
├── app/
│   ├── api/news/route.ts     # RSS fetching & parsing endpoint
│   └── page.tsx              # Main UI (client + server components)
├── components/
│   ├── NewsCard.tsx
│   └── ArticleModal.tsx
├── lib/
│   ├── constants.ts          # Source metadata (names, colors, RSS URLs)
│   └── rss.ts                # Core RSS parsing logic
├── public/
│   └── landing-page.png      # Preview image for README
├── types/
│   └── news.ts               # TypeScript interface
└── README.md
```

## 🔧 Customization

- **Add a new source**:  
  1. Add its RSS feed URL to your parser logic (`app/api/news/route.ts`)  
  2. Include its name in `SOURCE_COLORS` (`lib/constants.ts`)  
  3. Ensure CORS/proxy handling if needed

- **Change pagination size**:  
  Modify default `pageSize` in `HomeClient` component.

- **Deploy**:  
  Push to GitHub and connect to Vercel—zero config needed!

## 📜 License

MIT License — feel free to use, modify, and share.