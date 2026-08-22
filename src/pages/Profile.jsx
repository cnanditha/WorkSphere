// src/pages/Profile.jsx
// Owner: Role B — Employee Profile page
import { useEffect, useState } from "react";
import { fetchMyProfile, updateMyProfile } from "../lib/employeeApi";

export default function Profile({ userId }) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ phone: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyProfile(userId)
      .then((p) => {
        setProfile(p);
        setForm({ phone: p.phone ?? "", address: p.address ?? "" });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const updated = await updateMyProfile(userId, form);
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0F1A]">
        <p className="animate-pulse font-mono text-sm text-white/40">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0F1A] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 animate-fadeInUp">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber-300/70">
            WorkSphere · Profile
          </p>
          <h1 className="text-2xl font-semibold text-white">My Profile</h1>
        </header>

        {/* Read-only details */}
        <section className="mb-4 rounded-2xl border border-white/[0.08] bg-[#161927] p-5 animate-fadeInUp">
          <h2 className="mb-3 text-sm font-semibold text-white/90">Personal & Job Details</h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-mono uppercase tracking-wide text-white/40">Name</dt>
              <dd className="text-sm text-white/90">{profile?.name}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-mono uppercase tracking-wide text-white/40">Email</dt>
              <dd className="text-sm text-white/90">{profile?.email}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-mono uppercase tracking-wide text-white/40">Role</dt>
              <dd className="text-sm capitalize text-white/90">{profile?.role}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-white/40">
            Salary structure & documents are read-only — see the Payroll tab. Contact HR to update name, email, or role.
          </p>
        </section>

        {/* Editable fields */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#161927] p-5 animate-fadeInUp">
          <h2 className="mb-3 text-sm font-semibold text-white/90">Editable Details</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wide text-white/40">
                Phone
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-amber-400/60 focus:bg-white/[0.06]"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wide text-white/40">
                Address
              </label>
              <textarea
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-amber-400/60 focus:bg-white/[0.06]"
                placeholder="Street, city, PIN"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-400 animate-fadeIn">
                {error}
              </p>
            )}
            {saved && (
              <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-400 animate-fadeIn">
                Saved ✓
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-semibold text-[#0D0F1A] transition hover:bg-amber-300 active:scale-[0.98] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}