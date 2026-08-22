import { useRealtimeAttendance } from "../lib/useRealtimeAttendance";

export default function LivePulse({ dateStr }) {
  const { liveCount, connected } = useRealtimeAttendance(dateStr);

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-[#161927] pl-3 pr-4 py-1.5 w-fit">
      <span className="relative flex h-2.5 w-2.5">
        <span
          className={`absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 ${
            connected ? "animate-ping" : ""
          }`}
        />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
      </span>
      <span className="text-sm text-white/80 font-mono tabular-nums">
        {liveCount} checked in right now
      </span>
    </div>
  );
}
