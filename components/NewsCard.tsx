import dayjs from "dayjs"
import { NewsItem } from "@/types/news"
import { SOURCE_COLORS } from "@/lib/constants"

export default function NewsCard({
  item,
  isNew,
  isRead,
  onRead,
  onPreview,
}: {
  item: NewsItem
  isNew?: boolean
  isRead?: boolean
  onRead?: () => void
  onPreview?: (item: NewsItem) => void
}) {
  const sourceColor = SOURCE_COLORS[item.source] ?? "#374151"

  const handleOpen = () => {
    onRead?.()
    onPreview?.(item)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleOpen()
        }
      }}
      className="group block cursor-pointer focus:outline-none"
    >
      <div
        className={`rounded-xl shadow-md transition-all flex flex-col overflow-hidden h-full
          ${isRead ? "bg-gray-50 opacity-75" : "bg-white hover:shadow-lg"}
        `}
      >
        {/* Image */}
        {item.image && (
          <img
            src={item.image || "/news-placeholder.jpg"}
            alt={item.title}
            className="h-40 w-full object-cover"
          />
        )}

        {/* Content */}
        <div className="p-6 flex flex-col justify-between flex-1">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:underline">
              {item.title}
            </h2>

            <p className="text-xs text-gray-500 mb-2">
              {dayjs(item.published).format("DD MMM YYYY • HH:mm")}
            </p>

            <p className="text-gray-600 text-sm line-clamp-3">
              {item.description}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 mt-4">
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${sourceColor}20`,
                color: sourceColor,
              }}
            >
              {item.source}
            </span>

            {isNew && !isRead && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                NEW
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
