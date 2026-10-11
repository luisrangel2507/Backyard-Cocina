import "./globals.css";
export const metadata = { title: "Backyard Cocina", description: "Small-batch Mexican salsas" };
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
