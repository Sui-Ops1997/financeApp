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
  getDay,
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

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function CalendarView({ onSelectDate, records }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    setToday(new Date());
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const getDaySummary = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayRecords = getRecordsByDate(dateStr);
    if (dayRecords.length === 0) return null;
    const profit = dayRecords.reduce((sum, r) => sum + r.profit, 0);
    return { profit, count: dayRecords.length };
  };

  const monthSummary = (() => {
    const monthRecords = records.filter((r) =>
      r.date.startsWith(format(currentMonth, "yyyy-MM"))
    );
    return {
      investment: monthRecords.reduce((sum, r) => sum + r.investment, 0),
      payout: monthRecords.reduce((sum, r) => sum + r.payout, 0),
      profit: monthRecords.reduce((sum, r) => sum + r.profit, 0),
    };
  })();

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "yyyy年M月", { locale: ja })}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Monthly summary */}
      <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-3 text-center text-sm">
        <div>
          <p className="text-muted-foreground">投資</p>
          <p className="font-semibold">¥{monthSummary.investment.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground">払戻</p>
          <p className="font-semibold">¥{monthSummary.payout.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground">収支</p>
          <p
            className={`font-semibold ${
              monthSummary.profit >= 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {monthSummary.profit >= 0 ? "+" : ""}¥{monthSummary.profit.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : ""}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const summary = getDaySummary(day);
          const dayOfWeek = getDay(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`flex min-h-[56px] flex-col items-center rounded-md p-1 text-sm transition-colors hover:bg-accent ${
                today !== null && isSameDay(day, today) ? "ring-2 ring-primary" : ""
              } ${!isSameMonth(day, currentMonth) ? "opacity-30" : ""}`}
            >
              <span
                className={`font-medium ${
                  dayOfWeek === 0
                    ? "text-red-500"
                    : dayOfWeek === 6
                    ? "text-blue-500"
                    : ""
                }`}
              >
                {format(day, "d")}
              </span>
              {summary && (
                <span
                  className={`mt-1 text-xs font-semibold ${
                    summary.profit >= 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {summary.profit >= 0 ? "+" : ""}
                  {(summary.profit / 1000).toFixed(0)}k
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
