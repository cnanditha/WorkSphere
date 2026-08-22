import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabaseClient";
import { getLiveCheckedIn } from "./adminQueries";

/**
 * Subscribes to Supabase Realtime on the `attendance` table and keeps a
 * live "currently checked in" count for the given date. Falls back to a
 * one-off fetch if Realtime isn't enabled on the table.
 */
export function useRealtimeAttendance(dateStr) {
  const [liveCount, setLiveCount] = useState(0);
  const [connected, setConnected] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const count = await getLiveCheckedIn(dateStr);
      setLiveCount(count);
    } catch (err) {
      console.error("useRealtimeAttendance refresh failed", err);
    }
  }, [dateStr]);

  useEffect(() => {
    refresh();

    const channel = supabase
      .channel(`attendance-live-${dateStr}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendance",
          filter: `date=eq.${dateStr}`,
        },
        () => refresh(),
      )
      .subscribe((status) => setConnected(status === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dateStr, refresh]);

  return { liveCount, connected };
}
