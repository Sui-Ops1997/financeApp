"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addDays,
  getDay,
  setMonth,
  setYear,
  getMonth,
  getYear,
} from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RaceRecord } from "@/types";
import { getRecordsByDate } from "@/lib/storage";

interface CalendarViewProps {
  onSelectDate: (date: Date) => void;
  records: RaceRecord[];
}

const WEEKDAYS = ["月", "火", "水", "木", "金", "土", "日"];

export function CalendarView({ onSelectDate, records }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [today, setToday] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(getYear(new Date()));

  useEffect(() => {
    setToday(new Date());
  }, []);

  const openPicker = () => {
    setPickerYear(getYear(currentMonth));
    setShowPicker(true);
  };

  const selectMonth = (month: number) => {
    setCurrentMonth(setMonth(setYear(currentMonth, pickerYear), month));
    setShowPicker(false);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Monday-first: Mon=0 … Sun=6
  const startPadding = (getDay(monthStart) + 6) % 7;
  const prevMonthEnd = endOfMonth(subMonths(currentMonth, 1));
  const prevDays = Array.from({ length: startPadding }, (_, i) =>
    addDays(prevMonthEnd, -(startPadding - 1 - i))
  );
  const totalCells = startPadding + days.length;
  const trailingCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const nextDays = Array.from({ length: trailingCount }, (_, i) =>
    addDays(startOfMonth(addMonths(currentMonth, 1)), i)
  );
  const allDays = [...prevDays, ...days, ...nextDays];

  const getDaySummary = (date: Date) => {
    const dayRecords = getRecordsByDate(format(date, "yyyy-MM-dd"));
    if (dayRecords.length === 0) return null;
    return { profit: dayRecords.reduce((sum, r) => sum + r.profit, 0) };
  };

  const monthSummary = (() => {
    const monthRecords = records.filter((r) =>
      r.date.startsWith(format(currentMonth, "yyyy-MM"))
    );
    const investment = monthRecords.reduce((sum, r) => sum + r.investment, 0);
    const payout = monthRecords.reduce((sum, r) => sum + r.payout, 0);
    const profit = payout - investment;
    const recoveryRate =
      investment > 0 ? Math.round((payout / investment) * 100) : 0;
    return { investment, payout, profit, recoveryRate };
  })();

  return (
    <div className="space-y-5">
      {/* Month navigation */}
      <div className="relative flex items-center justify-between px-2 py-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <button
          onClick={openPicker}
          className="rounded-lg px-4 py-1 text-2xl font-bold hover:bg-accent transition-colors"
        >
          {format(currentMonth, "yyyy年M月", { locale: ja })}
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Year/Month picker */}
        {showPicker && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowPicker(false)} />
            <div className="fixed left-1/2 top-24 z-20 w-64 -translate-x-1/2 rounded-xl border bg-card shadow-lg">
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
                    onClick={() => selectMonth(i)}
                    className={`rounded-lg py-2 text-sm font-medium transition-colors hover:bg-accent ${
                      pickerYear === getYear(currentMonth) && i === getMonth(currentMonth)
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

      {/* Summary card */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-stretch">
          <div className="flex-1 px-4 py-3">
            <p className="text-xs text-muted-foreground">収支</p>
            <p className="text-2xl font-bold text-red-500">
              {monthSummary.profit >= 0 ? "+" : ""}
              {monthSummary.profit.toLocaleString()}円
            </p>
          </div>
          <div className="w-px bg-border" />
          <div className="w-24 px-3 py-3 text-center">
            <p className="text-xs text-muted-foreground">回収率</p>
            <p className={`text-xl font-bold ${monthSummary.recoveryRate >= 100 ? "text-green-600" : "text-blue-500"}`}>
              {monthSummary.recoveryRate}%
            </p>
          </div>
          <div className="w-px bg-border" />
          <div className="px-4 py-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">購入</span>
              <span className="font-medium">{monthSummary.investment.toLocaleString()}円</span>
            </div>
            <div className="flex justify-between gap-3 mt-1">
              <span className="text-muted-foreground">払戻</span>
              <span className="font-medium">{monthSummary.payout.toLocaleString()}円</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-l border-t">
          {WEEKDAYS.map((d, i) => (
            <div
              key={d}
              className={`border-b border-r py-2 text-center text-sm font-medium ${
                i === 5 ? "text-blue-500" : i === 6 ? "text-red-500" : "text-foreground"
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 border-l">
          {allDays.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const summary = isCurrentMonth ? getDaySummary(day) : null;
            const colIndex = idx % 7; // 0=Mon … 5=Sat 6=Sun
            const isSat = colIndex === 5;
            const isSun = colIndex === 6;

            return (
              <button
                key={day.toISOString()}
                onClick={() => isCurrentMonth && onSelectDate(day)}
                disabled={!isCurrentMonth}
                className={`flex min-h-[68px] flex-col items-center border-b border-r pt-2 pb-1 transition-colors ${
                  isCurrentMonth ? "hover:bg-accent" : ""
                } ${today !== null && isSameDay(day, today) ? "bg-accent/50" : ""}`}
              >
                <span
                  className={`text-sm font-medium leading-none ${
                    !isCurrentMonth
                      ? "text-muted-foreground/40"
                      : isSun
                      ? "text-red-500"
                      : isSat
                      ? "text-blue-500"
                      : ""
                  }`}
                >
                  {format(day, "d")}
                </span>
                {summary && (
                  <span
                    className={`mt-1 text-[11px] font-semibold leading-tight ${
                      summary.profit >= 0 ? "text-red-500" : "text-blue-500"
                    }`}
                  >
                    {summary.profit >= 0 ? "+" : ""}
                    {summary.profit.toLocaleString()}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
