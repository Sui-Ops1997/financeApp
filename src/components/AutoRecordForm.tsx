"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RaceRecord, Bet, BetType } from "@/types";
import { ScrapedRace } from "@/lib/scraper";

interface AutoRecordFormProps {
  date: Date;
  onSave: (record: RaceRecord) => void;
  onCancel: () => void;
}

const BET_TYPES: BetType[] = [
  "単勝", "複勝", "枠連", "馬連", "馬単", "ワイド", "三連複", "三連単",
];

interface BetEntry {
  id: string;
  betType: BetType;
  combination: string;
  amount: string;
  payout: string;
}

export function AutoRecordForm({ date, onSave, onCancel }: AutoRecordFormProps) {
  const dateStr = format(date, "yyyy-MM-dd");
  const [races, setRaces] = useState<ScrapedRace[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string>("");
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [selectedRace, setSelectedRace] = useState<ScrapedRace | null>(null);
  const [bets, setBets] = useState<BetEntry[]>([
    { id: uuidv4(), betType: "単勝", combination: "", amount: "", payout: "" },
  ]);
  const [memo, setMemo] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/races?date=${dateStr}`)
      .then((r) => r.json())
      .then((data) => {
        setRaces(data.races ?? []);
        setSource(data.source ?? "");
      })
      .catch(() => setRaces([]))
      .finally(() => setLoading(false));
  }, [dateStr]);

  const totalInvestment = bets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const totalPayout = bets.reduce((sum, b) => sum + (Number(b.payout) || 0), 0);

  const addBet = () => {
    setBets([...bets, { id: uuidv4(), betType: "単勝", combination: "", amount: "", payout: "" }]);
  };

  const removeBet = (id: string) => {
    if (bets.length === 1) return;
    setBets(bets.filter((b) => b.id !== id));
  };

  const updateBet = (id: string, field: keyof BetEntry, value: string) => {
    setBets(bets.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRace) return;

    const completedBets: Bet[] = bets.map((b) => ({
      id: b.id,
      betType: b.betType,
      combination: b.combination,
      amount: Number(b.amount),
      payout: Number(b.payout),
    }));

    const record: RaceRecord = {
      id: uuidv4(),
      date: dateStr,
      raceName: selectedRace.raceName,
      raceNo: selectedRace.raceNo,
      racecourse: selectedRace.racecourse,
      mode: "auto",
      investment: totalInvestment,
      payout: totalPayout,
      profit: totalPayout - totalInvestment,
      memo: memo || undefined,
      bets: completedBets,
      createdAt: new Date().toISOString(),
    };
    onSave(record);
  };

  // ---- Venue selection screen ----
  if (!selectedRace) {
    const grouped = races.reduce<Record<string, ScrapedRace[]>>((acc, race) => {
      (acc[race.racecourse] ??= []).push(race);
      return acc;
    }, {});
    const venues = Object.keys(grouped);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedVenue ? `${selectedVenue} のレース` : `${dateStr} の開催競馬場`}
          </p>
          {source === "live" && (
            <Badge variant="default" className="text-xs">🔴 LIVE</Badge>
          )}
          {source === "mock" && (
            <Badge variant="outline" className="text-xs">モック</Badge>
          )}
          {source === "mock_fallback" && (
            <Badge variant="secondary" className="text-xs">⚠ フォールバック</Badge>
          )}
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
            レース情報を取得中...
          </div>
        ) : races.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            この日のレースデータがありません
          </p>
        ) : !selectedVenue ? (
          <div className="space-y-2">
            {venues.map((venue) => (
              <button
                key={venue}
                onClick={() => setSelectedVenue(venue)}
                className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-accent"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{venue}</span>
                  <span className="text-sm text-muted-foreground">{grouped[venue].length}レース</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {grouped[selectedVenue].map((race) => (
              <button
                key={race.id}
                onClick={() => setSelectedRace(race)}
                className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{race.raceName}</span>
                  <span className="text-xs text-muted-foreground">第{race.raceNo}R · {race.horses.length}頭</span>
                </div>
              </button>
            ))}
          </div>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={selectedVenue ? () => setSelectedVenue(null) : onCancel}
        >
          {selectedVenue ? "← 競馬場に戻る" : "キャンセル"}
        </Button>
      </div>
    );
  }

  // ---- Bet entry screen ----
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Selected race header */}
      <div className="rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="font-medium">{selectedRace.raceName}</span>
          <Badge variant="secondary">{selectedRace.racecourse}</Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">第{selectedRace.raceNo}R</p>
        <button
          type="button"
          onClick={() => setSelectedRace(null)}
          className="mt-1 text-xs text-primary underline"
        >
          レースを変更
        </button>
      </div>

      {/* Horse list */}
      {selectedRace.horses.length > 0 && (
        <div className="rounded-lg border p-2">
          <p className="mb-2 text-xs font-medium text-muted-foreground">出走馬</p>
          <div className="grid grid-cols-2 gap-1">
            {selectedRace.horses.map((h) => (
              <div key={h.no} className="flex items-center gap-2 text-xs">
                <span className="w-5 text-center font-semibold text-muted-foreground">{h.no}</span>
                <span className="flex-1 truncate">{h.name}</span>
                {h.odds.win > 0 && (
                  <span className="text-muted-foreground">{h.odds.win.toFixed(1)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bet entries */}
      <div className="space-y-3">
        <p className="text-sm font-medium">買い目</p>
        {bets.map((bet, idx) => (
          <div key={bet.id} className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">#{idx + 1}</span>
              {bets.length > 1 && (
                <button type="button" onClick={() => removeBet(bet.id)} className="text-xs text-red-500">
                  削除
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">券種</label>
                <select
                  value={bet.betType}
                  onChange={(e) => updateBet(bet.id, "betType", e.target.value)}
                  className="w-full rounded border px-2 py-1 text-sm"
                >
                  {BET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">組み合わせ</label>
                <input
                  type="text"
                  value={bet.combination}
                  onChange={(e) => updateBet(bet.id, "combination", e.target.value)}
                  placeholder="例: 1-3"
                  className="w-full rounded border px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">賭け金（円）</label>
                <input
                  type="number"
                  value={bet.amount}
                  onChange={(e) => updateBet(bet.id, "amount", e.target.value)}
                  placeholder="100"
                  min="100"
                  step="100"
                  className="w-full rounded border px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">払戻（円）</label>
                <input
                  type="number"
                  value={bet.payout}
                  onChange={(e) => updateBet(bet.id, "payout", e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full rounded border px-2 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addBet} className="w-full">
          + 買い目を追加
        </Button>
      </div>

      {/* Summary */}
      <div className="rounded-md bg-muted px-3 py-2 text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">合計投資</span>
          <span>¥{totalInvestment.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">合計払戻</span>
          <span>¥{totalPayout.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>収支</span>
          <span className={totalPayout - totalInvestment >= 0 ? "text-green-600" : "text-red-500"}>
            {totalPayout - totalInvestment >= 0 ? "+" : ""}¥{(totalPayout - totalInvestment).toLocaleString()}
          </span>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">メモ</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={2}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" className="flex-1" disabled={!selectedRace}>
          保存
        </Button>
      </div>
    </form>
  );
}
