import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Filter,
  Loader2,
  MapPin,
  Search,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { CardSkeleton } from "../../components/ui/Skeleton";


const Applications = () => {
  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [error, setError] =
    useState("");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/applications/my"
      );

      setApplications(
        response.data.applications ||
          response.data.data ||
          []
      );
    } catch (error) {
      console.error(
        "Fetch applications error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load your applications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  /* =========================================================
     HELPERS
  ========================================================= */

  const getJob = (application) => {
    return application.job || {};
  };

  const getCompany = (application) => {
    return getJob(application).company || {};
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatStatus = (status) => {
    if (!status) return "Applied";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) => letter.toUpperCase()
      );
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "ACCEPTED":
        return "success";

      case "REJECTED":
        return "error";

      case "INTERVIEW_SCHEDULED":
        return "info";

      case "UNDER_REVIEW":
        return "warning";

      case "APPLIED":
      default:
        return "neutral";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ACCEPTED":
        return CheckCircle2;

      case "REJECTED":
        return XCircle;

      case "INTERVIEW_SCHEDULED":
        return CalendarDays;

      case "UNDER_REVIEW":
        return Clock3;

      default:
        return FileText;
    }
  };

  /* =========================================================
     FILTERED APPLICATIONS
  ========================================================= */

  const filteredApplications = useMemo(() => {
    return applications.filter(
      (application) => {
        const job = getJob(application);
        const company =
          getCompany(application);

        const searchText =
          `${job.title || ""} ${
            company.name || ""
          } ${job.location || ""}`.toLowerCase();

        const matchesSearch =
          !search.trim() ||
          searchText.includes(
            search.toLowerCase().trim()
          );

        const matchesStatus =
          statusFilter === "ALL" ||
          application.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    applications,
    search,
    statusFilter,
  ]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {
    return {
      total: applications.length,

      applied: applications.filter(
        (item) =>
          item.status === "APPLIED"
      ).length,

      review: applications.filter(
        (item) =>
          item.status === "UNDER_REVIEW"
      ).length,

      interviews: applications.filter(
        (item) =>
          item.status ===
          "INTERVIEW_SCHEDULED"
      ).length,

      accepted: applications.filter(
        (item) =>
          item.status === "ACCEPTED"
      ).length,

      rejected: applications.filter(
        (item) =>
          item.status === "REJECTED"
      ).length,
    };
  }, [applications]);


  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <PageHeader
        title="My Applications"
        description="Track the progress of every job application in one place."
        action={
          <Link
            to="/job-seeker/jobs"
            className="btn btn-primary gap-2"
          >
            <BriefcaseBusiness size={17} />
            Find Jobs
          </Link>
        }
      />

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="alert border border-red-200 bg-red-50 text-red-700">

          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="ml-auto text-xs font-semibold underline"
          >
            Dismiss
          </button>

        </div>
      )}

      {/* =====================================================
          STATS
      ===================================================== */}

      {!loading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">

          <ApplicationStat
            label="Total"
            value={stats.total}
            icon={FileText}
            color="indigo"
          />

          <ApplicationStat
            label="Applied"
            value={stats.applied}
            icon={FileText}
            color="slate"
          />

          <ApplicationStat
            label="Under Review"
            value={stats.review}
            icon={Clock3}
            color="amber"
          />

          <ApplicationStat
            label="Interviews"
            value={stats.interviews}
            icon={CalendarDays}
            color="blue"
          />

          <ApplicationStat
            label="Accepted"
            value={stats.accepted}
            icon={CheckCircle2}
            color="emerald"
          />

          <ApplicationStat
            label="Rejected"
            value={stats.rejected}
            icon={XCircle}
            color="rose"
          />

        </div>
      )}

      {/* =====================================================
          SEARCH + FILTER
      ===================================================== */}

      <Card className="border-slate-200 bg-white">

        <div className="flex flex-col gap-3 lg:flex-row">

          {/* Search */}

          <div className="flex h-11 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10">

            <Search
              size={18}
              className="shrink-0 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search by job title, company or location..."
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="text-slate-400 hover:text-slate-700"
              >
                <XCircle size={16} />
              </button>
            )}

          </div>

          {/* Status filter */}

          <div className="flex h-11 items-center gap-2">

            <div className="flex h-full items-center justify-center rounded-xl bg-slate-100 px-3 text-slate-500">
              <Filter size={16} />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="select select-bordered h-11 min-w-44 rounded-xl border-slate-200 bg-white text-sm"
            >
              <option value="ALL">
                All Applications
              </option>

              <option value="APPLIED">
                Applied
              </option>

              <option value="UNDER_REVIEW">
                Under Review
              </option>

              <option value="INTERVIEW_SCHEDULED">
                Interview Scheduled
              </option>

              <option value="ACCEPTED">
                Accepted
              </option>

              <option value="REJECTED">
                Rejected
              </option>
            </select>

          </div>

        </div>

      </Card>

      {/* =====================================================
          RESULT COUNT
      ===================================================== */}

      {!loading && (
        <div className="flex items-center justify-between">

          <div>
            <h2 className="font-semibold text-slate-900">
              Applications
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Showing{" "}
              {filteredApplications.length}{" "}
              of {applications.length}
            </p>
          </div>

          {(search ||
            statusFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Clear filters
            </button>
          )}

        </div>
      )}

      {/* =====================================================
          APPLICATIONS
      ===================================================== */}

      {loading ? (
        <div className="space-y-4">

          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />

        </div>
      ) : applications.length === 0 ? (
        <Card className="border-slate-200 bg-white">

          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="Start exploring jobs and submit your first application."
            action={
              <Link
                to="/job-seeker/jobs"
                className="btn btn-primary gap-2"
              >
                <Search size={17} />
                Find Jobs
              </Link>
            }
          />

        </Card>
      ) : filteredApplications.length === 0 ? (
        <Card className="border-slate-200 bg-white">

          <EmptyState
            icon={Search}
            title="No matching applications"
            description="Try changing your search or status filter."
            action={
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter(
                    "ALL"
                  );
                }}
                className="btn btn-outline"
              >
                Clear Filters
              </button>
            }
          />

        </Card>
      ) : (
        <div className="space-y-4">

          {filteredApplications.map(
            (application) => (
              <ApplicationCard
                key={application._id}
                application={application}
                job={getJob(application)}
                company={getCompany(
                  application
                )}
                formatDate={formatDate}
                formatStatus={
                  formatStatus
                }
                statusVariant={getStatusVariant(
                  application.status
                )}
                StatusIcon={getStatusIcon(
                  application.status
                )}
              />
            )
          )}

        </div>
      )}

    </div>
  );
};


