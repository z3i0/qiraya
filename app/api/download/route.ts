import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");
  const filename = searchParams.get("filename") || "recitation.mp3";

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  try {
    const upstreamRes = await fetch(url);
    if (!upstreamRes.ok) {
      return new NextResponse(
        `Upstream audio fetch failed with status ${upstreamRes.status}`,
        { status: upstreamRes.status }
      );
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      upstreamRes.headers.get("content-type") || "audio/mpeg"
    );

    // Encode filename for Content-Disposition header with RFC 5987 UTF-8 support
    const encodedFilename = encodeURIComponent(filename);
    headers.set(
      "Content-Disposition",
      `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`
    );

    const contentLength = upstreamRes.headers.get("content-length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new NextResponse(upstreamRes.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Download proxy error:", error);
    return new NextResponse("Failed to download audio", { status: 500 });
  }
}
