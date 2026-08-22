const DAY_START = 8; // 8:00
const DAY_END = 19; // 19:00
const SPAN = DAY_END - DAY_START;

const STATUS_STYLE = {
  Present: {
    fill: "bg-amber-400",
    glow: "shadow-[0_0_10px_rgba(245,166,35,0.55)]",
  },
  "Half-day": { fill: "bg-amber-400/50", glow: "" },
  Leave: { fill: "bg-teal-300/70", glow: "" },
  Absent: { fill: "", glow: "" },
};

function hourFraction(timestamp) {
  if (!timestamp) return null;
  const d = new Date(timestamp);
  const hour = d.getHours() + d.getMinutes() / 60;
  return Math.min(Math.max((hour - DAY_START) / SPAN, 0), 1);
}

/**
 * Renders one row of the org's "daily rhythm": a track from 8am–7pm with a
 * glowing segment showing when the person was actually in. This is the
 * literal visualization of "Dayflow" — the shape of the workday, at a glance.
 */
export default function RhythmStrip({ status, checkIn, checkOut }) {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.Absent;
  const start = hourFraction(checkIn);
  const end = checkOut
    ? hourFraction(checkOut)
    : start !== null
      ? Math.min(start + 0.02, 1)
      : null;

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="relative h-2 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
        {/* hour ticks every 2 hours for scale reference */}
        <div className="absolute inset-0 flex justify-between px-[1px]">
          {Array.from({ length: Math.floor(SPAN / 2) + 1 }).map((_, i) => (
            <span key={i} className="w-px h-full bg-white/[0.05]" />
          ))}
        </div>

        {status === "Absent" || start === null ? (
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-center">
            <span className="text-[10px] tracking-wide text-rose-400/70 font-mono">
              no activity
            </span>
          </div>
        ) : (
          <div
            className={`absolute inset-y-0 rounded-full ${style.fill} ${style.glow}`}
            style={{ left: `${start * 100}%`, right: `${100 - end * 100}%` }}
          />
        )}
      </div>
      <span className="w-24 shrink-0 font-mono text-[11px] text-white/50 tabular-nums">
        {checkIn
          ? new Date(checkIn).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—"}
        {" → "}
        {checkOut
          ? new Date(checkOut).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—"}
      </span>
    </div>
  );
}
