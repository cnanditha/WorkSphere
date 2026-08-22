import { useMemo, useState } from "react";

const STATUS_DOT = {
  Present: "bg-amber-400",
  "Half-day": "bg-amber-400/50",
  Leave: "bg-teal-300",
  Absent: "bg-rose-400",
  Unmarked: "bg-white/20",
};

export default function EmployeeList({ employees, attendanceToday }) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const statusByEmployee = useMemo(() => {
    const map = new Map();
    for (const row of attendanceToday) map.set(row.employee_id, row.status);
    return map;
  }, [attendanceToday]);

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const matchesQuery =
        e.name?.toLowerCase().includes(query.toLowerCase()) ||
        e.email?.toLowerCase().includes(query.toLowerCase());
      const matchesRole = roleFilter === "all" || e.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [employees, query, roleFilter]);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#161927] flex flex-col h-full">
      <div className="p-4 border-b border-white/[0.06] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-white/80">
            Employees
          </h2>
          <span className="text-xs text-white/40 font-mono">
            {filtered.length} of {employees.length}
          </span>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white/90 placeholder:text-white/30 outline-none focus:border-amber-400/60 transition-colors"
        />
        <div className="flex gap-2">
          {["all", "employee", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors capitalize ${
                roleFilter === r
                  ? "border-amber-400/60 text-amber-300 bg-amber-400/10"
                  : "border-white/[0.08] text-white/50 hover:border-white/20"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-y-auto max-h-[520px] divide-y divide-white/[0.05]">
        {filtered.length === 0 && (
          <p className="p-6 text-center text-sm text-white/30">
            No employees match that search.
          </p>
        )}
        {filtered.map((e) => {
          const status = statusByEmployee.get(e.id) ?? "Unmarked";
          return (
            <div
              key={e.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400/30 to-teal-300/20 flex items-center justify-center text-xs font-semibold text-white/80 shrink-0">
                {e.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white/90 truncate">{e.name}</p>
                <p className="text-xs text-white/40 truncate">{e.email}</p>
              </div>
              <span className="text-[10px] uppercase tracking-wide text-white/40 border border-white/10 rounded px-1.5 py-0.5">
                {e.role}
              </span>
              <span className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`}
                />
                <span className="text-xs text-white/50 w-14">{status}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
