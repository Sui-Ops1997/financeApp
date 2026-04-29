"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RaceRecord } from "@/types";

interface DayDetailSheetProps {
  date: Date;
  records: RaceRecord[];
  onDelete: (id: string) => void;
  onAddManual: () => void;
  onAddAuto: () => void;
}

export function DayDetailSheet({
  date,
  records,
  onDelete,
  onAddManual,
  onAddAuto,
}: DayDetailSheetProps) {
  const totalInvestment = records.reduce((sum, r) => sum + r.investment, 0);
  const totalPayout = records.reduce((sum, r) => sum + r.payout, 0);
  const totalProfit = records.reduce((sum, r) => sum + r.profit, 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">
          {format(date, "M月d日（E）", { locale: ja })}
        </h2>
      </div>

      {/* Add buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onAddManual} className="text-sm">
          ✏️ 手動で記録
        </Button>
        <Button variant="outline" onClick={onAddAuto} className="text-sm">
          🏇 レースから記録
        </Button>
      </div>

      {/* Summary */}
      {records.length > 0 && (
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-3 text-center text-sm">
          <div>
            <p className="text-muted-foreground text-xs">投資</p>
            <p className="font-semibold">¥{totalInvestment.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">払戻</p>
            <p className="font-semibold">¥{totalPayout.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">収支</p>
            <p
              className={`font-semibold ${
                totalProfit >= 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {totalProfit >= 0 ? "+" : ""}¥{totalProfit.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Records list */}
      {records.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-6">
          この日の記録はありません
        </p>
      ) : (
        <div className="space-y-2">
          {records.map((record) => (
            <div key={record.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm truncate">
                      {record.raceName}
                    </span>
                    {record.racecourse && (
                      <Badge variant="secondary" className="text-xs">
                        {record.racecourse}
                      </Badge>
                    )}
                    <Badge
                      variant={record.mode === "auto" ? "default" : "outline"}
                      className="text-xs"
                    >
                      {record.mode === "auto" ? "自動" : "手動"}
                    </Badge>
                  </div>
                  <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                    <span>投資 ¥{record.investment.toLocaleString()}</span>
                    <span>払戻 ¥{record.payout.toLocaleString()}</span>
                    <span
                      className={
                        record.profit >= 0 ? "text-green-600 font-semibold" : "text-red-500 font-semibold"
                      }
                    >
                      {record.profit >= 0 ? "+" : ""}¥{record.profit.toLocaleString()}
                    </span>
                  </div>
                  {record.memo && (
                    <p className="mt-1 text-xs text-muted-foreground">{record.memo}</p>
                  )}
                  {record.bets && record.bets.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {record.bets.map((bet) => (
                        <p key={bet.id} className="text-xs text-muted-foreground">
                          {bet.betType} {bet.combination} ¥{bet.amount.toLocaleString()} →{" "}
                          ¥{bet.payout.toLocaleString()}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onDelete(record.id)}
                  className="ml-2 text-muted-foreground hover:text-red-500 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
