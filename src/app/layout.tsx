import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import { AuthGate } from "@/components/AuthGate";
import { Carregando, Nav } from "@/components/Nav";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRM · Ilha de Mauí",
  description: "Follow-ups do dia pelo WhatsApp",
  appleWebApp: { capable: true, title: "CRM", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#047857",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-stone-50 text-stone-900">
        <ToastProvider>
          <AuthGate>
            <main className="mx-auto max-w-md px-4 pt-6 pb-28">
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
