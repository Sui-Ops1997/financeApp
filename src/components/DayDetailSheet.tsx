"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, CalendarCheck, Plus } from "lucide-react";
import { RaceRecord } from "@/types";

interface DayDetailSheetProps {
  date: Date;
  records: RaceRecord[];
  onDelete: (id: string) => void;
  onUpdate: (record: RaceRecord) => void;
  onAddManual: () => void;
  onAddAuto: () => void;
  onClose: () => void;
}

function RaceDetail({
  record,
  date,
  onBack,
  onDelete,
  onUpdate,
}: {
  record: RaceRecord;
  date: Date;
  onBack: () => void;
  onDelete: (id: string) => void;
  onUpdate: (record: RaceRecord) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    raceName: record.raceName,
    racecourse: record.racecourse ?? "",
    raceNo: record.raceNo != null ? String(record.raceNo) : "",
    investment: String(record.investment),
    payout: String(record.payout),
    memo: record.memo ?? "",
  });

  const code = [record.racecourse, record.raceNo != null ? `${record.raceNo}R` : ""]
    .filter(Boolean).join("");

  const handleSave = () => {
    const inv = Number(form.investment);
    const pay = Number(form.payout);
    onUpdate({
      ...record,
      raceName: form.raceName,
      racecourse: form.racecourse || undefined,
      raceNo: form.raceNo ? Number(form.raceNo) : undefined,
      investment: inv,
      payout: pay,
      profit: pay - inv,
      memo: form.memo || undefined,
    });
    onBack();
  };

  const handleDelete = () => {
    onDelete(record.id);
    onBack();
  };

  if (editing) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <button
            onClick={() => setEditing(false)}
            className="rounded-lg p-1.5 hover:bg-accent transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="flex-1 text-center text-sm font-bold">編集</h1>
          <button
            onClick={handleSave}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-accent transition-colors"
          >
            保存
          </button>
        </div>

        <div className="space-y-3 px-4 py-4">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">競馬場</label>
            <input
              value={form.racecourse}
              onChange={(e) => setForm({ ...form, racecourse: e.target.value })}
              placeholder="例: 京都"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-border"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">レース番号</label>
            <input
              type="number"
              value={form.raceNo}
              onChange={(e) => setForm({ ...form, raceNo: e.target.value })}
              placeholder="例: 11"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-border"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">レース名</label>
            <input
              value={form.raceName}
              onChange={(e) => setForm({ ...form, raceName: e.target.value })}
              placeholder="例: 天皇賞（春）"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-border"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">購入（円）</label>
              <input
                type="number"
                value={form.investment}
                onChange={(e) => setForm({ ...form, investment: e.target.value })}
                min="0"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-border"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">払戻（円）</label>
              <input
                type="number"
                value={form.payout}
                onChange={(e) => setForm({ ...form, payout: e.target.value })}
                min="0"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-border"
              />
            </div>
          </div>
          {form.investment && form.payout && (
            <div className="rounded-lg bg-muted px-3 py-2 text-sm">
              収支：
              <span className={`font-semibold ${Number(form.payout) - Number(form.investment) >= 0 ? "text-red-500" : "text-blue-500"}`}>
                {Number(form.payout) - Number(form.investment) >= 0 ? "+" : ""}
                {(Number(form.payout) - Number(form.investment)).toLocaleString()}円
              </span>
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">メモ</label>
            <textarea
              value={form.memo}
              onChange={(e) => setForm({ ...form, memo: e.target.value })}
              rows={3}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-border resize-none"
            />
          </div>
          <button
            onClick={handleDelete}
            className="w-full rounded-lg border border-red-200 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            この記録を削除
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <button onClick={onBack} className="rounded-lg p-1.5 hover:bg-accent transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-sm font-bold">
          {code} {record.raceName}
        </h1>
        <button
          onClick={() => setEditing(true)}
          className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
        >
          編集
        </button>
      </div>

      <div>
        {[
          { label: "日付", value: format(date, "yyyy年M月d日（E）", { locale: ja }) },
          { label: "競馬場", value: record.racecourse ?? "—" },
          { label: "レース名", value: record.raceName },
          { label: "購入", value: `${record.investment.toLocaleString()}円` },
          { label: "払戻", value: `${record.payout.toLocaleString()}円` },
        ].map(({ label, value }) => (
          <div key={label} className="flex border-b px-4 py-2.5 text-sm">
            <span className="w-24 text-muted-foreground">{label}</span>
            <span className="flex-1">{value}</span>
          </div>
        ))}
        <div className="flex border-b px-4 py-2.5 text-sm">
          <span className="w-24 text-muted-foreground">収支</span>
          <span className={`font-semibold ${record.profit >= 0 ? "text-red-500" : "text-blue-500"}`}>
            {record.profit >= 0 ? "+" : ""}{record.profit.toLocaleString()}円
          </span>
        </div>

        {record.bets && record.bets.length > 0 && (
          <div className="border-b px-4 py-3">
            <p className="mb-2 text-sm font-medium">買い目</p>
            {record.bets.map((bet) => {
              const odds = bet.payout > 0 && bet.amount > 0
                ? `${(bet.payout / bet.amount).toFixed(1)}倍` : null;
              return (
                <div key={bet.id} className="flex items-center gap-2 border-t py-2 text-sm first:border-t-0">
                  <span className="w-12 shrink-0 text-muted-foreground">{bet.betType}</span>
                  <span className="flex-1 text-xs">{bet.combination}</span>
                  <span className="text-xs">{bet.amount.toLocaleString()}円</span>
                  {odds && <span className="text-xs text-muted-foreground">{odds}</span>}
                  {bet.payout > 0 && (
                    <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      的中
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {record.memo && (
          <div className="px-4 py-3">
            <p className="mb-1 text-sm font-medium">メモ</p>
            <p className="text-sm leading-relaxed">{record.memo}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function DayDetailSheet({
  date,
  records,
  onDelete,
  onUpdate,
  onAddManual,
  onAddAuto,
  onClose,
}: DayDetailSheetProps) {
  const [selectedRecord, setSelectedRecord] = useState<RaceRecord | null>(null);

  const totalInvestment = records.reduce((sum, r) => sum + r.investment, 0);
  const totalPayout = records.reduce((sum, r) => sum + r.payout, 0);
  const totalProfit = totalPayout - totalInvestment;

  if (selectedRecord) {
    return (
      <RaceDetail
        record={selectedRecord}
        date={date}
        onBack={() => setSelectedRecord(null)}
        onDelete={onDelete}
        onUpdate={onUpdate}
      />
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-accent transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold">
          {format(date, "yyyy年M月d日（E）", { locale: ja })}
        </h1>
        <CalendarCheck className="h-5 w-5 text-muted-foreground" />
      </div>

      <div>
        <div className="border-b">
          <div className="flex items-stretch">
            <div className="flex-1 px-5 py-4">
              <p className="text-xs text-muted-foreground">収支</p>
              <p className={`text-3xl font-bold ${totalProfit >= 0 ? "text-red-500" : "text-blue-500"}`}>
                {totalProfit >= 0 ? "+" : ""}{totalProfit.toLocaleString()}円
              </p>
            </div>
            <div className="w-px bg-border" />
            <div className="px-5 py-4 text-sm">
              <div className="flex justify-between gap-6 mb-1">
                <span className="text-muted-foreground">購入</span>
                <span className="font-medium">{totalInvestment.toLocaleString()}円</span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="text-muted-foreground">払戻</span>
                <span className="font-medium">{totalPayout.toLocaleString()}円</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-[1fr_56px_56px_64px] border-b px-4 py-2 text-xs text-muted-foreground">
            <span>レース</span>
            <span className="text-right">購入</span>
            <span className="text-right">払戻</span>
            <span className="text-right">収支</span>
          </div>

          {records.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              この日の記録はありません
            </p>
          ) : (
            records.map((record, i) => {
              const code = [record.racecourse, record.raceNo != null ? `${record.raceNo}R` : ""]
                .filter(Boolean).join("") || "—";
              return (
                <button
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className={`w-full grid grid-cols-[1fr_56px_56px_64px] items-center px-4 py-3 text-left hover:bg-accent transition-colors ${i < records.length - 1 ? "border-b" : ""}`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-sm font-medium leading-snug">{code}</p>
                    <p className="text-xs text-muted-foreground leading-snug">{record.raceName}</p>
                  </div>
                  <span className="text-right text-sm">{record.investment.toLocaleString()}</span>
                  <span className="text-right text-sm">{record.payout.toLocaleString()}</span>
                  <span className={`text-right text-sm font-semibold ${record.profit >= 0 ? "text-red-500" : "text-blue-500"}`}>
                    {record.profit >= 0 ? "+" : ""}{record.profit.toLocaleString()}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="border-t px-4 py-3 flex gap-2">
          <button
            onClick={onAddManual}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            <Plus className="h-4 w-4" />
            手動で記録
          </button>
          <button
            onClick={onAddAuto}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            <Plus className="h-4 w-4" />
            レースから選択
          </button>
        </div>
      </div>
    </div>
  );
}
