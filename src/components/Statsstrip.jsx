const CARDS = [
  { key: "totalEmployees", label: "Total Employees", accent: "text-white" },
  { key: "present", label: "Present Today", accent: "text-amber-400" },
  { key: "onLeave", label: "On Leave", accent: "text-teal-300" },
  { key: "absent", label: "Absent", accent: "text-rose-400" },
  {
    key: "pendingLeaves",
    label: "Pending Approvals",
    accent: "text-amber-300",
  },
];

export default function StatsStrip({ stats, loading }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {CARDS.map((c) => (
        <div
          key={c.key}
          className="rounded-2xl border border-white/[0.06] bg-[#161927] px-4 py-4 flex flex-col gap-1"
        >
          <span className="text-[11px] uppercase tracking-wider text-white/40">
            {c.label}
          </span>
          <span
            className={`text-2xl font-semibold font-mono tabular-nums ${c.accent}`}
          >
            {loading ? "—" : (stats?.[c.key] ?? 0)}
          </span>
        </div>
      ))}
    </div>
  );
}
