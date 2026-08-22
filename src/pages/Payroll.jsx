import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * Payroll (read-only, employee view)
 *
 * NOTE: there's no `payroll` table in the current schema (users / attendance /
 * leaves only), and per the team's own breakdown this is meant to be static/
 * dummy data rather than a real query — that's what keeps this page "moderate"
 * instead of hard. The employee's name/email/role are pulled from `users` (real),
 * the salary breakdown below is placeholder data.
 *
 * If a real `payroll` table gets added later (e.g. employee_id, basic, hra,
 * deductions, net_pay, month), swap MOCK_PAYSLIP for a supabase query the same
 * way LeaveForm/AttendanceOverview do it.
 */

const MOCK_PAYSLIP = {
  month: "August 2026",
  basic: 45000,
  hra: 12000,
  allowances: 5000,
  deductions: 3200,
};

function currency(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function Payroll() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      setLoading(true);
      setError(null);

      const { data: authData } = await supabase.auth.getUser();
      const uid = authData?.user?.id;

      if (!uid) {
        if (isMounted) {
          setError("You must be signed in to view payroll.");
          setLoading(false);
        }
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("users")
        .select("name, email, role")
        .eq("id", uid)
        .single();

      if (!isMounted) return;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setProfile(data);
      }
      setLoading(false);
    }

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const net =
    MOCK_PAYSLIP.basic + MOCK_PAYSLIP.hra + MOCK_PAYSLIP.allowances - MOCK_PAYSLIP.deductions;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="text-xl font-semibold text-slate-900">Payroll</h1>
          <p className="text-sm text-slate-500">Read-only — contact HR for corrections.</p>
        </header>

        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100">
            <p className="text-sm text-slate-500">
              {loading ? "Loading…" : profile?.name || "—"}
            </p>
            <p className="text-xs text-slate-400">{loading ? "" : profile?.email}</p>
            <h2 className="mt-2 text-base font-semibold text-slate-900">
              Payslip · {MOCK_PAYSLIP.month}
            </h2>
          </div>

          <div className="px-6 py-4 space-y-3">
            <Row label="Basic salary" value={currency(MOCK_PAYSLIP.basic)} />
            <Row label="HRA" value={currency(MOCK_PAYSLIP.hra)} />
            <Row label="Other allowances" value={currency(MOCK_PAYSLIP.allowances)} />
            <Row label="Deductions" value={`− ${currency(MOCK_PAYSLIP.deductions)}`} negative />
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">Net pay</span>
            <span className="text-lg font-semibold text-emerald-700">{currency(net)}</span>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Figures shown are placeholder values for demo purposes.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, negative }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={negative ? "text-rose-600" : "text-slate-900"}>{value}</span>
    </div>
  );
}
