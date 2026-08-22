import { useEffect, useState } from "react";
import LivePulse from "../components/Livepulse";
import { Link } from "react-router-dom";
import EmployeeList from "../components/EmployeeList";
import AttendanceOverviewTable from "../components/AttendanceOverviewTable";
import { getAllEmployees, getAttendanceByDate, getTodayStats } from "../lib/adminQueries";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#161927] px-5 py-4 transition hover:border-white/20">
      <p className="text-xs font-medium uppercase tracking-wide text-white/40">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent || "text-white/90"}`}>{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [date, setDate] = useState(todayISO());
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0, present: 0, halfDay: 0, onLeave: 0, absent: 0, pendingLeaves: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([getAllEmployees(), getAttendanceByDate(date), getTodayStats(date)])
      .then(([emp, att, s]) => {
        if (!isMounted) return;
        setEmployees(emp);
        setAttendance(att);
        setStats(s);
      })
      .catch((err) => console.error("AdminDashboard load failed", err))
      .finally(() => isMounted && setLoading(false));
    return () => { isMounted = false; };
  }, [date]);

  return (
    <div className="min-h-screen bg-[#0D0F1A] px-6 py-8">
      <div className="mx-auto max-w-7xl">
      

        <header className="mb-6 flex items-center justify-between">
           <div>
             <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber-300/70">Admin / HR</p>
             <h1 className="text-2xl font-semibold text-white">WorkSphere — Team Overview</h1>
          </div>
          <LivePulse date={date} />
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <EmployeeList employees={employees} attendanceToday={attendance} />
          <AttendanceOverviewTable date={date} onDateChange={setDate} attendance={attendance} loading={loading} />
        </div>
      </div>
    </div>
  );
}