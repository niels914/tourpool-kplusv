import { NextResponse } from "next/server";

// In-memory cache voor image URLs (per process)
const urlCache = new Map<string, string | null>();

async function resolveImageUrl(slug: string): Promise<string | null> {
  if (urlCache.has(slug)) return urlCache.get(slug)!;

  try {
    const html = await fetch(`https://www.procyclingstats.com/rider/${slug}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html",
      },
    }).then((r) => r.text());

    const match = html.match(/src="(images\/riders\/[^"]+\.(?:jpg|jpeg|png))"/);
    const url = match ? `https://www.procyclingstats.com/${match[1]}` : null;
    urlCache.set(slug, url);
    return url;
  } catch {
    urlCache.set(slug, null);
    return null;
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return new NextResponse(null, { status: 400 });
  }

  const imageUrl = await resolveImageUrl(slug);
  if (!imageUrl) return new NextResponse(null, { status: 404 });

  try {
    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://www.procyclingstats.com/",
      },
    });

    if (!res.ok) return new NextResponse(null, { status: 404 });

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
