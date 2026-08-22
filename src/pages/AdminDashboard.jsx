import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import EmployeeList from "../components/EmployeeList";
import AttendanceOverviewTable from "../components/AttendanceOverviewTable";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent || "text-slate-900"}`}>{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [stats, setStats] = useState({
    totalEmployees: null,
    present: null,
    absent: null,
    onLeave: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      const date = todayISO();

      const [totalRes, presentRes, absentRes, leaveRes] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "employee"),
        supabase
          .from("attendance")
          .select("id", { count: "exact", head: true })
          .eq("date", date)
          .eq("status", "Present"),
        supabase
          .from("attendance")
          .select("id", { count: "exact", head: true })
          .eq("date", date)
          .eq("status", "Absent"),
        supabase
          .from("attendance")
          .select("id", { count: "exact", head: true })
          .eq("date", date)
          .eq("status", "Leave"),
      ]);

      if (!isMounted) return;

      setStats({
        totalEmployees: totalRes.count ?? 0,
        present: presentRes.count ?? 0,
        absent: absentRes.count ?? 0,
        onLeave: leaveRes.count ?? 0,
      });
    }

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">
            Employee directory and attendance, across the whole team.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
          <StatCard label="Total employees" value={stats.totalEmployees ?? "—"} />
          <StatCard label="Present today" value={stats.present ?? "—"} accent="text-emerald-600" />
          <StatCard label="Absent today" value={stats.absent ?? "—"} accent="text-rose-600" />
          <StatCard label="On leave today" value={stats.onLeave ?? "—"} accent="text-amber-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <EmployeeList
              onSelectEmployee={setSelectedEmployee}
              selectedEmployeeId={selectedEmployee?.id}
            />
          </div>
          <div className="lg:col-span-2">
            <AttendanceOverviewTable employeeId={selectedEmployee?.id ?? null} />
          </div>
        </div>
      </div>
    </div>
  );
}
