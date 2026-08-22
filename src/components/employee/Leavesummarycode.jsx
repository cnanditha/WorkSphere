// src/components/employee/LeaveSummaryCard.jsx
import { useEffect, useState } from "react";
import {
  fetchMyLeaveSummary,
  subscribeToMyLeaves,
} from "../../lib/employeeApi";

const STATUS_STYLE = {
  Pending: "bg-[#F2A93B]/10 text-[#B5790C] border-[#F2A93B]/30",
  Approved: "bg-[#1FA97F]/10 text-[#1FA97F] border-[#1FA97F]/30",
  Rejected: "bg-[#E5484D]/10 text-[#E5484D] border-[#E5484D]/30",
};

export default function LeaveSummaryCard({ userId }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    fetchMyLeaveSummary(userId)
      .then(setLeaves)
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    const unsubscribe = subscribeToMyLeaves(userId, load);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <div className="rounded-xl border border-[#E4E2DC] bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-[#14161A]">
        Leave Requests
      </h3>
      {loading ? (
        <p className="text-sm text-[#8A8778]">Loading…</p>
      ) : leaves.length === 0 ? (
        <p className="text-sm text-[#8A8778]">No leave requests yet.</p>
      ) : (
        <ul className="divide-y divide-[#EFEEE8]">
          {leaves.slice(0, 5).map((lv) => (
            <li
              key={lv.id}
              className="flex items-center justify-between py-2.5"
            >
              <div>
                <p className="text-sm font-medium text-[#14161A]">
                  {lv.type} leave
                </p>
                <p className="text-xs text-[#8A8778]">
                  {lv.start_date} → {lv.end_date}
                </p>
              </div>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[lv.status] ?? ""}`}
              >
                {lv.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
