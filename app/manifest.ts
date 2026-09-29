import type { MetadataRoute } from "next";
import { SITE_BRAND_DESCRIPTION_EN, SITE_DEFAULT_TITLE } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    // Reuses the shared brand strings instead of restating them, so the installed
    // app and the search result cannot drift apart. The old description also
    // claimed "A1 to C2 levels covered", which contradicts the C2 list.
    name: SITE_DEFAULT_TITLE,
    short_name: "Zero English",
    description: SITE_BRAND_DESCRIPTION_EN,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#f97316",
    orientation: "any",
    categories: ["education", "language"],
    icons: [
      {
        src: "/assets/logo/pwa.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/assets/logo/pwa.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/assets/logo/pwa.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/assets/logo/pwa.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
