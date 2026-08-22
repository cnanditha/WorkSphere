// src/components/employee/CheckInOutCard.jsx
import { useEffect, useState } from "react";
import {
  checkIn,
  checkOut,
  fetchTodayAttendance,
  subscribeToMyAttendance,
} from "../../lib/employeeApi";

function formatTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(startISO) {
  const ms = Date.now() - new Date(startISO).getTime();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

export default function CheckInOutCard({ userId }) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [, forceTick] = useState(0);

  const load = () => {
    fetchTodayAttendance(userId)
      .then(setRecord)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const unsubscribe = subscribeToMyAttendance(userId, load);
    const tick = setInterval(() => forceTick((n) => n + 1), 60_000); // keep the live timer fresh
    return () => {
      unsubscribe();
      clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleCheckIn = async () => {
    setBusy(true);
    setError(null);
    try {
      setRecord(await checkIn(userId));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleCheckOut = async () => {
    setBusy(true);
    setError(null);
    try {
      setRecord(await checkOut(userId));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const isCheckedIn = record?.check_in && !record?.check_out;
  const isDone = record?.check_in && record?.check_out;

  return (
    <div className="rounded-xl border border-[#E4E2DC] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#14161A]">Today</h3>
        {isCheckedIn && (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1FA97F]/30" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1FA97F]" />
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-[#8A8778]">Loading…</p>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wide text-[#8A8778]">
                Check-in
              </p>
              <p className="font-mono text-xl font-semibold text-[#14161A]">
                {formatTime(record?.check_in)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wide text-[#8A8778]">
                Check-out
              </p>
              <p className="font-mono text-xl font-semibold text-[#14161A]">
                {formatTime(record?.check_out)}
              </p>
            </div>
          </div>

          {isCheckedIn && (
            <p className="mb-4 font-mono text-xs text-[#1FA97F]">
              On the clock · {formatDuration(record.check_in)}
            </p>
          )}
          {isDone && (
            <p className="mb-4 text-xs text-[#8A8778]">
              Day complete. See you tomorrow 👋
            </p>
          )}

          {error && <p className="mb-3 text-xs text-[#E5484D]">{error}</p>}

          {!record && (
            <button
              onClick={handleCheckIn}
              disabled={busy}
              className="w-full rounded-lg bg-[#2954E5] py-2.5 text-sm font-medium text-white transition hover:bg-[#1F42C4] disabled:opacity-60"
            >
              {busy ? "Checking in…" : "Check In"}
            </button>
          )}
          {isCheckedIn && (
            <button
              onClick={handleCheckOut}
              disabled={busy}
              className="w-full rounded-lg bg-[#14161A] py-2.5 text-sm font-medium text-white transition hover:bg-[#2A2D35] disabled:opacity-60"
            >
              {busy ? "Checking out…" : "Check Out"}
            </button>
          )}
          {isDone && (
            <button
              disabled
              className="w-full cursor-not-allowed rounded-lg bg-[#F7F6F2] py-2.5 text-sm font-medium text-[#8A8778]"
            >
              Done for today
            </button>
          )}
        </>
      )}
    </div>
  );
}
