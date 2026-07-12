import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KnowledgeOS",
    short_name: "KnowledgeOS",
    description: "Enterprise AI knowledge platform — upload docs, get cited answers.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#020817",
    theme_color: "#6d28d9",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
