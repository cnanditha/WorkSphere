// src/pages/EmployeeDashboard.jsx
// Owner: Role B — Employee Dashboard, Check-in/out UI
import { useState } from "react";
import CheckInOutCard from "../components/employee/CheckInOutCard";
import AttendanceHistoryStrip from "../components/employee/AttendanceHistoryStrip";
import LeaveSummaryCard from "../components/employee/LeaveSummaryCard";

export default function EmployeeDashboard({ userId, userName = "there" }) {
  const [now] = useState(new Date());

  return (
    <div className="min-h-screen bg-[#0D0F1A] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between animate-fadeInUp">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber-300/70">
              WorkSphere
            </p>
            <h1 className="text-2xl font-semibold text-white">
              Hey, {userName.split(" ")[0]} 👋
            </h1>
          </div>
          <p className="font-mono text-xs text-white/40">
            {now.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
          </p>
        </header>

        <nav className="mb-6 grid grid-cols-3 gap-3 animate-fadeInUp">
          <a href="/profile" className="rounded-2xl border border-white/[0.08] bg-[#161927] p-4 text-center transition hover:border-amber-400/50 hover:bg-white/[0.03]">
            <p className="text-sm font-medium text-white/90">Profile</p>
            <p className="text-xs text-white/40">View & edit</p>
          </a>
          <a href="/leave" className="rounded-2xl border border-white/[0.08] bg-[#161927] p-4 text-center transition hover:border-amber-400/50 hover:bg-white/[0.03]">
            <p className="text-sm font-medium text-white/90">Leave Requests</p>
            <p className="text-xs text-white/40">Apply / track</p>
          </a>
          <a href="/payroll" className="rounded-2xl border border-white/[0.08] bg-[#161927] p-4 text-center transition hover:border-amber-400/50 hover:bg-white/[0.03]">
            <p className="text-sm font-medium text-white/90">Payroll</p>
            <p className="text-xs text-white/40">View details</p>
          </a>
        </nav>

        <div className="grid gap-4 md:grid-cols-2 animate-fadeInUp">
          <CheckInOutCard userId={userId} />
          <LeaveSummaryCard userId={userId} />
          <div className="md:col-span-2">
            <AttendanceHistoryStrip userId={userId} days={14} />
          </div>
        </div>
      </div>
    </div>
  );
}