"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { format, eachWeekOfInterval, startOfYear, endOfYear, startOfWeek, endOfWeek, eachMonthOfInterval } from "date-fns";
import { ja } from "date-fns/locale";
import { RaceRecord } from "@/types";
import { getRecordsByDate } from "@/lib/storage";

interface ProfitChartProps {
  records: RaceRecord[];
  mode: "weekly" | "monthly" | "yearly";
  year: number;
  month?: number;
}

function formatYen(value: number) {
  if (Math.abs(value) >= 10000) return `${(value / 10000).toFixed(1)}万`;
  return `¥${value.toLocaleString()}`;
}

export function ProfitChart({ records, mode, year, month }: ProfitChartProps) {
  const data = (() => {
    if (mode === "weekly" && month !== undefined) {
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);
      const weeks = eachWeekOfInterval(
        { start: monthStart, end: monthEnd },
        { weekStartsOn: 1 }
      );
      return weeks.map((weekStart) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const label = `${format(weekStart, "M/d")}〜`;
        const profit = records
          .filter((r) => r.date >= format(weekStart, "yyyy-MM-dd") && r.date <= format(weekEnd, "yyyy-MM-dd"))
          .reduce((sum, r) => sum + r.profit, 0);
        return { label, profit };
      });
    }

    if (mode === "monthly") {
      const months = eachMonthOfInterval({
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31),
      });
      return months.map((m) => {
        const prefix = format(m, "yyyy-MM");
        const profit = records
          .filter((r) => r.date.startsWith(prefix))
          .reduce((sum, r) => sum + r.profit, 0);
        return { label: format(m, "M月", { locale: ja }), profit };
      });
    }

    // yearly: last 5 years
    const currentYear = year;
    return Array.from({ length: 5 }, (_, i) => currentYear - 4 + i).map((y) => {
      const profit = records
        .filter((r) => r.date.startsWith(String(y)))
        .reduce((sum, r) => sum + r.profit, 0);
      return { label: `${y}年`, profit };
    });
  })();

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={formatYen} tick={{ fontSize: 11 }} width={52} />
        <Tooltip
          formatter={(value) => [
            `${Number(value) >= 0 ? "+" : ""}¥${Number(value).toLocaleString()}`,
            "収支",
          ]}
        />
        <ReferenceLine y={0} stroke="#888" />
        <Bar
          dataKey="profit"
          radius={[4, 4, 0, 0]}
          fill="#22c55e"
          label={false}
          // color based on positive/negative
          className="fill-green-500"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
