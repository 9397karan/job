import { useEffect, useState } from "react";

import {
  BriefcaseBusiness,
  Building2,
  FileText,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import {
  getAdminDashboard,
  getAdminUsers,
  getAdminCompanies,
  getAdminJobs,
  getAdminApplicationStats,
} from "../../services/adminService";


// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value ?? 0}
          </p>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">
              {subtitle}
            </p>
          )}

        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon size={21} />
        </div>

      </div>

    </div>
  );
};


// ============================================================
// ROLE BADGE
// ============================================================

const RoleBadge = ({ role }) => {

  const isRecruiter =
    role === "RECRUITER";

  return (
    <span
      className={[
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        isRecruiter
          ? "bg-violet-50 text-violet-700"
          : "bg-blue-50 text-blue-700",
      ].join(" ")}
    >
      {isRecruiter
        ? "Recruiter"
        : "Job Seeker"}
    </span>
  );
};


// ============================================================
// STATUS BADGE
// ============================================================

const StatusBadge = ({
  active,
  suspended,
}) => {

  const isActive =
    active && !suspended;

  return (
    <span
      className={[
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        isActive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700",
      ].join(" ")}
    >
      {isActive
        ? "Active"
        : "Inactive"}
    </span>
  );
};


// ============================================================
// EMPTY STATE
// ============================================================

const EmptyState = ({
  title,
  message,
}) => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <FileText size={25} />
      </div>

      <h3 className="mt-4 font-semibold text-slate-800">
        {title}
      </h3>

      <p className="mt-1 max-w-sm text-sm text-slate-400">
        {message}
      </p>

    </div>
  );
};


// ============================================================
// ADMIN DASHBOARD
// ============================================================

