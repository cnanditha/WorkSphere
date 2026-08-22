import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * NOTE: no `payroll` table in the current schema — salary breakdown
 * below is static/dummy data by design. Employee name/email pulled
 * from `users` is real.
 *
 * Formula used (salaried employee):
 *   Net Pay = Gross Salary + Bonus − Deductions
 *
 * If you switch to hourly employees later, swap grossSalary for
 * hourlyRate * hoursWorked and the rest of the math stays the same:
 *   Net Pay = (Hourly Rate × Hours Worked) + Bonus − Deductions
 */
const MOCK_PAYSLIP = {
  month: "August 2026",
  grossSalary: 58000,
  bonus: 4000,
  deductions: 3200,
};

function currency(n) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
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

      const { data, error: fetchError } = await supabase.from("users").select("name, email, role").eq("id", uid).single();

      if (!isMounted) return;
      if (fetchError) setError(fetchError.message);
      else setProfile(data);
      setLoading(false);
    }

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const { grossSalary, bonus, deductions } = MOCK_PAYSLIP;
  const netPay = grossSalary + bonus - deductions;

  return (
    <div className="min-h-screen bg-black px-6 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="text-xl font-semibold text-white">Payroll</h1>
          <p className="text-sm text-gray-400">Read-only — contact HR for corrections.</p>
        </header>

        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm text-rose-400">
            {error}
          </div>
        )}

        <div className="bg-gray-950 rounded-xl border border-gray-800 shadow-sm animate-fadeInUp">
          <div className="px-6 py-5 border-b border-gray-800">
            <p className="text-sm text-gray-400">{loading ? "Loading…" : profile?.name || "—"}</p>
            <p className="text-xs text-gray-500">{loading ? "" : profile?.email}</p>
            <h2 className="mt-2 text-base font-semibold text-white">Payslip · {MOCK_PAYSLIP.month}</h2>
          </div>

          <div className="px-6 py-4 space-y-3">
            <Row label="Gross salary" value={currency(grossSalary)} />
            <Row label="Bonus" value={`+ ${currency(bonus)}`} positive />
            <Row label="Deductions" value={`− ${currency(deductions)}`} negative />
          </div>

          <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Net pay</span>
            <span className="text-lg font-semibold text-emerald-400">{currency(netPay)}</span>
          </div>

          <div className="px-6 py-3 border-t border-gray-800">
            <p className="text-xs text-gray-500 font-mono text-center">
              Net Pay = Gross Salary + Bonus − Deductions
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-500">Figures shown are placeholder values for demo purposes.</p>
      </div>
    </div>
  );
}

function Row({ label, value, negative, positive }) {
  const color = negative ? "text-rose-400" : positive ? "text-emerald-400" : "text-gray-100";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className={color}>{value}</span>
    </div>
  );
}
