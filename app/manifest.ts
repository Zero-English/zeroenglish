import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Learn English Vocabulary in Bangla | Zero English",
    short_name: "Zero English",
    description:
      "Master essential English words with Bangla meanings and example sentences. Learn at your own pace — A1 to C2 levels covered.",
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
