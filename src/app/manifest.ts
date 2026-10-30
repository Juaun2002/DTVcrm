import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CRM · Ilha de Mauí",
    short_name: "CRM",
    description: "Follow-ups do dia pelo WhatsApp",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#047857",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
