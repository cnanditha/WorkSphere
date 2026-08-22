import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../lib/auth';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signUp(email, password, name, role);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0F1A] px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="w-full max-w-md animate-fadeInUp">
        <div className="mb-8 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-300/70">WorkSphere</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Create your account</h1>
          <p className="mt-1 text-sm text-white/40">Every workday, perfectly aligned.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/[0.08] bg-[#161927] p-8 shadow-2xl animate-scaleIn"
        >
          {error && (
            <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-400 animate-fadeIn">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/40">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="C Nanditha"
              className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-amber-400/60 focus:bg-white/[0.06]"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/40">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-amber-400/60 focus:bg-white/[0.06]"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/40">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-amber-400/60 focus:bg-white/[0.06]"
            />
          </div>

          <div className="mb-6">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/40">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {['employee', 'admin'].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`rounded-lg border py-2.5 text-sm font-medium capitalize transition ${
                    role === r
                      ? 'border-amber-400/60 bg-amber-400/10 text-amber-300'
                      : 'border-white/[0.1] text-white/50 hover:border-white/20'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-400 py-2.5 text-sm font-semibold text-[#0D0F1A] transition hover:bg-amber-300 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>

          <p className="mt-6 text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-amber-300 transition hover:text-amber-200">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}