import "./globals.css";
import { getLang } from "@/lib/i18n-server";
import { LangProvider } from "@/lib/i18n-client";

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
      <body>
        <div className="check" />
        <LangProvider lang={lang}>
          <main className="wrap">{children}</main>
        </LangProvider>
      </body>
    </html>
  );
}
