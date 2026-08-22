import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_OPTIONS = ["All", "Pending", "Approved", "Rejected"];

/**
 * LeaveApproval
 * Admin-facing: view all leave requests across employees, approve or reject.
 * Status change reflects immediately in the employee's own LeaveForm view
 * since both read/write the same `leaves` row.
 */
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
    const { error: updateError } = await supabase
      .from("leaves")
      .update({ status: newStatus })
      .eq("id", leaveId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setLeaves((prev) =>
        prev.map((l) => (l.id === leaveId ? { ...l, status: newStatus } : l))
      );
    }
    setActioningId(null);
  }

  const filtered = useMemo(() => {
    if (statusFilter === "All") return leaves;
    return leaves.filter((l) => l.status === statusFilter);
  }, [leaves, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <h1 className="text-xl font-semibold text-slate-900">Leave Approvals</h1>
          <p className="text-sm text-slate-500">Review and act on employee leave requests.</p>
        </header>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-100">
            <p className="text-sm text-slate-500">
              {loading ? "Loading…" : `${filtered.length} request${filtered.length === 1 ? "" : "s"}`}
            </p>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="px-5 py-4 text-sm text-rose-600 bg-rose-50 border-b border-rose-100">
              {error}
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="px-5 py-8 text-center text-sm text-slate-400">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                No {statusFilter !== "All" ? statusFilter.toLowerCase() : ""} requests.
              </div>
            ) : (
              filtered.map((leave) => (
                <div key={leave.id} className="px-5 py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {leave.employeeName}{" "}
                      <span className="font-normal text-slate-500">· {leave.employeeEmail}</span>
                    </p>
                    <p className="text-sm text-slate-700 mt-0.5">
                      {leave.type} leave · {leave.start_date} → {leave.end_date}
                    </p>
                    {leave.remarks && (
                      <p className="text-xs text-slate-500 mt-1">"{leave.remarks}"</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[leave.status] || "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {leave.status}
                    </span>

                    {leave.status === "Pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(leave.id, "Approved")}
                          disabled={actioningId === leave.id}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(leave.id, "Rejected")}
                          disabled={actioningId === leave.id}
                          className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
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
