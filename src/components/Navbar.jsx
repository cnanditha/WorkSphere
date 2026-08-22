import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "../lib/auth";

export default function Navbar({ userName, userRole }) {
  const navigate = useNavigate();
  const location = useLocation();

  const links =
    userRole === "admin"
      ? [
          { to: "/admin", label: "Dashboard" },
          { to: "/leave-approval", label: "Leave Approvals" },
          { to: "/payroll", label: "Payroll" },
        ]
      : [
          { to: "/employee", label: "Dashboard" },
          { to: "/profile", label: "Profile" },
          { to: "/leave", label: "Leave" },
          { to: "/payroll", label: "Payroll" },
        ];

  async function handleLogout() {
    await signOut();
    navigate("/login");
  }

  return (
    <nav className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#0D0F1A]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link to={userRole === "admin" ? "/admin" : "/employee"} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="font-mono text-sm font-semibold tracking-wide text-white">WorkSphere</span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                location.pathname === l.to
                  ? "bg-white/[0.08] text-white"
                  : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-white/50 sm:inline">{userName}</span>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-white/[0.1] px-3 py-1.5 text-xs font-medium text-white/60 transition hover:border-rose-400/50 hover:text-rose-400"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}