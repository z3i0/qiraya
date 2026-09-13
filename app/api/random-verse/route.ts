import { NextResponse } from "next/server";
import { getRandomVerse } from "@/lib/api/quran-cloud";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const verseData = await getRandomVerse();
    if (!verseData) {
      return NextResponse.json(
        { error: "Failed to fetch random verse" },
        { status: 500 }
      );
    }

    return NextResponse.json(verseData, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Random verse API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
