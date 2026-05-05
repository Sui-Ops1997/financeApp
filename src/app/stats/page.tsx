"use client";

import { useState, useMemo } from "react";
import { format, getDaysInMonth } from "date-fns";
import { ja } from "date-fns/locale";
import { Menu, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ReferenceLine,
  ResponsiveContainer, Cell, CartesianGrid, Tooltip,
} from "recharts";
import { useRecords } from "@/hooks/useRecords";

const TABS = ["月別", "年別", "競馬場別", "レース別"] as const;
type Tab = typeof TABS[number];

function SummaryCard({
  profit, recoveryRate, investment, payout,
}: { profit: number; recoveryRate: number; investment: number; payout: number }) {
  return (
    <div className="mx-4 rounded-xl border bg-card shadow-sm">
      <div className="flex items-stretch">
        <div className="flex-1 px-4 py-3">
          <p className="text-xs text-muted-foreground">収支</p>
          <p className={`text-2xl font-bold ${profit >= 0 ? "text-red-500" : "text-blue-500"}`}>
            {profit >= 0 ? "+" : ""}{profit.toLocaleString()}円
          </p>
        </div>
        <div className="w-px bg-border" />
        <div className="w-24 px-3 py-3 text-center">
          <p className="text-xs text-muted-foreground">回収率</p>
          <p className={`text-xl font-bold ${recoveryRate >= 100 ? "text-green-600" : "text-blue-500"}`}>
            {recoveryRate}%
          </p>
        </div>
        <div className="w-px bg-border" />
        <div className="px-4 py-3 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">購入</span>
            <span className="font-medium">{investment.toLocaleString()}円</span>
          </div>
          <div className="flex justify-between gap-3 mt-1">
            <span className="text-muted-foreground">払戻</span>
            <span className="font-medium">{payout.toLocaleString()}円</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StatsPage() {
  const { records } = useRecords();
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [activeTab, setActiveTab] = useState<Tab>("月別");
  const [showPicker, setShowPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(now.getFullYear());

  const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
  const yearPrefix = String(selectedYear);

  const monthRecords = useMemo(
    () => records.filter((r) => r.date.startsWith(monthPrefix)),
    [records, monthPrefix]
  );
  const yearRecords = useMemo(
    () => records.filter((r) => r.date.startsWith(yearPrefix)),
    [records, yearPrefix]
  );

  // Monthly summary
  const mInv = monthRecords.reduce((s, r) => s + r.investment, 0);
  const mPay = monthRecords.reduce((s, r) => s + r.payout, 0);
  const mProfit = mPay - mInv;
  const mRate = mInv > 0 ? Math.round((mPay / mInv) * 100) : 0;

  // Yearly summary
  const yInv = yearRecords.reduce((s, r) => s + r.investment, 0);
  const yPay = yearRecords.reduce((s, r) => s + r.payout, 0);
  const yProfit = yPay - yInv;
  const yRate = yInv > 0 ? Math.round((yPay / yInv) * 100) : 0;

  // Daily chart data (月別)
  const daysInMonth = getDaysInMonth(new Date(selectedYear, selectedMonth - 1));
  const dailyData = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${monthPrefix}-${String(day).padStart(2, "0")}`;
      const dayRecs = monthRecords.filter((r) => r.date === dateStr);
      const profit = dayRecs.reduce((s, r) => s + r.profit, 0);
      return { day, label: `${day}日`, profit, hasData: dayRecs.length > 0 };
    });
  }, [monthRecords, monthPrefix, daysInMonth]);

  // Monthly chart data (年別)
  const monthlyData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const prefix = `${selectedYear}-${String(m).padStart(2, "0")}`;
      const recs = yearRecords.filter((r) => r.date.startsWith(prefix));
      return { label: `${m}月`, profit: recs.reduce((s, r) => s + r.profit, 0) };
    });
  }, [yearRecords, selectedYear]);

  // 成績内訳 (月別)
  const tradingDays = dailyData.filter((d) => d.hasData);
  const winDays = tradingDays.filter((d) => d.profit > 0);
  const lossDays = tradingDays.filter((d) => d.profit < 0);
  const drawDays = tradingDays.filter((d) => d.profit === 0);
  const bestDay = [...tradingDays].sort((a, b) => b.profit - a.profit)[0];
  const worstDay = [...tradingDays].sort((a, b) => a.profit - b.profit)[0];

  // 競馬場別
  const byVenue = useMemo(() => {
    const map: Record<string, { investment: number; payout: number; count: number }> = {};
    monthRecords.forEach((r) => {
      const v = r.racecourse ?? "不明";
      if (!map[v]) map[v] = { investment: 0, payout: 0, count: 0 };
      map[v].investment += r.investment;
      map[v].payout += r.payout;
      map[v].count += 1;
    });
    return Object.entries(map)
      .map(([name, s]) => ({ name, ...s, profit: s.payout - s.investment }))
      .sort((a, b) => b.profit - a.profit);
  }, [monthRecords]);

  // レース別
  const byRace = useMemo(() => {
    return [...monthRecords]
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 20);
  }, [monthRecords]);

  const selectMonth = (m: number) => {
    setSelectedYear(pickerYear);
    setSelectedMonth(m);
    setShowPicker(false);
  };

  const prevMonth = () => {
    if (selectedMonth === 1) { setSelectedYear((y) => y - 1); setSelectedMonth(12); }
    else setSelectedMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (selectedMonth === 12) { setSelectedYear((y) => y + 1); setSelectedMonth(1); }
    else setSelectedMonth((m) => m + 1);
  };

  const headerLabel = activeTab === "年別" ? `${selectedYear}年` : `${selectedYear}年${selectedMonth}月`;

  return (
    <main className="mx-auto max-w-md">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-card px-4 py-3">
        <button className="rounded-lg p-1.5 hover:bg-accent transition-colors">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold">集計</h1>
        <div className="relative">
          <button
            onClick={() => { setPickerYear(selectedYear); setShowPicker(true); }}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            {headerLabel}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {showPicker && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowPicker(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-64 rounded-xl border bg-card shadow-lg">
                <div className="flex items-center justify-between border-b px-4 py-2">
                  <button onClick={() => setPickerYear((y) => y - 1)} className="rounded p-1 hover:bg-accent">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="font-semibold">{pickerYear}年</span>
                  <button onClick={() => setPickerYear((y) => y + 1)} className="rounded p-1 hover:bg-accent">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1 p-3">
                  {Array.from({ length: 12 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => selectMonth(i + 1)}
                      className={`rounded-lg py-2 text-sm font-medium transition-colors hover:bg-accent ${
                        pickerYear === selectedYear && i + 1 === selectedMonth
                          ? "bg-primary text-primary-foreground hover:bg-primary"
                          : ""
                      }`}
                    >
                      {i + 1}月
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-card px-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-green-600 text-green-600"
                : "text-muted-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4 py-4">
        {/* Summary card */}
        {activeTab === "月別" && (
          <SummaryCard profit={mProfit} recoveryRate={mRate} investment={mInv} payout={mPay} />
        )}
        {activeTab === "年別" && (
          <SummaryCard profit={yProfit} recoveryRate={yRate} investment={yInv} payout={yPay} />
        )}

        {/* 月別: Daily chart + 成績内訳 */}
        {activeTab === "月別" && (
          <>
            <div className="mx-4">
              <h2 className="mb-2 text-sm font-bold">日別収支</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dailyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={6}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    tickFormatter={(_, index) =>
                      [0, 4, 9, 14, 19, 24, daysInMonth - 1].includes(index)
                        ? `${index + 1}日`
                        : ""
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) =>
                      Math.abs(v) >= 10000 ? `${v / 10000}万` : `${v / 1000}k`
                    }
                    width={36}
                  />
                  <Tooltip
                    formatter={(v: number) => [
                      `${v >= 0 ? "+" : ""}${v.toLocaleString()}円`,
                      "収支",
                    ]}
                    labelFormatter={(label) => label}
                  />
                  <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="4 2" />
                  <Bar dataKey="profit" radius={[3, 3, 0, 0]}>
                    {dailyData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.profit >= 0 ? "#ef4444" : "#3b82f6"}
                        fillOpacity={entry.hasData ? 1 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 成績内訳 */}
            <div className="mx-4">
              <h2 className="mb-2 text-sm font-bold">成績内訳</h2>
              <div className="flex gap-3">
                <div className="flex-1 rounded-xl border bg-card px-4 py-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">勝利日数</span>
                    <span className="font-medium">{winDays.length}日</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">敗北日数</span>
                    <span className="font-medium">{lossDays.length}日</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">引き分け</span>
                    <span className="font-medium">{drawDays.length}日</span>
                  </div>
                </div>
                <div className="flex-1 rounded-xl border bg-card px-4 py-3 space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">最高収支日</p>
                    {bestDay ? (
                      <p className="font-semibold text-red-500">
                        {bestDay.profit >= 0 ? "+" : ""}{bestDay.profit.toLocaleString()}円
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          ({selectedMonth}/{bestDay.day})
                        </span>
                      </p>
                    ) : <p className="text-muted-foreground">—</p>}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">最低収支日</p>
                    {worstDay ? (
                      <p className="font-semibold text-blue-500">
                        {worstDay.profit >= 0 ? "+" : ""}{worstDay.profit.toLocaleString()}円
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          ({selectedMonth}/{worstDay.day})
                        </span>
                      </p>
                    ) : <p className="text-muted-foreground">—</p>}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 年別: Monthly chart */}
        {activeTab === "年別" && (
          <div className="mx-4">
            <h2 className="mb-2 text-sm font-bold">月別収支</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={36}
                  tickFormatter={(v) => Math.abs(v) >= 10000 ? `${v / 10000}万` : `${v}`}
                />
                <Tooltip
                  formatter={(v: number) => [`${v >= 0 ? "+" : ""}${v.toLocaleString()}円`, "収支"]}
                />
                <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="4 2" />
                <Bar dataKey="profit" radius={[3, 3, 0, 0]}>
                  {monthlyData.map((entry, i) => (
                    <Cell key={i} fill={entry.profit >= 0 ? "#ef4444" : "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 競馬場別 */}
        {activeTab === "競馬場別" && (
          <div className="mx-4">
            {byVenue.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">データがありません</p>
            ) : (
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="grid grid-cols-[1fr_56px_56px_64px] border-b px-4 py-2 text-xs text-muted-foreground">
                  <span>競馬場</span>
                  <span className="text-right">購入</span>
                  <span className="text-right">払戻</span>
                  <span className="text-right">収支</span>
                </div>
                {byVenue.map((v, i) => (
                  <div key={v.name} className={`grid grid-cols-[1fr_56px_56px_64px] px-4 py-3 text-sm ${i < byVenue.length - 1 ? "border-b" : ""}`}>
                    <span className="font-medium">{v.name}</span>
                    <span className="text-right text-xs">{(v.investment / 1000).toFixed(0)}k</span>
                    <span className="text-right text-xs">{(v.payout / 1000).toFixed(0)}k</span>
                    <span className={`text-right font-semibold ${v.profit >= 0 ? "text-red-500" : "text-blue-500"}`}>
                      {v.profit >= 0 ? "+" : ""}{v.profit.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* レース別 */}
        {activeTab === "レース別" && (
          <div className="mx-4">
            {byRace.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">データがありません</p>
            ) : (
              <div className="rounded-xl border bg-card overflow-hidden">
                {byRace.map((r, i) => {
                  const code = [r.racecourse, r.raceNo != null ? `${r.raceNo}R` : ""].filter(Boolean).join("");
                  return (
                    <div key={r.id} className={`flex items-center justify-between px-4 py-3 text-sm ${i < byRace.length - 1 ? "border-b" : ""}`}>
                      <div>
                        <p className="font-medium">{code || r.raceName}</p>
                        {code && <p className="text-xs text-muted-foreground">{r.raceName}</p>}
                      </div>
                      <span className={`font-semibold ${r.profit >= 0 ? "text-red-500" : "text-blue-500"}`}>
                        {r.profit >= 0 ? "+" : ""}{r.profit.toLocaleString()}円
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
