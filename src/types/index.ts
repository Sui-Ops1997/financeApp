export type BetType =
  | "単勝"
  | "複勝"
  | "枠連"
  | "馬連"
  | "馬単"
  | "ワイド"
  | "三連複"
  | "三連単";

export type RecordMode = "manual" | "auto";

export interface Bet {
  id: string;
  betType: BetType;
  combination: string; // e.g. "1-3", "2-4-7"
  amount: number;
  payout: number;
}

export interface RaceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  raceName: string;
  raceNo?: number;
  racecourse?: string;
  mode: RecordMode;
  investment: number;
  payout: number;
  profit: number; // payout - investment
  memo?: string;
  bets?: Bet[];
  createdAt: string;
}

export interface MockRace {
  id: string;
  date: string;
  raceNo: number;
  raceName: string;
  racecourse: string;
  horses: MockHorse[];
  results?: RaceResult;
}

export interface MockHorse {
  no: number;
  name: string;
  odds: {
    win: number;
    place: number;
  };
}

export interface RaceResult {
  first: number;
  second: number;
  third: number;
  payouts: {
    betType: BetType;
    combination: string;
    amount: number;
  }[];
}
