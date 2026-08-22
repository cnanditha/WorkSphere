import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

const LEAVE_TYPES = ["Paid", "Sick", "Unpaid"];

/**
 * LeaveForm
 * Employee-facing: apply for leave (type, date range, remarks),
 * and see the status of their own past requests.
 */
export default function LeaveForm() {
  const [userId, setUserId] = useState(null);
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    type: "Paid",
    start_date: "",
    end_date: "",
    remarks: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      const { data: authData } = await supabase.auth.getUser();
      const uid = authData?.user?.id ?? null;
      if (!isMounted) return;
      setUserId(uid);

      if (uid) {
        await fetchMyLeaves(uid);
      } else {
        setLoading(false);
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  async function fetchMyLeaves(uid) {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("leaves")
      .select("id, type, start_date, end_date, remarks, status")
      .eq("employee_id", uid)
      .order("start_date", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setMyLeaves([]);
    } else {
      setMyLeaves(data ?? []);
    }
    setLoading(false);
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!userId) {
      setSubmitError("You must be signed in to apply for leave.");
      return;
    }
    if (!form.start_date || !form.end_date) {
      setSubmitError("Please select both a start and end date.");
      return;
    }
    if (new Date(form.end_date) < new Date(form.start_date)) {
      setSubmitError("End date can't be before the start date.");
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await supabase.from("leaves").insert({
      employee_id: userId,
      type: form.type,
      start_date: form.start_date,
      end_date: form.end_date,
      remarks: form.remarks,
      status: "Pending",
    });

    setSubmitting(false);

    if (insertError) {
      setSubmitError(insertError.message);
      return;
    }

    setSubmitSuccess(true);
    setForm({ type: "Paid", start_date: "", end_date: "", remarks: "" });
    fetchMyLeaves(userId);
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-xl font-semibold text-slate-900">Apply for Leave</h1>
          <p className="text-sm text-slate-500">Submit a request — your admin will review it.</p>
        </header>

        {/* Apply form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Leave type</label>
            <select
              value={form.type}
              onChange={(e) => updateField("type", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
            >
              {LEAVE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => updateField("start_date", e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End date</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => updateField("end_date", e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
            <textarea
              value={form.remarks}
              onChange={(e) => updateField("remarks", e.target.value)}
              rows={3}
              placeholder="Reason for leave (optional)"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
            />
          </div>

          {submitError && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-2 text-sm text-rose-700">
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-700">
              Leave request submitted.
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting…" : "Submit request"}
          </button>
        </form>

        {/* History */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Your leave history</h2>
          </div>

          {error && (
            <div className="px-5 py-4 text-sm text-rose-600 bg-rose-50 border-b border-rose-100">
              Couldn't load your requests: {error}
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="px-5 py-8 text-center text-sm text-slate-400">Loading…</div>
            ) : myLeaves.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                No leave requests yet.
              </div>
            ) : (
              myLeaves.map((leave) => (
                <div key={leave.id} className="px-5 py-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {leave.type} · {leave.start_date} → {leave.end_date}
                    </p>
                    {leave.remarks && (
                      <p className="text-xs text-slate-500 mt-0.5">{leave.remarks}</p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_STYLES[leave.status] || "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {leave.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
