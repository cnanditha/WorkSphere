import { useRealtimeAttendance } from "../lib/Userealtimeattendance";

export default function LivePulse({ date }) {
  const { liveCount, connected } = useRealtimeAttendance(date);

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#161927] px-4 py-2">
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${
            connected ? "animate-ping bg-emerald-400/40" : "bg-white/10"
          }`}
        />
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            connected ? "bg-emerald-400" : "bg-white/20"
          }`}
        />
      </span>
      <span className="font-mono text-xs text-white/70">
        {liveCount} checked in right now
      </span>
    </div>
  );
}