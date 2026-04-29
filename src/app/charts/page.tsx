"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfitChart } from "@/components/charts/ProfitChart";
import { useRecords } from "@/hooks/useRecords";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

export default function ChartsPage() {
  const { records } = useRecords();

  const totalProfit = records.reduce((sum, r) => sum + r.profit, 0);
  const totalInvestment = records.reduce((sum, r) => sum + r.investment, 0);
  const totalPayout = records.reduce((sum, r) => sum + r.payout, 0);
  const roi =
    totalInvestment > 0
      ? ((totalPayout / totalInvestment) * 100).toFixed(1)
      : "0.0";

  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold">📊 収支チャート</h1>

      {/* Overall summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">累計収支</p>
          <p
            className={`text-lg font-bold ${
              totalProfit >= 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {totalProfit >= 0 ? "+" : ""}¥{totalProfit.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">回収率</p>
          <p className="text-lg font-bold">{roi}%</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">累計投資</p>
          <p className="font-semibold">¥{totalInvestment.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">累計払戻</p>
          <p className="font-semibold">¥{totalPayout.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts */}
      <Tabs defaultValue="monthly">
        <TabsList className="w-full">
          <TabsTrigger value="weekly" className="flex-1">週別</TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1">月別</TabsTrigger>
          <TabsTrigger value="yearly" className="flex-1">年別</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">
            {currentYear}年{currentMonth}月・週別収支
          </p>
          <ProfitChart
            records={records}
            mode="weekly"
            year={currentYear}
            month={currentMonth}
          />
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">
            {currentYear}年・月別収支
          </p>
          <ProfitChart
            records={records}
            mode="monthly"
            year={currentYear}
          />
        </TabsContent>

        <TabsContent value="yearly" className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">年別収支</p>
          <ProfitChart
            records={records}
            mode="yearly"
            year={currentYear}
          />
        </TabsContent>
      </Tabs>

      {/* Records count */}
      <p className="text-center text-xs text-muted-foreground">
        合計 {records.length} レース記録
      </p>
    </main>
  );
}
