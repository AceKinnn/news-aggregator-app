import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://acekinnn-news-aggregator.vercel.app/",
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
  ];
}