"use client";

import { useState } from "react";
import { format } from "date-fns";
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
    <main className="mx-auto max-w-md px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">🏇 競馬収支</h1>
      <CalendarView onSelectDate={handleSelectDate} records={records} />

      <Dialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) setDialogMode(null);
        }}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "manual" && "手動記録"}
              {dialogMode === "auto" && "レースから記録"}
              {dialogMode === "detail" && selectedDate
                ? format(selectedDate, "M月d日")
                : ""}
            </DialogTitle>
          </DialogHeader>

          {dialogMode === "detail" && selectedDate && (
            <DayDetailSheet
              date={selectedDate}
              records={dayRecords}
              onDelete={removeRecord}
              onAddManual={() => setDialogMode("manual")}
              onAddAuto={() => setDialogMode("auto")}
            />
          )}

          {dialogMode === "manual" && selectedDate && (
            <ManualRecordForm
              date={selectedDate}
              onSave={handleSave}
              onCancel={() => setDialogMode("detail")}
            />
          )}

          {dialogMode === "auto" && selectedDate && (
            <AutoRecordForm
              date={selectedDate}
              onSave={handleSave}
              onCancel={() => setDialogMode("detail")}
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
