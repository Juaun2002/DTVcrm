import { iconeApp } from "@/lib/icone-app";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// O iPhone já arredonda os cantos sozinho.
export default function AppleIcon() {
  return iconeApp(180, false);
}
