import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://acekinnn-news-aggregator.vercel.app/";

// Global Metadata
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BeritaIndo - Agregator Berita Indonesia Terkini",
    template: "%s | BeritaIndo",
  },
  description:
    "Kumpulan berita terbaru dari seluruh Indonesia. Politik, ekonomi, teknologi, olahraga, dan hiburan dalam satu tempat.",
  keywords: [
    "berita indonesia",
    "news aggregator",
    "berita terkini",
    "news indonesia",
    "update berita",
  ],
  authors: [{ name: "BeritaIndo Team" }],
  creator: "BeritaIndo",
  publisher: "BeritaIndo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: "BeritaIndo",
    title: "BeritaIndo - Agregator Berita Indonesia Terkini",
    description:
      "Kumpulan berita terbaru dari seluruh Indonesia. Politik, ekonomi, teknologi, olahraga, dan hiburan.",
    images: [
      {
        url: "/B.svg",
        width: 1200,
        height: 630,
        alt: "BeritaIndo Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BeritaIndo - Agregator Berita Indonesia Terkini",
    description:
      "Kumpulan berita terbaru dari seluruh Indonesia.",
    images: ["/B.svg"],
    creator: "@yourtwitterhandle",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

// Viewport Settings (Critical for Mobile News Readers)
export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Structured Data Component (JSON-LD)
function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BeritaIndo",
    url: SITE_URL,
    description: "Agregator berita terpercaya dari seluruh Indonesia.",
    inLanguage: "id-ID",
    publisher: {
      "@type": "Organization",
      name: "BeritaIndo",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/BeritaIndo.svg`,
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 6. Set Language to Indonesian
    <html lang="id" className="light"> 
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        <StructuredData />
        {children}
      </body>
    </html>
  );
}