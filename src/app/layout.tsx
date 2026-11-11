import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const PORTFOLIO_URL = "https://acekinnn-portfolio.vercel.app";

export const metadata: Metadata = {
  title: "BeritaIndo - Indonesian News Aggregator",
  description:
    "The latest Indonesian news by category, from ANTARA, Detik, CNN Indonesia, CNBC Indonesia and more, gathered from the publishers' RSS feeds.",
  icons: { icon: "/B.svg" },
};

// Follows the visitor's light or dark setting. It runs before the first
// paint, so the page never flashes the wrong theme.
const THEME_SCRIPT = `
(function () {
  try {
    var dark = window.matchMedia("(prefers-color-scheme: dark)");
    var apply = function () { document.documentElement.classList.toggle("dark", dark.matches); };
    apply();
    dark.addEventListener("change", apply);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="font-sans">
        <div className="flex min-h-screen flex-col">
          <main className="flex-grow">{children}</main>
          <footer className="border-t border-border bg-card py-4 text-center text-sm text-muted-foreground">
            Built by{" "}
            <a
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Grace Kindy
            </a>
            . Also part of{" "}
            <a
              href={`${PORTFOLIO_URL}/indonesian-news-aggregator`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              my portfolio
            </a>
            .
          </footer>
        </div>
      </body>
    </html>
  );
}
