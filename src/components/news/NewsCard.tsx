import type { NewsItem } from "@/lib/news/rss";

// Indonesian sources, so times are shown in Jakarta time. Fixing the zone
// also keeps the server and browser renders identical.
const DATE_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

export default function NewsCard({
  item,
  color,
  isRead,
  onRead,
}: {
  item: NewsItem;
  color: string;
  isRead: boolean;
  onRead: () => void;
}) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onRead}
      onAuxClick={onRead}
      className={`group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-ring ${
        isRead ? "opacity-60" : ""
      }`}
    >
      {item.image && (
        // Publishers' images, from many hosts, so next/image isn't used.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.hidden = true;
          }}
          className="aspect-video w-full bg-muted object-cover"
        />
      )}

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
          <span className="font-medium text-foreground">{item.source}</span>
          <span>· {item.categories.join(", ")}</span>
          {item.published && (
            <time dateTime={item.published}>
              · {DATE_FORMAT.format(new Date(item.published))}
            </time>
          )}
        </div>

        <h2 className="line-clamp-3 font-semibold leading-snug text-foreground group-hover:underline">
          {item.title}
        </h2>
        {item.summary && (
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
            {item.summary}
          </p>
        )}

        {isRead && (
          <span className="mt-auto pt-3 text-xs text-muted-foreground">
            Read
          </span>
        )}
      </div>
    </a>
  );
}
