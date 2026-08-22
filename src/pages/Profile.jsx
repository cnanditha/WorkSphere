// src/pages/EmployeeDashboard.jsx
// Owner: Role B — Employee Dashboard, Check-in/out UI
import { useState } from "react";
import CheckInOutCard from "../components/employee/CheckInOutCard";
import AttendanceHistoryStrip from "../components/employee/AttendanceHistoryStrip";
import LeaveSummaryCard from "../components/employee/LeaveSummaryCard";

// TODO(B): replace with real auth context once A wires up Supabase Auth.
// For now this expects `userId` and `userName` props from the router/auth wrapper.
export default function EmployeeDashboard({ userId, userName = "there" }) {
  const [now] = useState(new Date());

  return (
    <div className="min-h-screen bg-[#F7F6F2] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#8A8778]">
              WorkSphere
            </p>
            <h1 className="text-2xl font-semibold text-[#14161A]">
              Hey, {userName.split(" ")[0]} 👋
            </h1>
          </div>
          <p className="font-mono text-xs text-[#8A8778]">
            {now.toLocaleDateString([], {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </p>
        </header>

        {/* Quick-access cards */}
        <nav className="mb-6 grid grid-cols-3 gap-3">
          <a
            href="/profile"
            className="rounded-xl border border-[#E4E2DC] bg-white p-4 text-center hover:border-[#2954E5]"
          >
            <p className="text-sm font-medium text-[#14161A]">Profile</p>
            <p className="text-xs text-[#8A8778]">View & edit</p>
          </a>
          <a
            href="/attendance"
            className="rounded-xl border border-[#E4E2DC] bg-white p-4 text-center hover:border-[#2954E5]"
          >
            <p className="text-sm font-medium text-[#14161A]">Attendance</p>
            <p className="text-xs text-[#8A8778]">Check history</p>
          </a>
          <a
            href="/leave"
            className="rounded-xl border border-[#E4E2DC] bg-white p-4 text-center hover:border-[#2954E5]"
          >
            <p className="text-sm font-medium text-[#14161A]">Leave Requests</p>
            <p className="text-xs text-[#8A8778]">Apply / track</p>
          </a>
        </nav>

        {/* Main grid */}
        <div className="grid gap-4 md:grid-cols-2">
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
