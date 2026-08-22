import { useEffect, useState, cloneElement } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../lib/auth';
import Navbar from './Navbar';

export default function ProtectedRoute({ children, allowedRole }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0F1A]">
        <p className="animate-pulse font-mono text-sm text-white/40">Loading…</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/login" replace />;

  return (
    <div className="animate-fadeIn">
      <Navbar userName={user.name} userRole={user.role} />
      {cloneElement(children, { userId: user.id, userName: user.name, userRole: user.role })}
    </div>
  );
}