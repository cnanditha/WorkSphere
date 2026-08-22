// src/components/employee/AttendanceHistoryStrip.jsx
import { useEffect, useState } from "react";
import { fetchMyAttendanceHistory } from "../../lib/employeeApi";

const DOT_COLOR = {
  Present: "bg-[#1FA97F]",
  Absent: "bg-[#E5484D]",
  "Half-day": "bg-[#F2A93B]",
  Leave: "bg-[#2954E5]",
};

export default function AttendanceHistoryStrip({ userId, days = 14 }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchMyAttendanceHistory(userId, days)
      .then((r) => active && setRows(r))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [userId, days]);

  const presentCount = rows.filter((r) => r.status === "Present").length;

  return (
    <div className="rounded-xl border border-[#E4E2DC] bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#14161A]">
          Last {days} Days
        </h3>
        {!loading && (
          <span className="font-mono text-xs text-[#8A8778]">
            {presentCount}/{rows.length} present
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-[#8A8778]">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-[#8A8778]">No attendance recorded yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {rows.map((r) => (
            <div
              key={r.id}
              title={`${r.date}: ${r.status}`}
              className="flex flex-col items-center gap-1"
            >
              <span
                className={`h-3 w-3 rounded-sm ${DOT_COLOR[r.status] ?? "bg-[#E4E2DC]"}`}
              />
              <span className="font-mono text-[10px] text-[#8A8778]">
                {new Date(r.date).getDate()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
