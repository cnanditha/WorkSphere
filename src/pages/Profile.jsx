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
    return <div className="p-8 text-sm text-[#8A8778]">Loading profile…</div>;
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#8A8778]">WorkSphere · Profile</p>
          <h1 className="text-2xl font-semibold text-[#14161A]">My Profile</h1>
        </header>

        <section className="mb-4 rounded-xl border border-[#E4E2DC] bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-[#14161A]">Personal & Job Details</h2>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-mono uppercase tracking-wide text-[#8A8778]">Name</dt>
              <dd className="text-sm text-[#14161A]">{profile?.name}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-mono uppercase tracking-wide text-[#8A8778]">Email</dt>
              <dd className="text-sm text-[#14161A]">{profile?.email}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-mono uppercase tracking-wide text-[#8A8778]">Role</dt>
              <dd className="text-sm capitalize text-[#14161A]">{profile?.role}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-[#8A8778]">
            Salary structure & documents are read-only — see the Payroll tab. Contact HR to update name, email, or role.
          </p>
        </section>

        <section className="rounded-xl border border-[#E4E2DC] bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-[#14161A]">Editable Details</h2>
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-mono uppercase tracking-wide text-[#8A8778]">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full rounded-lg border border-[#E4E2DC] bg-[#FAFAF8] px-3 py-2 text-sm outline-none focus:border-[#2954E5]"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-mono uppercase tracking-wide text-[#8A8778]">Address</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-[#E4E2DC] bg-[#FAFAF8] px-3 py-2 text-sm outline-none focus:border-[#2954E5]"
                placeholder="Street, city, PIN"
              />
            </div>
            {error && <p className="text-xs text-[#E5484D]">{error}</p>}
            {saved && <p className="text-xs text-[#1FA97F]">Saved ✓</p>}
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#2954E5] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1F42C4] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}