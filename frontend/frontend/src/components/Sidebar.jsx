import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  BriefcaseBusiness,
  FileText,
  Video,
  Bookmark,
  User,
  Building2,
  PlusCircle,
  Users,
  X,
  ChevronRight,
  LogOut,
  Settings,
  Sparkles
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isRecruiter = user?.role === "RECRUITER";

 const jobSeekerItems = [
  {
    label: "Dashboard",
    path: "/job-seeker",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Find Jobs",
    path: "/job-seeker/jobs",
    icon: Search,
  },
  {
    label: "Applications",
    path: "/job-seeker/applications",
    icon: FileText,
  },
  {
    label: "Interviews",
    path: "/job-seeker/interviews",
    icon: Video,
  },
  {
    label: "Saved Jobs",
    path: "/job-seeker/saved-jobs",
    icon: Bookmark,
  },
  {
    label: "Resume Analyzer",
    path: "/job-seeker/resume-analyzer",
    icon: Sparkles,
  },
  {
    label: "My Profile",
    path: "/job-seeker/profile",
    icon: User,
  },
];

  const recruiterItems = [
    {
      label: "Dashboard",
      path: "/recruiter",
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: "Company Profile",
      path: "/recruiter/company",
      icon: Building2,
    },
    {
      label: "My Jobs",
      path: "/recruiter/jobs",
      icon: BriefcaseBusiness,
    },
    {
      label: "Create Job",
      path: "/recruiter/jobs/create",
      icon: PlusCircle,
    },
    {
      label: "Applications",
      path: "/recruiter/applications",
      icon: Users,
    },
    {
      label: "Interviews",
      path: "/recruiter/interviews",
      icon: Video,
    },
  ];

  const menuItems = isRecruiter
    ? recruiterItems
    : jobSeekerItems;

  /*
   * Close mobile sidebar after navigation
   */
  useEffect(() => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
  }, [location.pathname]);

  /*
   * Prevent body scroll while mobile drawer is open
   */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
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

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex h-full flex-col">
      {/* Mobile Header */}
      {mobile && (
        <div className="flex h-16 items-center justify-between border-b border-slate-700/60 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
              <BriefcaseBusiness size={19} />
            </div>

            <div>
              <p className="text-sm font-bold text-white">
                JobConnect
              </p>

              <p className="text-[9px] uppercase tracking-[0.15em] text-slate-500">
                Career Platform
              </p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="btn btn-ghost btn-square text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* User Profile */}
      <div className="border-b border-slate-700/60 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
            {getInitials(user?.name)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {user?.name || "User"}
            </p>

            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              <p className="text-[11px] text-slate-400">
                {isRecruiter
                  ? "Recruiter"
                  : "Job Seeker"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          Main Menu
        </p>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      strokeWidth={isActive ? 2.3 : 2}
                      className={
                        isActive
                          ? "text-white"
                          : "text-slate-500 transition-colors group-hover:text-slate-300"
                      }
                    />

                    <span className="flex-1">
                      {item.label}
                    </span>

                    {isActive && (
                      <ChevronRight
                        size={15}
                        className="text-indigo-200"
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Action */}
        {isRecruiter ? (
          <div className="mt-8">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Quick Action
            </p>

            <NavLink
              to="/recruiter/jobs/create"
              className="group flex items-center gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-3 text-sm font-medium text-indigo-300 transition hover:border-indigo-500/40 hover:bg-indigo-500/15 hover:text-indigo-200"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20">
                <PlusCircle size={17} />
              </div>

              <div className="flex-1">
                <p className="font-semibold">
                  Post a Job
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Find your next candidate
                </p>
              </div>

              <ChevronRight
                size={15}
                className="text-indigo-400"
              />
            </NavLink>
          </div>
        ) : (
          <div className="mt-8">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Career
            </p>

            <NavLink
              to="/job-seeker/jobs"
              className="group flex items-center gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-3 text-sm font-medium text-indigo-300 transition hover:border-indigo-500/40 hover:bg-indigo-500/15 hover:text-indigo-200"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20">
                <Search size={17} />
              </div>

              <div className="flex-1">
                <p className="font-semibold">
                  Explore Jobs
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Discover opportunities
                </p>
              </div>

              <ChevronRight
                size={15}
                className="text-indigo-400"
              />
            </NavLink>
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="border-t border-slate-700/60 p-3">
        <NavLink
          to={
            isRecruiter
              ? "/recruiter/company"
              : "/job-seeker/profile"
          }
          className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <Settings size={18} />
          Settings
        </NavLink>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={18} />
          Logout
        </button>

        <p className="mt-3 px-3 text-[10px] text-slate-600">
          JobConnect v1.0
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar-dark sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`sidebar-dark fixed inset-y-0 left-0 z-[90] w-[280px] transform shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <SidebarContent mobile />
      </aside>
    </>
  );
};

export default Sidebar;