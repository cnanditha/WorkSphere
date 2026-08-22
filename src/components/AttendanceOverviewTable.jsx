import { useMemo, useState } from "react";
import RhythmStrip from "./RhythmStrip";

const STATUS_FILTERS = ["all", "Present", "Half-day", "Leave", "Absent"];

function toCSV(rows) {
  const header = ["Employee", "Date", "Status", "Check In", "Check Out"];
  const lines = rows.map((r) =>
    [
      r.users?.name ?? r.employee_id,
      r.date,
      r.status,
      r.check_in ? new Date(r.check_in).toLocaleTimeString() : "",
      r.check_out ? new Date(r.check_out).toLocaleTimeString() : "",
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

function downloadCSV(rows, dateStr) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance-${dateStr}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AttendanceOverview({
  date,
  onDateChange,
  attendance,
  loading,
}) {
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return attendance;
    return attendance.filter((a) => a.status === statusFilter);
  }, [attendance, statusFilter]);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#161927] flex flex-col h-full">
      <div className="p-4 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white/80">
            Attendance — Today's Rhythm
          </h2>
          <p className="text-xs text-white/40 mt-0.5">
            Each bar shows when someone was actually in, 8:00–19:00
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="rounded-lg bg-white/[0.04] border border-white/[0.08] px-2 py-1.5 text-sm text-white/80 outline-none focus:border-amber-400/60"
          />
          <button
            onClick={() => downloadCSV(filtered, date)}
            className="text-xs px-3 py-1.5 rounded-lg border border-white/[0.08] text-white/60 hover:border-amber-400/60 hover:text-amber-300 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="px-4 pt-3 flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              statusFilter === s
                ? "border-amber-400/60 text-amber-300 bg-amber-400/10"
                : "border-white/[0.08] text-white/50 hover:border-white/20"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto max-h-[480px] divide-y divide-white/[0.05] mt-3">
        {loading && (
          <p className="p-6 text-center text-sm text-white/30">
            Loading attendance…
          </p>
        )}
        {!loading && filtered.length === 0 && (
          <p className="p-6 text-center text-sm text-white/30">
            No records for this filter.
          </p>
        )}
        {!loading &&
          filtered.map((row) => (
            <div key={row.id} className="flex items-center gap-4 px-4 py-3">
              <span className="w-32 shrink-0 text-sm text-white/80 truncate">
                {row.users?.name ?? row.employee_id}
              </span>
              <RhythmStrip
                status={row.status}
                checkIn={row.check_in}
                checkOut={row.check_out}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
