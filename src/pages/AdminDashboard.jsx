import { useEffect, useState, useCallback } from "react";
import StatsStrip from "../components/StatsStrip";
import LivePulse from "../components/LivePulse";
import EmployeeList from "../components/EmployeeList";
import AttendanceOverview from "../components/AttendanceOverview";
import {
  getAllEmployees,
  getAttendanceByDate,
  getTodayStats,
} from "../lib/adminQueries";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminDashboard() {
  const [date, setDate] = useState(todayStr());
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState(null);

  const loadEmployees = useCallback(async () => {
    try {
      setEmployees(await getAllEmployees());
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const loadAttendance = useCallback(async (d) => {
    setLoadingAttendance(true);
    try {
      setAttendance(await getAttendanceByDate(d));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAttendance(false);
    }
  }, []);

  const loadStats = useCallback(async (d) => {
    setLoadingStats(true);
    try {
      setStats(await getTodayStats(d));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    loadAttendance(date);
    loadStats(date);
  }, [date, loadAttendance, loadStats]);

  return (
    <div className="min-h-screen bg-[#0D0F19] text-white">
      <header className="border-b border-white/[0.06] px-6 py-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-400/80">
            Admin / HR
          </p>
          <h1 className="text-xl font-semibold mt-1">
            Dayflow — Team Overview
          </h1>
        </div>
        <LivePulse dateStr={date} />
      </header>

      <main className="px-6 py-6 flex flex-col gap-6 max-w-7xl mx-auto">
        {error && (
          <div className="rounded-lg border border-rose-400/30 bg-rose-400/10 text-rose-300 text-sm px-4 py-3">
            Couldn't load dashboard data: {error}
          </div>
        )}

        <StatsStrip stats={stats} loading={loadingStats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <EmployeeList employees={employees} attendanceToday={attendance} />
          <AttendanceOverview
            date={date}
            onDateChange={setDate}
            attendance={attendance}
            loading={loadingAttendance}
          />
        </div>
      </main>
    </div>
  );
}
