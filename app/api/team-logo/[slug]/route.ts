import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, Buffer | null>();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (cache.has(slug)) {
    const buf = cache.get(slug);
    if (!buf) return new NextResponse(null, { status: 404 });
    return new NextResponse(buf, {
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
    });
  }

  const url = `https://www.procyclingstats.com/images/teams/2026/${slug}.png`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://www.procyclingstats.com/",
      },
    });
    if (!res.ok) { cache.set(slug, null); return new NextResponse(null, { status: 404 }); }
    const buf = Buffer.from(await res.arrayBuffer());
    cache.set(slug, buf);
    return new NextResponse(buf, {
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    cache.set(slug, null);
    return new NextResponse(null, { status: 404 });
  }
}
