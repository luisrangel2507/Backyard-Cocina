import "./globals.css";
export const metadata = {
  title: "Backyard Cocina",
  description: "Small-batch Mexican salsas",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.png", apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Backyard", statusBarStyle: "black-translucent" as const },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="check" />
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
