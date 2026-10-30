import { iconeApp } from "@/lib/icone-app";

/** Ícone grande para "Adicionar à tela inicial" no Android (usado no manifest). */
export function GET() {
  return iconeApp(512, false);
}
