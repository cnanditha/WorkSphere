const START_HOUR = 8;
const END_HOUR = 19;

const STATUS_COLOR = {
  Present: "bg-emerald-400",
  "Half-day": "bg-amber-300",
  Leave: "bg-sky-300",
  Absent: "bg-rose-400",
};

function toPercent(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const hours = d.getHours() + d.getMinutes() / 60;
  const clamped = Math.min(Math.max(hours, START_HOUR), END_HOUR);
  return ((clamped - START_HOUR) / (END_HOUR - START_HOUR)) * 100;
}

export default function RhythmStrip({ status, checkIn, checkOut }) {
  const startPct = toPercent(checkIn);
  const endPct = toPercent(checkOut) ?? 100;
  const color = STATUS_COLOR[status] ?? "bg-white/20";

  return (
    <div className="relative h-2 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
      {startPct !== null && (
        <div
          className={`absolute top-0 h-full rounded-full ${color}`}
          style={{ left: `${startPct}%`, width: `${Math.max(endPct - startPct, 2)}%` }}
        />
      )}
    </div>
  );
}