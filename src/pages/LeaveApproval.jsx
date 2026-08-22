import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const STATUS_STYLES = {
  Pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  Approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  Rejected: "bg-rose-500/10 text-rose-400 border-rose-500/30",
};

const STATUS_OPTIONS = ["All", "Pending", "Approved", "Rejected"];

export default function LeaveApproval() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  async function fetchLeaves() {
    setLoading(true);
    setError(null);

    const [usersRes, leavesRes] = await Promise.all([
      supabase.from("users").select("id, name, email").eq("role", "employee"),
      supabase
        .from("leaves")
        .select("id, employee_id, type, start_date, end_date, remarks, status")
        .order("start_date", { ascending: false }),
    ]);

    if (usersRes.error || leavesRes.error) {
      setError(usersRes.error?.message || leavesRes.error?.message);
      setLeaves([]);
      setLoading(false);
      return;
    }

    const usersById = new Map((usersRes.data ?? []).map((u) => [u.id, u]));
    const merged = (leavesRes.data ?? []).map((l) => ({
      ...l,
      employeeName: usersById.get(l.employee_id)?.name ?? "Unknown",
      employeeEmail: usersById.get(l.employee_id)?.email ?? "",
    }));

    setLeaves(merged);
    setLoading(false);
  }

  async function updateStatus(leaveId, newStatus) {
    setActioningId(leaveId);
    const { error: updateError } = await supabase.from("leaves").update({ status: newStatus }).eq("id", leaveId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setLeaves((prev) => prev.map((l) => (l.id === leaveId ? { ...l, status: newStatus } : l)));
    }
    setActioningId(null);
  }

  const filtered = useMemo(() => {
    if (statusFilter === "All") return leaves;
    return leaves.filter((l) => l.status === statusFilter);
  }, [leaves, statusFilter]);

  return (
    <div className="min-h-screen bg-black px-6 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <h1 className="text-xl font-semibold text-white">Leave Approvals</h1>
          <p className="text-sm text-gray-400">Review and act on employee leave requests.</p>
        </header>

        <div className="bg-gray-950 rounded-xl border border-gray-800 shadow-sm">
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-gray-800">
            <p className="text-sm text-gray-400">
              {loading ? "Loading…" : `${filtered.length} request${filtered.length === 1 ? "" : "s"}`}
            </p>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-600"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="px-5 py-4 text-sm text-rose-400 bg-rose-500/10 border-b border-gray-800">
              {error}
            </div>
          )}

          <div className="divide-y divide-gray-800">
            {loading ? (
              <div className="px-5 py-8 text-center text-sm text-gray-500">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-500">
                No {statusFilter !== "All" ? statusFilter.toLowerCase() : ""} requests.
              </div>
            ) : (
              filtered.map((leave) => (
                <div key={leave.id} className="px-5 py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-100">
                      {leave.employeeName} <span className="font-normal text-gray-500">· {leave.employeeEmail}</span>
                    </p>
                    <p className="text-sm text-gray-300 mt-0.5">
                      {leave.type} leave · {leave.start_date} → {leave.end_date}
                    </p>
                    {leave.remarks && <p className="text-xs text-gray-500 mt-1">"{leave.remarks}"</p>}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[leave.status] || "bg-gray-800 text-gray-400 border-gray-700"}`}>
                      {leave.status}
                    </span>

                    {leave.status === "Pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(leave.id, "Approved")}
                          disabled={actioningId === leave.id}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(leave.id, "Rejected")}
                          disabled={actioningId === leave.id}
                          className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
