import {
  Menu,
  Bell,
  ChevronDown,
  LogOut,
  User,
  BriefcaseBusiness,
  Settings,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isRecruiter = user?.role === "RECRUITER";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const getInitials = (name = "") => {
    return (
      name
        .trim()
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase() || "U"
    );
  };

  const profilePath = isRecruiter
    ? "/recruiter/company"
    : "/job-seeker/profile";

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-slate-700/60 bg-[#1f252d] text-white shadow-lg">
      <div className="flex h-full items-center justify-between px-3 sm:px-5 lg:px-6">
        {/* Left */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile Menu */}
          <button
            type="button"
            onClick={onMenuClick}
            className="btn btn-ghost btn-square text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>

          {/* Logo */}
          <Link
            to={isRecruiter ? "/recruiter" : "/job-seeker"}
            className="group flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105">
              <BriefcaseBusiness
                size={19}
                strokeWidth={2.3}
              />
            </div>

            <div className="hidden sm:block">
              <p className="text-[15px] font-bold tracking-tight text-white">
                JobConnect
              </p>

              <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-slate-400">
                Career Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Notifications */}
          <div className="relative">
            <NotificationBell />
          </div>

          <div className="mx-1 hidden h-7 w-px bg-slate-700 sm:block" />

          {/* User Menu */}
          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              type="button"
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-white/10 sm:px-2.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold shadow-md">
                {getInitials(user?.name)}
              </div>

              <div className="hidden max-w-32 text-left md:block">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.name || "User"}
                </p>

                <p className="truncate text-[11px] text-slate-400">
                  {isRecruiter
                    ? "Recruiter"
                    : "Job Seeker"}
                </p>
              </div>

              <ChevronDown
                size={16}
                className="hidden text-slate-400 md:block"
              />
            </button>

            <ul
              tabIndex={0}
              className="menu dropdown-content z-[60] mt-3 w-60 rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 shadow-xl"
            >
              {/* User info */}
              <li className="mb-1">
                <div className="pointer-events-none flex gap-3 rounded-xl bg-slate-50 px-3 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700">
                    {getInitials(user?.name)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {user?.name || "User"}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {user?.email || ""}
                    </p>
                  </div>
                </div>
              </li>

              <li>
                <Link
                  to={profilePath}
                  className="gap-3 rounded-xl"
                >
                  <User size={17} />
                  Profile
                </Link>
              </li>

              <li>
                <Link
                  to={
                    isRecruiter
                      ? "/recruiter/company"
                      : "/job-seeker/profile"
                  }
                  className="gap-3 rounded-xl"
                >
                  <Settings size={17} />
                  Settings
                </Link>
              </li>

              <div className="my-1 border-t border-slate-100" />

              <li>
                <button
                  onClick={handleLogout}
                  className="gap-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;