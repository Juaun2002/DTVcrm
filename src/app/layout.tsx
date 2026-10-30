import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import { AuthGate } from "@/components/AuthGate";
import { Nav } from "@/components/Nav";
import { Carregando } from "@/components/ui";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Do Toque à Visita",
  description: "Follow-ups do dia pelo WhatsApp",
  appleWebApp: { capable: true, title: "DTV", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-stone-50 text-stone-900 selection:bg-teal-200">
        <ToastProvider>
          <AuthGate>
            <main className="mx-auto max-w-md px-4 pt-6 pb-32">
              <Suspense fallback={<Carregando />}>{children}</Suspense>
            </main>
            <Suspense>
              <Nav />
            </Suspense>
          </AuthGate>
        </ToastProvider>
      </body>
    </html>
  );
}
