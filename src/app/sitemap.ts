import type { MetadataRoute } from "next";

import { SITE_ORIGIN } from "@/lib/site-identity";

const marketingPaths = [
  "/",
  "/clinical-services",
  "/preclinical-services",
  "/tissue-bank",
  "/contact",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return marketingPaths.map((path) => ({
    url: path === "/" ? SITE_ORIGIN : `${SITE_ORIGIN}${path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