/* =========================================================
   APPLICATION STAT
========================================================= */

const ApplicationStat = ({
  label,
  value,
  icon: Icon,
  color,
}) => {
  const colors = {
    indigo:
      "bg-indigo-50 text-indigo-600",
    slate:
      "bg-slate-100 text-slate-600",
    amber:
      "bg-amber-50 text-amber-600",
    blue:
      "bg-blue-50 text-blue-600",
    emerald:
      "bg-emerald-50 text-emerald-600",
    rose:
      "bg-rose-50 text-rose-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">

      <div className="flex items-center gap-3">

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}
        >
          <Icon size={17} />
        </div>

        <div className="min-w-0">

          <p className="truncate text-[11px] font-medium text-slate-400">
            {label}
          </p>

          <p className="mt-0.5 text-lg font-bold text-slate-900">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
};


/* =========================================================
   APPLICATION CARD
========================================================= */

const ApplicationCard = ({
  application,
  job,
  company,
  formatDate,
  formatStatus,
  statusVariant,
  StatusIcon,
}) => {
  return (
    <Card
      hover
      className="group border-slate-200 bg-white"
    >

      <div className="flex flex-col gap-5">

        {/* =================================================
            TOP
        ================================================= */}

        <div className="flex items-start gap-4">

          {/* Company logo */}

          <div className="flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-indigo-50 text-indigo-600">

            {company.logo ? (
              <img
                src={company.logo}
                alt={
                  company.name ||
                  "Company"
                }
                className="h-full w-full object-cover"
              />
            ) : (
              <BriefcaseBusiness
                size={22}
              />
            )}

          </div>

          {/* Job */}

          <div className="min-w-0 flex-1">

            <div className="flex flex-col justify-between gap-2 sm:flex-row">

              <div className="min-w-0">

                <Link
                  to={`/job-seeker/applications/${application._id}`}
                  className="line-clamp-2 text-lg font-bold tracking-tight text-slate-900 transition hover:text-primary"
                >
                  {job.title ||
                    "Job Application"}
                </Link>

                <p className="mt-1 truncate text-sm font-medium text-slate-500">
                  {company.name ||
                    "Company"}
                </p>

              </div>

              <Badge
                variant={statusVariant}
                className="w-fit"
              >
                <StatusIcon
                  size={13}
                />

                {formatStatus(
                  application.status
                )}
              </Badge>

            </div>

          </div>

        </div>

        {/* =================================================
            INFORMATION
        ================================================= */}

        <div className="grid gap-3 sm:grid-cols-3">

          <ApplicationInfo
            icon={MapPin}
            label="Location"
            value={
              job.location ||
              "Not specified"
            }
          />

          <ApplicationInfo
            icon={CalendarDays}
            label="Applied On"
            value={formatDate(
              application.appliedAt
            )}
          />

          <ApplicationInfo
            icon={Clock3}
            label="Last Updated"
            value={formatDate(
              application.reviewedAt ||
                application.appliedAt
            )}
          />

        </div>

        {/* =================================================
            COVER LETTER PREVIEW
        ================================================= */}

        {application.coverLetter && (
          <div className="rounded-xl bg-slate-50 p-4">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cover Letter
            </p>

            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
              {application.coverLetter}
            </p>

          </div>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2 text-xs text-slate-400">

            <FileText size={14} />

            Application ID:

            <span className="font-mono text-slate-500">
              {application._id?.slice(
                -8
              )}
            </span>

          </div>

          

        </div>

      </div>

    </Card>
  );
};


/* =========================================================
   APPLICATION INFO
========================================================= */

const ApplicationInfo = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
        <Icon size={15} />
      </div>

      <div className="min-w-0">

        <p className="text-[11px] text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-xs font-semibold text-slate-700">
          {value}
        </p>

      </div>

    </div>
  );
};

export default Applications;