"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import NewsCard from "@/components/NewsCard"
import ArticleModal from "@/components/ArticleModal"
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react"
import { MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon, CheckIcon } from "@heroicons/react/20/solid"
import { SOURCE_COLORS } from "@/lib/constants"
import { NewsItem } from "@/types/news"

export default function HomeClient() {
  const isFirstLoad = useRef(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const previousIdsRef = useRef<Set<string>>(new Set())
  const [newMap, setNewMap] = useState<Map<string, number>>(new Map())
  const NEW_TTL_MS = 2 * 60 * 1000 // 2 minutes

  const [readSet, setReadSet] = useState<Set<string>>(new Set())

  const [previewItem, setPreviewItem] = useState<NewsItem | null>(null)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)


  const isUnread = (link: string) => !readSet.has(link)
  const isNew = (link: string) =>
    newMap.has(link) && Date.now() - newMap.get(link)! < NEW_TTL_MS
  

  const fetchNews = async () => {
    try {
      if (isFirstLoad.current) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }

      const res = await fetch("/api/news")
      const data: NewsItem[] = await res.json()

      // --- detect new articles ---
      const now = Date.now()
      const prevIds = previousIdsRef.current
      const currentIds = new Set(data.map(n => n.link))

      const updatedNewMap = new Map(newMap)

      // only mark NEW after first load
      if (!isFirstLoad.current) {
        data.forEach(n => {
          if (!prevIds.has(n.link)) {
            updatedNewMap.set(n.link, now)
          }
        })
      }

      // remove expired NEW entries
      for (const [link, detectedAt] of updatedNewMap) {
        if (now - detectedAt > NEW_TTL_MS) {
          updatedNewMap.delete(link)
        }
      }

      setNewMap(updatedNewMap)
      previousIdsRef.current = currentIds

      // ---------------------------

      setNews(data)
      setLastUpdated(new Date())
      isFirstLoad.current = false
      
    } catch (err) {
      console.error("Failed to fetch news", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const newCount = Array.from(newMap.values()).filter(
    detectedAt => Date.now() - detectedAt < NEW_TTL_MS
  ).length

  


  const sources = ["All", ...Array.from(new Set(news.map(n => n.source)))]

  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(
    searchParams.get("q") ?? ""
  )

  const [selectedSources, setSelectedSources] = useState<string[]>(
    searchParams.get("source")?.split(",") ?? []
  )




  useEffect(() => {
    fetchNews()
    const interval = setInterval(fetchNews, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const filtered = news
    .filter(n => {
      const matchesTitle = n.title.toLowerCase().includes(search.toLowerCase())
      const matchesSource =
        selectedSources.length === 0 || selectedSources.includes(n.source)

      return matchesTitle && matchesSource
    })
    .sort((a, b) => {
      const aNew = isNew(a.link) && isUnread(a.link)
      const bNew = isNew(b.link) && isUnread(b.link)

      if (aNew !== bNew) return aNew ? -1 : 1

      const aUnread = isUnread(a.link)
      const bUnread = isUnread(b.link)

      if (aUnread !== bUnread) return aUnread ? -1 : 1

      return (
        new Date(b.published || 0).getTime() -
        new Date(a.published || 0).getTime()
      )
    })

  const totalPages = Math.ceil(filtered.length / pageSize)

  const paginated = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  )


  const unreadCount = filtered.filter(
    item => !readSet.has(item.link)
  ).length


  useEffect(() => {
    const params = new URLSearchParams()

    if (search) params.set("q", search)
    if (selectedSources.length > 0)
      params.set("source", selectedSources.join(","))

    router.replace(`?${params.toString()}`, { scroll: false })
  }, [search, selectedSources, router])


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in inputs / textareas
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      if (e.key === "r" || e.key === "R") {
        e.preventDefault()
        fetchNews()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem("readArticles")
    if (saved) {
      setReadSet(new Set(JSON.parse(saved)))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      "readArticles",
      JSON.stringify(Array.from(readSet))
    )
  }, [readSet])

  const markAllAsRead = () => {
    setReadSet(prev => {
      const next = new Set(prev)
      filtered.forEach(item => next.add(item.link))
      return next
    })
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewItem(null)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search, selectedSources])

//   const getPageNumbers = (
//     current: number,
//     total: number,
//     delta = 1
//     ): (number | "ellipsis")[] => {
//     const range: (number | "ellipsis")[] = []

//     const left = Math.max(2, current - delta)
//     const right = Math.min(total - 1, current + delta)

//     range.push(1)

//     if (left > 2) {
//         range.push("ellipsis")
//     }

//     for (let i = left; i <= right; i++) {
//         range.push(i)
//     }

//     if (right < total - 1) {
//         range.push("ellipsis")
//     }

//     if (total > 1) {
//         range.push(total)
//     }

//     return range
//     }

  const getPagination = (
    current: number,
    total: number
    ): (number | "ellipsis")[] => {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1)
    }

    // Near start
    if (current <= 3) {
        return [1, 2, 3, 4, 5, "ellipsis", total]
    }

    // Near end
    if (current >= total - 2) {
        return [
        1,
        "ellipsis",
        total - 4,
        total - 3,
        total - 2,
        total - 1,
        total,
        ]
    }

    // Middle
    return [
        1,
        "ellipsis",
        current - 1,
        current,
        current + 1,
        "ellipsis",
        total,
    ]
    }



  return (
    <main className="mx-auto p-12">
      <h1 className="text-3xl font-bold mb-4">📰 Personal News Aggregator</h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />

          <input
            type="text"
            placeholder="Search news title"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl shadow-sm text-sm
                      focus:outline-none focus:ring-1 focus:ring-gray-400 h-10"
          />
        </div>


        {/* Source filter */}
        <Menu as="div" className="relative inline-block text-left">
          {({ open }) => (
            <>
              <MenuButton className="inline-flex items-center justify-between w-56 rounded-xl bg-white px-3 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                <span className="inline-flex items-center gap-2 truncate">
                  <p className="truncate">
                    {selectedSources.length === 0
                      ? "All sources"
                      : `${selectedSources.length} source(s)`}
                  </p>

                  <div className="flex -space-x-2 overflow-hidden">
                    {selectedSources.map((src, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-full border border-white"
                        style={{ backgroundColor: SOURCE_COLORS[src] ?? "#9ca3af" }}
                      />
                    ))}
                  </div>
                </span>

                {open ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </MenuButton>

              <MenuItems className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                <div className="py-1">
                  {sources
                    .filter(s => s !== "All")
                    .map(source => {
                      const isSelected = selectedSources.includes(source)

                      return (
                        <MenuItem key={source}>
                          {({ focus }) => (
                            <button
                              onClick={() => {
                                setSelectedSources(prev =>
                                  isSelected
                                    ? prev.filter(s => s !== source)
                                    : [...prev, source]
                                )
                              }}
                              className={`flex items-center gap-3 w-full px-4 py-2 text-sm rounded-lg text-left
                                ${focus ? "bg-gray-100" : ""}
                              `}
                            >
                              <span
                                className="w-4 h-4 rounded-full"
                                style={{
                                  backgroundColor:
                                    SOURCE_COLORS[source] ?? "#9ca3af",
                                }}
                              />

                              <span className="flex-1">{source}</span>

                              {isSelected && (
                                <CheckIcon className="h-4 w-4 text-blue-600" />
                              )}
                            </button>
                          )}
                        </MenuItem>
                      )
                    })}
                </div>
              </MenuItems>
            </>
          )}
        </Menu>
      </div>


      {loading && <p>Fetching news...</p>}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500 my-1">
            Found {filtered.length} articles
          </p>

          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              {unreadCount} unread
            </span>
          )}

          {newCount > 0 && !isFirstLoad.current && (
            <span
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="cursor-pointer inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 animate-pulse"
            >
              {newCount} new article{newCount > 1 ? "s" : ""}
            </span>

          )}

        </div>


        <div className="flex items-center gap-3 text-sm text-gray-500 my-1">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Mark all as read
          </button>

          {lastUpdated && (
            <span>
              Last updated:{" "}
              {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          )}

          {/* Manual refresh */}
          <button
            onClick={fetchNews}
            title="Refresh news"
            className={`transition ${
              refreshing ? "animate-spin text-black" : "hover:text-black"
            }`}
          >
            ↻
          </button>

        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
            <label className="text-sm text-gray-500">Show</label>

            <select
                value={pageSize}
                onChange={(e) => {
                setPageSize(Number(e.target.value))
                setPage(1)
                }}
                className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
            >
                {[12, 24, 32, 54].map(size => (
                <option key={size} value={size}>
                    {size}
                </option>
                ))}
            </select>

            <span className="text-sm text-gray-500">per page</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 my-1">
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1">

                    {/* Prev */}
                    <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-sm
                        disabled:text-gray-400 disabled:cursor-not-allowed
                        hover:bg-gray-100"
                    >
                    &lt;
                    </button>

                    {getPagination(page, totalPages).map((p, i) =>
                    p === "ellipsis" ? (
                        <span
                        key={`e-${i}`}
                        className="w-9 h-9 flex items-center justify-center text-gray-400"
                        >
                        …
                        </span>
                    ) : (
                        <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium
                            ${
                            p === page
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }
                        `}
                        >
                        {p}
                        </button>
                    )
                    )}

                    {/* Next */}
                    <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-sm
                        disabled:text-gray-400 disabled:cursor-not-allowed
                        hover:bg-gray-100"
                    >
                    &gt;
                    </button>
                </div>
                )}
            </div>
      </div>
      


      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.length > 0 ? (
          paginated.map((item) => (
            <NewsCard
              key={item.link}
              item={item}
              isNew={isNew(item.link)}
              isRead={!isUnread(item.link)}
              onRead={() =>
                setReadSet(prev => new Set(prev).add(item.link))
              }
              onPreview={setPreviewItem}
            />


          ))

        ) : (
          <p className="col-span-full text-center text-gray-500">
            No news found.
          </p>
        )}
      </div>

      
      {previewItem && (
        <ArticleModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
        />
      )}


    </main>
  )
}
