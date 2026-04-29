import { MockRace } from "@/types";

export const MOCK_RACES: MockRace[] = [
  {
    id: "mock-1",
    date: "2026-04-26",
    raceNo: 11,
    raceName: "天皇賞（春）",
    racecourse: "京都",
    horses: [
      { no: 1, name: "ドウデュース", odds: { win: 2.1, place: 1.3 } },
      { no: 2, name: "タスティエーラ", odds: { win: 5.8, place: 2.1 } },
      { no: 3, name: "ディープボンド", odds: { win: 8.3, place: 2.6 } },
      { no: 4, name: "シルヴァーソニック", odds: { win: 12.4, place: 3.5 } },
      { no: 5, name: "ブローザホーン", odds: { win: 18.7, place: 4.8 } },
      { no: 6, name: "マテンロウレオ", odds: { win: 24.3, place: 6.1 } },
      { no: 7, name: "ゴールドプリンセス", odds: { win: 31.5, place: 7.9 } },
      { no: 8, name: "アドマイヤハダル", odds: { win: 45.2, place: 10.3 } },
    ],
    results: {
      first: 1,
      second: 3,
      third: 2,
      payouts: [
        { betType: "単勝", combination: "1", amount: 210 },
        { betType: "複勝", combination: "1", amount: 130 },
        { betType: "複勝", combination: "3", amount: 260 },
        { betType: "複勝", combination: "2", amount: 210 },
        { betType: "馬連", combination: "1-3", amount: 1240 },
        { betType: "馬単", combination: "1-3", amount: 2100 },
        { betType: "ワイド", combination: "1-3", amount: 460 },
        { betType: "ワイド", combination: "1-2", amount: 320 },
        { betType: "ワイド", combination: "2-3", amount: 710 },
        { betType: "三連複", combination: "1-2-3", amount: 3840 },
        { betType: "三連単", combination: "1-3-2", amount: 18200 },
      ],
    },
  },
  {
    id: "mock-2",
    date: "2026-04-26",
    raceNo: 10,
    raceName: "メトロポリタンS",
    racecourse: "東京",
    horses: [
      { no: 1, name: "アスクビクターモア", odds: { win: 3.4, place: 1.5 } },
      { no: 2, name: "ヒートオンビート", odds: { win: 6.2, place: 2.2 } },
      { no: 3, name: "ユーキャンスマイル", odds: { win: 9.8, place: 3.1 } },
      { no: 4, name: "フォワードアゲン", odds: { win: 15.6, place: 4.2 } },
      { no: 5, name: "ハヤヤッコ", odds: { win: 22.1, place: 5.8 } },
      { no: 6, name: "ワイドエンペラー", odds: { win: 35.4, place: 8.9 } },
    ],
    results: {
      first: 2,
      second: 5,
      third: 1,
      payouts: [
        { betType: "単勝", combination: "2", amount: 620 },
        { betType: "複勝", combination: "2", amount: 220 },
        { betType: "複勝", combination: "5", amount: 580 },
        { betType: "複勝", combination: "1", amount: 150 },
        { betType: "馬連", combination: "2-5", amount: 5840 },
        { betType: "馬単", combination: "2-5", amount: 11300 },
        { betType: "三連複", combination: "1-2-5", amount: 12400 },
        { betType: "三連単", combination: "2-5-1", amount: 67800 },
      ],
    },
  },
  {
    id: "mock-3",
    date: "2026-04-26",
    raceNo: 9,
    raceName: "鴻巣特別",
    racecourse: "中山",
    horses: [
      { no: 1, name: "サトノゴールド", odds: { win: 4.5, place: 1.8 } },
      { no: 2, name: "リュウノユキナ", odds: { win: 7.3, place: 2.5 } },
      { no: 3, name: "マリアエレーナ", odds: { win: 11.2, place: 3.4 } },
      { no: 4, name: "エアロロノア", odds: { win: 16.8, place: 4.6 } },
      { no: 5, name: "ジュビリーヘッド", odds: { win: 28.9, place: 7.3 } },
    ],
    results: {
      first: 3,
      second: 1,
      third: 4,
      payouts: [
        { betType: "単勝", combination: "3", amount: 1120 },
        { betType: "複勝", combination: "3", amount: 340 },
        { betType: "複勝", combination: "1", amount: 180 },
        { betType: "複勝", combination: "4", amount: 460 },
        { betType: "馬連", combination: "1-3", amount: 3680 },
        { betType: "馬単", combination: "3-1", amount: 7940 },
        { betType: "三連複", combination: "1-3-4", amount: 18600 },
        { betType: "三連単", combination: "3-1-4", amount: 98400 },
      ],
    },
  },
];

export function getMockRacesByDate(date: string): MockRace[] {
  return MOCK_RACES.filter((r) => r.date === date);
}

export function getMockRaceById(id: string): MockRace | undefined {
  return MOCK_RACES.find((r) => r.id === id);
}
