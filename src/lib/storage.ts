import { RaceRecord } from "@/types";

const STORAGE_KEY = "keiba_records";

export function getRecords(): RaceRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveRecord(record: RaceRecord): void {
  const records = getRecords();
  const existing = records.findIndex((r) => r.id === record.id);
  if (existing >= 0) {
    records[existing] = record;
  } else {
    records.push(record);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function deleteRecord(id: string): void {
  const records = getRecords().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getRecordsByDate(date: string): RaceRecord[] {
  return getRecords().filter((r) => r.date === date);
}

export function getRecordsByMonth(year: number, month: number): RaceRecord[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return getRecords().filter((r) => r.date.startsWith(prefix));
}

export function getRecordsByYear(year: number): RaceRecord[] {
  return getRecords().filter((r) => r.date.startsWith(String(year)));
}
