import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Do Toque à Visita",
    short_name: "DTV",
    description: "Follow-ups do dia pelo WhatsApp",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#0f766e",
    icons: [{ src: "/icone-512", sizes: "512x512", type: "image/png", purpose: "any" }],
  };
}
