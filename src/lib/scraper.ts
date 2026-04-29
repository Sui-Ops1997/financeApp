import * as cheerio from "cheerio";
import iconv from "iconv-lite";
import { MockHorse } from "@/types";

const PC_BASE = "https://race.netkeiba.com";
const JRA_RPDF = "https://www.jra.go.jp/keiba/rpdf/";

async function fetchWithUA(
  url: string,
  encoding: "EUC-JP" | "Shift_JIS"
): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const buf = await res.arrayBuffer();
  return iconv.decode(Buffer.from(buf), encoding);
}

export interface ScrapedRace {
  id: string;
  date: string;
  raceNo: number;
  raceName: string;
  racecourse: string;
  horses: MockHorse[];
}

const VENUE_EN_TO_CODE: Record<string, string> = {
  sapporo: "01",
  hakodate: "02",
  fukushima: "03",
  niigata: "04",
  tokyo: "05",
  nakayama: "06",
  chukyo: "07",
  kyoto: "08",
  hanshin: "09",
  kokura: "10",
};

const VENUE_CODE_TO_JA: Record<string, string> = {
  "01": "札幌",
  "02": "函館",
  "03": "福島",
  "04": "新潟",
  "05": "東京",
  "06": "中山",
  "07": "中京",
  "08": "京都",
  "09": "阪神",
  "10": "小倉",
};

interface KaisaiInfo {
  venueCode: string;
  kaisaiNo: string;
  dayNo: string;
  venueJa: string;
}

/**
 * Fetch the JRA rpdf page and extract kaisai info for a specific date.
 * PDF filename format: YYYYMMDD-KK[venue]DD.pdf
 * Returns a list of KaisaiInfo objects for races on that date.
 */
async function fetchKaisaiForDate(date: string): Promise<KaisaiInfo[]> {
  const yyyymmdd = date.replace(/-/g, "");
  const html = await fetchWithUA(JRA_RPDF, "Shift_JIS");
  const $ = cheerio.load(html);

  const results: KaisaiInfo[] = [];

  $("a[href*='pdf/']").each((_, el) => {
    const href = $(el).attr("href") || "";
    // Match: pdf/YYYYMMDD-KK[venue]DD.pdf  (exclude color PDFs)
    const m = href.match(/pdf\/(\d{8})-(\d{2})([a-z]+)(\d{2})\.pdf$/);
    if (!m) return;
    const [, pdfDate, kaisaiNo, venueEn, dayNo] = m;
    if (pdfDate !== yyyymmdd) return;

    const venueCode = VENUE_EN_TO_CODE[venueEn];
    if (!venueCode) return;

    results.push({
      venueCode,
      kaisaiNo,
      dayNo,
      venueJa: VENUE_CODE_TO_JA[venueCode] ?? venueEn,
    });
  });

  return results;
}

/** Fetch race names from the shutuba page for a single race_id */
async function fetchRaceInfo(
  raceId: string
): Promise<{ raceName: string; horses: MockHorse[] } | null> {
  const url = `${PC_BASE}/race/shutuba.html?race_id=${raceId}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;

  const buf = await res.arrayBuffer();
  const html = iconv.decode(Buffer.from(buf), "EUC-JP");
  const $ = cheerio.load(html);

  // Race name: h1 inside #RaceMainBox or title fallback
  const titleEl = $("title").text();
  // Typically: "レース名 | JRA" or similar
  let raceName = titleEl.split("|")[0].trim();
  // Try more specific selectors
  const h1Name = $("h1.RaceName, .RaceMainBox h1, .RaceName").first().text().trim();
  if (h1Name) raceName = h1Name;

  const horses: MockHorse[] = [];

  $("tr.HorseList").each((_, row) => {
    const umabanTd = $(row).find("td[class^='Umaban']").first();
    const no = parseInt(umabanTd.text().trim(), 10);
    if (!no) return;

    const nameAnchor = $(row).find("span.HorseName a").first();
    const name = nameAnchor.attr("title") || nameAnchor.text().trim();
    if (!name) return;

    const oddsSpan = $(row).find("span[id^='odds-']").first();
    const win = parseFloat(oddsSpan.text().trim()) || 0;

    horses.push({ no, name, odds: { win, place: 0 } });
  });

  if (horses.length === 0) return null;
  return { raceName: raceName || `レース`, horses };
}

/** Full scrape: use JRA rpdf to find exact race_ids for the date, then fetch shutuba */
export async function scrapeRacesForDate(date: string): Promise<ScrapedRace[]> {
  const kaisaiList = await fetchKaisaiForDate(date);
  if (kaisaiList.length === 0) return [];

  const year = date.slice(0, 4);
  const allRaces: ScrapedRace[] = [];

  // For each kaisai on the date, build race_ids R01–R12 and fetch
  for (const k of kaisaiList) {
    const raceIds = Array.from({ length: 12 }, (_, i) => {
      const raceNo = String(i + 1).padStart(2, "0");
      return `${year}${k.venueCode}${k.kaisaiNo}${k.dayNo}${raceNo}`;
    });

    const settled = await Promise.allSettled(
      raceIds.map(async (raceId, i) => {
        const info = await fetchRaceInfo(raceId);
        if (!info) return null;
        return {
          id: raceId,
          date,
          raceNo: i + 1,
          raceName: info.raceName,
          racecourse: k.venueJa,
          horses: info.horses,
        } satisfies ScrapedRace;
      })
    );

    for (const r of settled) {
      if (r.status === "fulfilled" && r.value) {
        allRaces.push(r.value);
      }
    }
  }

  // Sort by venue then race number
  return allRaces.sort((a, b) =>
    a.racecourse.localeCompare(b.racecourse) || a.raceNo - b.raceNo
  );
}
