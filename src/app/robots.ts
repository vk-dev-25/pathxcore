import type { MetadataRoute } from "next";

import { SITE_ORIGIN } from "@/lib/site-identity";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/pathx"],
    },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