const AdminDashboard = () => {

  const [stats, setStats] =
    useState(null);

  const [users, setUsers] =
    useState([]);

  const [companies, setCompanies] =
    useState([]);

  const [jobs, setJobs] =
    useState([]);

  const [
    applicationStats,
    setApplicationStats,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadData = async (
    showLoader = true
  ) => {

    try {

      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const [
        dashboardData,
        usersData,
        companiesData,
        jobsData,
        applicationsData,
      ] = await Promise.all([
        getAdminDashboard(),
        getAdminUsers(),
        getAdminCompanies(),
        getAdminJobs(),
        getAdminApplicationStats(),
      ]);

      setStats(
        dashboardData?.stats || null
      );

      setUsers(
        usersData?.users || []
      );

      setCompanies(
        companiesData?.companies || []
      );

      setJobs(
        jobsData?.jobs || []
      );

      setApplicationStats(
        applicationsData?.stats || null
      );

    } catch (error) {

      console.error(
        "ADMIN DASHBOARD ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to load admin dashboard."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadData();
  }, []);


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (
      <div className="flex min-h-[60vh] items-center justify-center">

        <span className="loading loading-spinner loading-lg text-indigo-600" />

      </div>
    );
  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {

    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6">

        <h2 className="font-semibold text-red-800">
          Unable to load admin dashboard
        </h2>

        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>

        <button
          onClick={() => loadData()}
          className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          Try Again
        </button>

      </div>
    );
  }


  return (
    <div className="mx-auto max-w-7xl space-y-6">


      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <div className="mb-2 flex items-center gap-2 text-indigo-600">

            <ShieldCheck size={18} />

            <span className="text-sm font-semibold">
              Administration
            </span>

          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Admin Dashboard
          </h1>

          <p className="mt-1 max-w-2xl text-slate-500">
            Monitor JobConnect users, companies,
            job posts and applications.
          </p>

        </div>


        <button
          onClick={() =>
            loadData(false)
          }
          disabled={refreshing}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >

          <RefreshCw
            size={17}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}

        </button>

      </div>


      {/* ====================================================== */}
      {/* TOP STATS */}
      {/* ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

        <StatCard
          title="Total Users"
          value={
            stats?.totalUsers
          }
          subtitle="Seekers + recruiters"
          icon={Users}
        />

        <StatCard
          title="Job Seekers"
          value={
            stats?.jobSeekers
          }
          subtitle="Registered candidates"
          icon={UserRound}
        />

        <StatCard
          title="Recruiters"
          value={
            stats?.recruiters
          }
          subtitle="Registered recruiters"
          icon={Users}
        />

        <StatCard
          title="Companies"
          value={
            stats?.totalCompanies
          }
          subtitle="Registered companies"
          icon={Building2}
        />

        <StatCard
          title="Applications"
          value={
            stats?.totalApplications
          }
          subtitle="Total applications"
          icon={FileText}
        />

      </div>


      {/* ====================================================== */}
      {/* SECONDARY STATS */}
      {/* ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2">

        <StatCard
          title="Job Posts"
          value={
            stats?.totalJobs
          }
          subtitle="Total jobs posted"
          icon={BriefcaseBusiness}
        />

        <StatCard
          title="Scheduled Interviews"
          value={
            applicationStats?.interviewScheduled
          }
          subtitle="Applications with interviews"
          icon={FileText}
        />

      </div>


      {/* ====================================================== */}
      {/* OVERVIEW */}
      {/* ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">

          <h2 className="text-lg font-bold text-slate-900">
            Platform Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current JobConnect platform statistics.
          </p>

        </div>


        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Job Seekers
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stats?.jobSeekers || 0}
            </p>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{
                  width: `${
                    stats?.totalUsers
                      ? Math.min(
                          100,
                          (stats.jobSeekers /
                            stats.totalUsers) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>


          <div className="rounded-2xl bg-slate-50 p-5">

            <p className="text-sm text-slate-500">
              Recruiters
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stats?.recruiters || 0}
            </p>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-violet-500"
                style={{
                  width: `${
                    stats?.totalUsers
                      ? Math.min(
                          100,
                          (stats.recruiters /
                            stats.totalUsers) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>

          </div>


          <div className="rounded-2xl bg-slate-50 p-5">

            <p className="text-sm text-slate-500">
              Companies
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stats?.totalCompanies || 0}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Active company profiles
            </p>

          </div>


          <div className="rounded-2xl bg-slate-50 p-5">

            <p className="text-sm text-slate-500">
              Applications
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stats?.totalApplications || 0}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Submitted across all jobs
            </p>

          </div>

        </div>

      </section>


      {/* ====================================================== */}
      {/* USERS */}
      {/* ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Users
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Job seekers and recruiters registered on JobConnect.
              </p>

            </div>

            <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              {users.length} users
            </span>

          </div>

        </div>


        {users.length === 0 ? (

          <EmptyState
            title="No users found"
            message="There are currently no job seekers or recruiters."
          />

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px]">

              <thead className="bg-slate-50">

                <tr>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    User
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Role
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Phone
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {users.map((user) => (

                  <tr
                    key={user._id}
                    className="transition hover:bg-slate-50"
                  >

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">
                          {user.name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>

                        <div className="min-w-0">

                          <p className="truncate font-semibold text-slate-800">
                            {user.name}
                          </p>

                        </div>

                      </div>

                    </td>


                    <td className="px-6 py-4 text-sm text-slate-600">
                      {user.email}
                    </td>


                    <td className="px-6 py-4">
                      <RoleBadge
                        role={user.role}
                      />
                    </td>


                    <td className="px-6 py-4 text-sm text-slate-600">
                      {user.phone || "—"}
                    </td>


                    <td className="px-6 py-4">

                      <StatusBadge
                        active={
                          user.isActive
                        }
                        suspended={
                          user.isSuspended
                        }
                      />

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* ====================================================== */}
      {/* COMPANIES */}
      {/* ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Companies
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Registered companies and their activity.
              </p>

            </div>

            <span className="w-fit rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
              {companies.length} companies
            </span>

          </div>

        </div>


        {companies.length === 0 ? (

          <EmptyState
            title="No companies found"
            message="No recruiter company profiles have been created yet."
          />

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead className="bg-slate-50">

                <tr>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Company
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Industry
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Recruiter
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Jobs
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Applications
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {companies.map(
                  (company) => (

                    <tr
                      key={company._id}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-6 py-4">

                        <div>

                          <p className="font-semibold text-slate-800">
                            {company.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {company.location ||
                              "Location not specified"}
                          </p>

                        </div>

                      </td>


                      <td className="px-6 py-4 text-sm text-slate-600">
                        {company.industry ||
                          "—"}
                      </td>


                      <td className="px-6 py-4">

                        <div>

                          <p className="text-sm font-medium text-slate-700">
                            {company.recruiter
                              ?.name ||
                              "—"}
                          </p>

                          <p className="text-xs text-slate-400">
                            {company.recruiter
                              ?.email ||
                              "—"}
                          </p>

                        </div>

                      </td>


                      <td className="px-6 py-4">

                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                          {company.jobCount ||
                            0}
                        </span>

                      </td>


                      <td className="px-6 py-4">

                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                          {company.applicationCount ||
                            0}
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* ====================================================== */}
      {/* JOB POSTS */}
      {/* ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Job Posts
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                All jobs posted by recruiters.
              </p>

            </div>

            <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              {jobs.length} jobs
            </span>

          </div>

        </div>


        {jobs.length === 0 ? (

          <EmptyState
            title="No job posts found"
            message="Recruiters have not posted any jobs yet."
          />

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px]">

              <thead className="bg-slate-50">

                <tr>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Job
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Company
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Recruiter
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Type
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Location
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Applications
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {jobs.map((job) => (

                  <tr
                    key={job._id}
                    className="transition hover:bg-slate-50"
                  >

                    <td className="px-6 py-4">

                      <div>

                        <p className="font-semibold text-slate-800">
                          {job.title}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-1.5">

                          {job.skills
                            ?.slice(0, 4)
                            .map(
                              (
                                skill,
                                index
                              ) => (
                                <span
                                  key={`${skill}-${index}`}
                                  className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600"
                                >
                                  {skill}
                                </span>
                              )
                            )}

                        </div>

                      </div>

                    </td>


                    <td className="px-6 py-4">

                      <p className="text-sm font-semibold text-slate-700">
                        {job.company
                          ?.name ||
                          "—"}
                      </p>

                    </td>


                    <td className="px-6 py-4">

                      <div>

                        <p className="text-sm text-slate-700">
                          {job.recruiter
                            ?.name ||
                            "—"}
                        </p>

                        <p className="text-xs text-slate-400">
                          {job.recruiter
                            ?.email ||
                            "—"}
                        </p>

                      </div>

                    </td>


                    <td className="px-6 py-4">

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {job.jobType ||
                          "—"}
                      </span>

                    </td>


                    <td className="px-6 py-4 text-sm text-slate-600">
                      {job.location ||
                        "—"}
                    </td>


                    <td className="px-6 py-4">

                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        {job.applicationCount ||
                          0}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* ====================================================== */}
      {/* APPLICATION SUMMARY */}
      {/* ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-5">

          <h2 className="text-lg font-bold text-slate-900">
            Application Summary
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Overall application status across the platform.
          </p>

        </div>


        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <StatCard
            title="Applied"
            value={
              applicationStats?.applied
            }
            subtitle="New applications"
            icon={FileText}
          />

          <StatCard
            title="Under Review"
            value={
              applicationStats?.underReview
            }
            subtitle="Being reviewed"
            icon={FileText}
          />

          <StatCard
            title="Interviews"
            value={
              applicationStats?.interviewScheduled
            }
            subtitle="Interview scheduled"
            icon={FileText}
          />

          <StatCard
            title="Accepted"
            value={
              applicationStats?.accepted
            }
            subtitle="Accepted applications"
            icon={FileText}
          />

          <StatCard
            title="Rejected"
            value={
              applicationStats?.rejected
            }
            subtitle="Rejected applications"
            icon={FileText}
          />

        </div>

      </section>

    </div>
  );
};

export default AdminDashboard;