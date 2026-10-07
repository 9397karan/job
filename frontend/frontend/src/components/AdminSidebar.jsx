import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Users,
} from "lucide-react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

const AdminSidebar = () => {
  const [searchParams] = useSearchParams();

  const currentTab =
    searchParams.get("tab") || "overview";

  const menuItems = [
    {
      label: "Overview",
      tab: "overview",
      icon: BarChart3,
    },
    {
      label: "Users",
      tab: "users",
      icon: Users,
    },
    {
      label: "Companies",
      tab: "companies",
      icon: Building2,
    },
    {
      label: "Job Posts",
      tab: "jobs",
      icon: BriefcaseBusiness,
    },
  ];

  return (
    <aside className="sidebar-dark sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 lg:block">
      <div className="flex h-full flex-col">

        {/* ================================================= */}
        {/* ADMIN PROFILE */}
        {/* ================================================= */}

        <div className="border-b border-slate-700/60 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
              A
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                Administrator
              </p>

              <p className="text-[11px] text-slate-400">
                JobConnect Admin
              </p>
            </div>

          </div>
        </div>


        {/* ================================================= */}
        {/* NAVIGATION */}
        {/* ================================================= */}

        <div className="flex-1 overflow-y-auto px-3 py-5">

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Administration
          </p>

          <nav className="space-y-1.5">

            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                currentTab === item.tab;

              const path =
                item.tab === "overview"
                  ? "/admin"
                  : `/admin?tab=${item.tab}`;

              return (
                <Link
                  key={item.tab}
                  to={path}
                  className={[
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white",
                  ].join(" ")}
                >

                  <Icon
                    size={18}
                    strokeWidth={
                      isActive ? 2.3 : 2
                    }
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
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}

                </Link>
              );
            })}

          </nav>
        </div>


        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="border-t border-slate-700/60 p-4">
          <p className="text-center text-[10px] text-slate-600">
            JobConnect Admin v1.0
          </p>
        </div>

      </div>
    </aside>
  );
};

export default AdminSidebar;