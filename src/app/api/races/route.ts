import { NextRequest, NextResponse } from "next/server";
import { scrapeRacesForDate } from "@/lib/scraper";
import { getMockRacesByDate } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "date パラメータが必要です (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  try {
    const races = await scrapeRacesForDate(date);

    if (races.length === 0) {
      // Fallback to mock data
      const mock = getMockRacesByDate(date);
      return NextResponse.json({ races: mock, source: "mock" });
    }

    return NextResponse.json({ races, source: "live" });
  } catch (err) {
    console.error("[/api/races] scrape error:", err);
    // Fallback to mock data on error
    const mock = getMockRacesByDate(date);
    return NextResponse.json({ races: mock, source: "mock_fallback" });
  }
}
