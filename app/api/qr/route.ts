import QRCode from "qrcode";

export async function GET(req: Request) {
  const code = (new URL(req.url).searchParams.get("code") || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const png = await QRCode.toBuffer(code ? `${site}/r/${code}` : site, { width: 800, margin: 2 });
  return new Response(png, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" } });
}
