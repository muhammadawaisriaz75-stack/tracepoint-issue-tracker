import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
    isActive ? "bg-ink text-cream" : "text-stone-600 hover:bg-white/70 hover:text-ink"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <NavLink to="/" className="font-display text-xl tracking-tight">
          Trace<span className="text-terracotta">Point</span>
        </NavLink>

        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/issues" className={linkClass}>
            Issues
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-stone-600 sm:inline">
            {user?.name}
          </span>
          <button type="button" onClick={handleLogout} className="btn-ghost">
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
