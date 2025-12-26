"use client"

import { NewsItem } from "@/types/news"
import dayjs from "dayjs"

export default function ArticleModal({
  item,
  onClose,
}: {
  item: NewsItem
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-5xl h-[85vh] rounded-xl shadow-xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER (fixed) */}
        <div className="flex justify-between items-start p-5 border-b shrink-0">
          <div>
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="text-sm text-gray-500">
              {item.source} •{" "}
              {dayjs(item.published).format("DD MMM YYYY HH:mm")}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-lg"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* CONTENT (scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {item.image && (
            <img
              src={item.image}
              alt={item.title}
              className="rounded-lg w-full object-cover"
            />
          )}

          <p className="text-gray-700 leading-relaxed">
            {item.description}
          </p>

          {/* iframe preview */}
          <iframe
            src={item.link}
            loading="lazy"
            sandbox="allow-same-origin allow-scripts allow-popups"
            className="w-full h-[50vh] rounded-lg border"
          />
        </div>

        {/* FOOTER (fixed) */}
        <div className="p-4 border-t flex justify-end gap-3 shrink-0">
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-md bg-black text-white text-sm"
          >
            Open original ↗
          </a>
        </div>
      </div>
    </div>
  )
}
