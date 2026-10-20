import "./globals.css";
import { getLang } from "@/lib/i18n-server";
import { LangProvider } from "@/lib/i18n-client";
import { SalsaPour } from "./SalsaCurtain";

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
    <html lang={lang}>
      <head>
        <link rel="preload" as="image" href="/splash.jpg" fetchPriority="high" />
        <link rel="preload" as="image" href="/salsa-pour.webp" />
        <link rel="preload" as="image" href="/cloth.webp" />
        <meta name="theme-color" content="#0c1d4a" />
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
