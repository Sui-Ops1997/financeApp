"use client";

import { useState } from "react";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { RaceRecord } from "@/types";

interface ManualRecordFormProps {
  date: Date;
  onSave: (record: RaceRecord) => void;
  onCancel: () => void;
}

export function ManualRecordForm({ date, onSave, onCancel }: ManualRecordFormProps) {
  const [raceName, setRaceName] = useState("");
  const [investment, setInvestment] = useState("");
  const [payout, setPayout] = useState("");
  const [memo, setMemo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = Number(investment);
    const pay = Number(payout);
    const record: RaceRecord = {
      id: uuidv4(),
      date: format(date, "yyyy-MM-dd"),
      raceName: raceName || "レース",
      mode: "manual",
      investment: inv,
      payout: pay,
      profit: pay - inv,
      memo: memo || undefined,
      createdAt: new Date().toISOString(),
    };
    onSave(record);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">レース名</label>
        <input
          type="text"
          value={raceName}
          onChange={(e) => setRaceName(e.target.value)}
          placeholder="例：天皇賞（春）"
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">投資額（円）</label>
          <input
            type="number"
            value={investment}
            onChange={(e) => setInvestment(e.target.value)}
            placeholder="0"
            min="0"
            required
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">払戻額（円）</label>
          <input
            type="number"
            value={payout}
            onChange={(e) => setPayout(e.target.value)}
            placeholder="0"
            min="0"
            required
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      {investment && payout && (
        <div className="rounded-md bg-muted px-3 py-2 text-sm">
          収支：
          <span
            className={`font-semibold ${
              Number(payout) - Number(investment) >= 0
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {Number(payout) - Number(investment) >= 0 ? "+" : ""}¥
            {(Number(payout) - Number(investment)).toLocaleString()}
          </span>
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium">メモ</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="例：本命軸の三連単"
          rows={2}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" className="flex-1">
          保存
        </Button>
      </div>
    </form>
  );
}
