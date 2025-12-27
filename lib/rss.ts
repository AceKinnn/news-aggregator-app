import Parser from "rss-parser"
import * as cheerio from "cheerio"

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["img", "img"],
      ["media:credit", "mediaCredit"],
      ["media:title", "mediaTitle"],

      // Dublin Core
      ["dc:creator", "creator"],

      // Full HTML content
      ["content:encoded", "contentEncoded"],
    ],
  },
})

export function extractImage(item: any): string | null {
  // 1️⃣ Tempo custom <img>
  if (typeof item.img === "string" && item.img.startsWith("http")) {
    return item.img
  }

  // 2️⃣ Media RSS (preferred) — Republika, SINDO, CNN
  if (
    Array.isArray(item.mediaContent) &&
    item.mediaContent[0]?.$?.url
  ) {
    return item.mediaContent[0].$.url
  }

  // 3️⃣ Legacy rss-parser media shape (older feeds)
  if (item.media?.content?.[0]?.url) {
    return item.media.content[0].url
  }

  if (item.media?.$?.url) {
    return item.media.$.url
  }

  // 4️⃣ Enclosure — ANTARA
  if (item.enclosure?.url) {
    return item.enclosure.url
  }

  // 5️⃣ HTML <img> fallback (content:encoded > content > summary)
  const html =
    item.contentEncoded ||
    item.content ||
    item.summary

  if (typeof html === "string") {
    const $ = cheerio.load(html)
    const img = $("img").first().attr("src")
    if (img && img.startsWith("http")) {
      return img
    }
  }

  return null
}



export function cleanDescription(html?: string): string {
  if (!html) return ""

  const $ = cheerio.load(html)
  $("img").remove()

  let text = $.text().trim()

  text = text.replace(
    /^(ANTARA|SINDOnews|CNN Indonesia|KOMPAS|DETIK|TEMPO)\s*-\s*/i,
    ""
  )

  return text
}

export async function parseRSS(url: string, source: string) {
  const feed = await parser.parseURL(url)

  return feed.items.map(item => ({
    source,
    title: item.title ?? "",
    link: item.link ?? "",
    image: extractImage(item),
    description: cleanDescription(item.contentSnippet || item.content),
    published: item.pubDate
  }))
}