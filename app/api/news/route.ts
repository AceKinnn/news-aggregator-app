import { NextResponse } from "next/server"
import { parseRSS } from "@/lib/rss"

export async function GET() {
  const sources = await Promise.all([
    parseRSS("https://www.antaranews.com/rss/terkini.xml", "ANTARA"),
    parseRSS("https://www.sindonews.com/feed", "SINDOnews"),
    parseRSS("https://rss.kompas.com/api/feed/social?apikey=bc58c81819dff4b8d5c53540a2fc7ffd83e6314a", "Kompas"),
    parseRSS("https://feed.liputan6.com/rss/news", "Liputan6"),
    parseRSS("https://www.cnbcindonesia.com/news/rss", "CNBC"),
    parseRSS("https://news.detik.com/berita/rss", "Detik"),
    parseRSS("https://rss.tempo.co/nasional", "Tempo"),
    parseRSS("https://www.cnnindonesia.com/nasional/rss", "CNN"),
    parseRSS("https://www.republika.co.id/rss", "Republika"),
    parseRSS("https://mediaindonesia.com/feed/all", "Media Indonesia"),
    parseRSS("https://lapi.kumparan.com/v2.0/rss/", "Kumparan"),
  ])

  const news = sources.flat().sort((a, b) => {
    return new Date(b.published || 0).getTime() -
           new Date(a.published || 0).getTime()
  })

  return NextResponse.json(news, {
    headers: {
      // Cache for 1 hour
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=300",
    },
  })
}
