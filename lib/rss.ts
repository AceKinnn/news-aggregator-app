import Parser from "rss-parser"
import * as cheerio from "cheerio"

const parser = new Parser()

export function extractImage(entry: any): string | null {
  if (entry.img) return entry.img

  if (entry.media?.content?.[0]?.url) {
    return entry.media.content[0].url
  }

  if (entry.enclosure?.url) {
    return entry.enclosure.url
  }

  if (entry.content) {
    const $ = cheerio.load(entry.content)
    const img = $("img").first().attr("src")
    if (img) return img
  }

  if (entry.summary) {
    const $ = cheerio.load(entry.summary)
    const img = $("img").first().attr("src")
    if (img) return img
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
