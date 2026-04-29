"use client";

import { useState, useEffect, useCallback } from "react";
import { RaceRecord } from "@/types";
import {
  getRecords,
  saveRecord,
  deleteRecord,
  getRecordsByDate,
  getRecordsByMonth,
  getRecordsByYear,
} from "@/lib/storage";

export function useRecords() {
  const [records, setRecords] = useState<RaceRecord[]>([]);

  useEffect(() => {
    setRecords(getRecords());
  }, []);

  const addRecord = useCallback((record: RaceRecord) => {
    saveRecord(record);
    setRecords(getRecords());
  }, []);

  const removeRecord = useCallback((id: string) => {
    deleteRecord(id);
    setRecords(getRecords());
  }, []);

  const getByDate = useCallback((date: string) => {
    return getRecordsByDate(date);
  }, []);

  const getByMonth = useCallback((year: number, month: number) => {
    return getRecordsByMonth(year, month);
  }, []);

  const getByYear = useCallback((year: number) => {
    return getRecordsByYear(year);
  }, []);

  const getSummaryByDate = useCallback((date: string) => {
    const dayRecords = getRecordsByDate(date);
    return {
      investment: dayRecords.reduce((sum, r) => sum + r.investment, 0),
      payout: dayRecords.reduce((sum, r) => sum + r.payout, 0),
      profit: dayRecords.reduce((sum, r) => sum + r.profit, 0),
      count: dayRecords.length,
    };
  }, []);

  return {
    records,
    addRecord,
    removeRecord,
    getByDate,
    getByMonth,
    getByYear,
    getSummaryByDate,
  };
}
