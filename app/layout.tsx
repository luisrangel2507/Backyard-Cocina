import "./globals.css";
import { getLang } from "@/lib/i18n-server";
import { LangProvider } from "@/lib/i18n-client";
import { SalsaPour } from "./SalsaCurtain";
import { fontVars } from "./fonts";
import type { Viewport } from "next";

// width=device-width stops iOS from shrinking/zooming the page; inputs are >=16px so focus never zooms.
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0c1d4a" };

export const metadata = {
  title: "Backyard Cocina",
  description: "Small-batch Mexican salsas · Salsas mexicanas en lotes pequeños",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.png", apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Backyard", statusBarStyle: "black-translucent" as const },
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} className={fontVars}>
      <head>
        <link rel="preload" as="image" href="/splash.jpg" fetchPriority="high" />
        <link rel="preload" as="image" href="/salsa-pour.webp" />
        <link rel="preload" as="image" href="/cloth.webp" />
      </head>
      <body>
        <div className="check" />
        <LangProvider lang={lang}>
          <main className="wrap">{children}</main>
          <SalsaPour />
        </LangProvider>
      </body>
    </html>
  );
}
