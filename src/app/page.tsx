"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Menu, CalendarCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarView } from "@/components/CalendarView";
import { DayDetailSheet } from "@/components/DayDetailSheet";
import { ManualRecordForm } from "@/components/ManualRecordForm";
import { AutoRecordForm } from "@/components/AutoRecordForm";
import { useRecords } from "@/hooks/useRecords";
import { RaceRecord } from "@/types";

type DialogMode = "detail" | "manual" | "auto" | null;

export default function Home() {
  const { records, addRecord, removeRecord, getByDate } = useRecords();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setDialogMode("detail");
  };

  const handleSave = (record: RaceRecord) => {
    addRecord(record);
    setDialogMode("detail");
  };

  const dayRecords = selectedDate
    ? getByDate(format(selectedDate, "yyyy-MM-dd"))
    : [];

  return (
    <main className="mx-auto max-w-md">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-card px-4 py-3">
        <button className="rounded-lg p-1.5 hover:bg-accent transition-colors">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold">収支カレンダー</h1>
        <button className="rounded-lg p-1.5 hover:bg-accent transition-colors">
          <CalendarCheck className="h-5 w-5" />
        </button>
      </div>

      <div className="px-3 py-3">
        <CalendarView onSelectDate={handleSelectDate} records={records} />
      </div>

      <Dialog
        open={dialogMode !== null}
        onOpenChange={(open) => { if (!open) setDialogMode(null); }}
      >
        <DialogContent showCloseButton={false} className="max-w-md max-h-[85vh] overflow-y-auto p-0">
          {dialogMode === "detail" && selectedDate && (
            <DayDetailSheet
              date={selectedDate}
              records={dayRecords}
              onDelete={removeRecord}
              onUpdate={addRecord}
              onAddManual={() => setDialogMode("manual")}
              onAddAuto={() => setDialogMode("auto")}
              onClose={() => setDialogMode(null)}
            />
          )}

          {dialogMode === "manual" && selectedDate && (
            <>
              <DialogHeader className="px-4 pt-4">
                <DialogTitle>手動記録</DialogTitle>
              </DialogHeader>
              <div className="px-4 pb-4">
                <ManualRecordForm
                  date={selectedDate}
                  onSave={handleSave}
                  onCancel={() => setDialogMode("detail")}
                />
              </div>
            </>
          )}

          {dialogMode === "auto" && selectedDate && (
            <div className="px-4 pb-4 pt-2">
              <AutoRecordForm
                date={selectedDate}
                onSave={handleSave}
                onCancel={() => setDialogMode("detail")}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
