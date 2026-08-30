// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/panier", "/compte", "/api/"], // pages privées / inutiles pour Google
    },
    sitemap: "https://tonsite.com/sitemap.xml",
  };
}
