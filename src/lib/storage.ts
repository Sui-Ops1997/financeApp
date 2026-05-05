import { RaceRecord } from "@/types";

const STORAGE_KEY = "keiba_records";
const MEMO_KEY = "keiba_day_memos";

export function getDayMemo(date: string): string {
  if (typeof window === "undefined") return "";
  try {
    const data = localStorage.getItem(MEMO_KEY);
    return data ? (JSON.parse(data)[date] ?? "") : "";
  } catch {
    return "";
  }
}

export function saveDayMemo(date: string, memo: string): void {
  try {
    const data = localStorage.getItem(MEMO_KEY);
    const memos = data ? JSON.parse(data) : {};
    memos[date] = memo;
    localStorage.setItem(MEMO_KEY, JSON.stringify(memos));
  } catch {}
}

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
