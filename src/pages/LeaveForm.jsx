import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const STATUS_STYLES = {
  Pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  Approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  Rejected: "bg-rose-500/10 text-rose-400 border-rose-500/30",
};

const LEAVE_TYPES = ["Paid", "Sick", "Unpaid"];

export default function LeaveForm() {
  const [userId, setUserId] = useState(null);
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({ type: "Paid", start_date: "", end_date: "", remarks: "" });
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
      if (uid) await fetchMyLeaves(uid);
      else setLoading(false);
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

  const inputClass =
    "w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600";

  return (
    <div className="min-h-screen bg-black px-6 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-xl font-semibold text-white">Apply for Leave</h1>
          <p className="text-sm text-gray-400">Submit a request — your admin will review it.</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-gray-950 rounded-xl border border-gray-800 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">Leave type</label>
            <select value={form.type} onChange={(e) => updateField("type", e.target.value)} className={inputClass}>
              {LEAVE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Start date</label>
              <input type="date" value={form.start_date} onChange={(e) => updateField("start_date", e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">End date</label>
              <input type="date" value={form.end_date} onChange={(e) => updateField("end_date", e.target.value)} required className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">Remarks</label>
            <textarea value={form.remarks} onChange={(e) => updateField("remarks", e.target.value)} rows={3}
              placeholder="Reason for leave (optional)" className={inputClass} />
          </div>

          {submitError && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 px-4 py-2 text-sm text-rose-400">
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-sm text-emerald-400">
              Leave request submitted.
            </div>
          )}

          <button type="submit" disabled={submitting}
            className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? "Submitting…" : "Submit request"}
          </button>
        </form>

        <div className="bg-gray-950 rounded-xl border border-gray-800 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-800">
            <h2 className="text-base font-semibold text-white">Your leave history</h2>
          </div>

          {error && (
            <div className="px-5 py-4 text-sm text-rose-400 bg-rose-500/10 border-b border-gray-800">
              Couldn't load your requests: {error}
            </div>
          )}

          <div className="divide-y divide-gray-800">
            {loading ? (
              <div className="px-5 py-8 text-center text-sm text-gray-500">Loading…</div>
            ) : myLeaves.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-500">No leave requests yet.</div>
            ) : (
              myLeaves.map((leave) => (
                <div key={leave.id} className="px-5 py-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-100">
                      {leave.type} · {leave.start_date} → {leave.end_date}
                    </p>
                    {leave.remarks && <p className="text-xs text-gray-500 mt-0.5">{leave.remarks}</p>}
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[leave.status] || "bg-gray-800 text-gray-400 border-gray-700"}`}>
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
