import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Video,
  CalendarDays,
  Clock3,
  User,
  BriefcaseBusiness,
  MapPin,
  Eye,
  RefreshCw,
  CheckCircle2,
  XCircle,
  PlayCircle,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import Badge from "../../components/ui/Badge";

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateTime = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusVariant = (status) => {
  switch (status) {
    case "SCHEDULED":
      return "info";
    case "ONGOING":
      return "success";
    case "COMPLETED":
      return "neutral";
    case "CANCELLED":
      return "error";
    default:
      return "neutral";
  }
};

const RecruiterInterviews = () => {
  const [interviews, setInterviews] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/recruiter/interviews");

      setInterviews(response.data?.interviews || []);
    } catch (err) {
      console.error("Recruiter interviews error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load interviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();

    return {
      total: interviews.length,

      upcoming: interviews.filter(
        (item) =>
          new Date(item.scheduledAt) > now &&
          item.status !== "CANCELLED" &&
          item.status !== "COMPLETED"
      ).length,

      ongoing: interviews.filter(
        (item) => item.status === "ONGOING"
      ).length,

      completed: interviews.filter(
        (item) => item.status === "COMPLETED"
      ).length,

      cancelled: interviews.filter(
        (item) => item.status === "CANCELLED"
      ).length,
    };
  }, [interviews]);

  const filteredInterviews = useMemo(() => {
    const query = search.trim().toLowerCase();
    const now = new Date();

    return interviews
      .filter((interview) => {
        const candidateName =
          interview.candidate?.name?.toLowerCase() || "";

        const candidateEmail =
          interview.candidate?.email?.toLowerCase() || "";

        const jobTitle =
          interview.job?.title?.toLowerCase() || "";

        const location =
          interview.job?.location?.toLowerCase() || "";

        const matchesSearch =
          !query ||
          candidateName.includes(query) ||
          candidateEmail.includes(query) ||
          jobTitle.includes(query) ||
          location.includes(query);

        const matchesStatus =
          status === "ALL" ||
          interview.status === status;

        const interviewDate = new Date(
          interview.scheduledAt
        );

        let matchesDate = true;

        if (dateFilter === "UPCOMING") {
          matchesDate =
            interviewDate > now &&
            interview.status !== "CANCELLED" &&
            interview.status !== "COMPLETED";
        }

        if (dateFilter === "TODAY") {
          matchesDate =
            interviewDate.toDateString() ===
            now.toDateString();
        }

        if (dateFilter === "PAST") {
          matchesDate = interviewDate < now;
        }

        return (
          matchesSearch &&
          matchesStatus &&
          matchesDate
        );
      })
      .sort(
        (a, b) =>
          new Date(a.scheduledAt) -
          new Date(b.scheduledAt)
      );
  }, [
    interviews,
    search,
    status,
    dateFilter,
  ]);

  const getInterviewState = (interview) => {
    const scheduled = new Date(interview.scheduledAt);
    const now = new Date();

    if (interview.status === "CANCELLED") {
      return "cancelled";
    }

    if (interview.status === "COMPLETED") {
      return "completed";
    }

    if (interview.status === "ONGOING") {
      return "ongoing";
    }

    if (scheduled > now) {
      return "upcoming";
    }

    return "past";
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Interviews"
          description="Manage your scheduled candidate interviews."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl bg-white"
            />
          ))}
        </div>

        <div className="mt-6 h-24 animate-pulse rounded-2xl bg-white" />

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-72 animate-pulse rounded-2xl bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Interviews"
        description="Manage upcoming, ongoing and completed candidate interviews."
      />

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          <AlertCircle size={18} />

          <span className="flex-1">{error}</span>

          <button
            onClick={fetchInterviews}
            className="btn btn-sm btn-outline border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Interviews
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stats.total}
              </p>
            </div>

            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Video size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Upcoming
              </p>

              <p className="mt-1 text-2xl font-bold text-blue-600">
                {stats.upcoming}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <CalendarDays size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Ongoing
              </p>

              <p className="mt-1 text-2xl font-bold text-emerald-600">
                {stats.ongoing}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <PlayCircle size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Completed
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-700">
                {stats.completed}
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
              <CheckCircle2 size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mt-6">
        <div className="flex flex-col gap-3 p-4 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate, email, job or location..."
              className="input input-bordered w-full border-slate-300 bg-white pl-10 text-slate-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <select
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(e.target.value)
            }
            className="select select-bordered w-full border-slate-300 bg-white text-slate-900 lg:w-44"
          >
            <option value="ALL">All Dates</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="TODAY">Today</option>
            <option value="PAST">Past</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="select select-bordered w-full border-slate-300 bg-white text-slate-900 lg:w-44"
          >
            <option value="ALL">All Status</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button
            onClick={fetchInterviews}
            className="btn btn-outline border-slate-300 text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </Card>

      {/* Results */}
      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {filteredInterviews.length}
          </span>{" "}
          interviews
        </p>
      </div>

      {filteredInterviews.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Video}
            title={
              interviews.length === 0
                ? "No interviews scheduled"
                : "No interviews found"
            }
            description={
              interviews.length === 0
                ? "Scheduled candidate interviews will appear here."
                : "Try changing your search or filters."
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {filteredInterviews.map((interview) => {
            const state = getInterviewState(interview);

            const canJoin =
              state === "upcoming" ||
              state === "ongoing";

            return (
              <Card
                key={interview._id}
                className="overflow-hidden"
              >
                {/* Top status */}
                <div
                  className={`h-1 ${
                    state === "ongoing"
                      ? "bg-emerald-500"
                      : state === "upcoming"
                      ? "bg-indigo-500"
                      : state === "cancelled"
                      ? "bg-red-400"
                      : "bg-slate-300"
                  }`}
                />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-700">
                        {interview.candidate?.name
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-slate-900">
                          {interview.candidate?.name ||
                            "Candidate"}
                        </h3>

                        <p className="truncate text-sm text-slate-500">
                          {interview.candidate?.email ||
                            "Email unavailable"}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={getStatusVariant(
                        interview.status
                      )}
                    >
                      {interview.status?.replace(
                        /_/g,
                        " "
                      )}
                    </Badge>
                  </div>

                  {/* Date / Time */}
                  <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-white p-2 text-indigo-600 shadow-sm">
                          <CalendarDays size={19} />
                        </div>

                        <div>
                          <p className="text-xs text-indigo-500">
                            Interview Date
                          </p>

                          <p className="font-semibold text-slate-900">
                            {formatDate(
                              interview.scheduledAt
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="hidden h-8 w-px bg-indigo-200 sm:block" />

                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-white p-2 text-indigo-600 shadow-sm">
                          <Clock3 size={19} />
                        </div>

                        <div>
                          <p className="text-xs text-indigo-500">
                            Time
                          </p>

                          <p className="font-semibold text-slate-900">
                            {formatTime(
                              interview.scheduledAt
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="hidden h-8 w-px bg-indigo-200 sm:block" />

                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-white p-2 text-indigo-600 shadow-sm">
                          <Video size={19} />
                        </div>

                        <div>
                          <p className="text-xs text-indigo-500">
                            Duration
                          </p>

                          <p className="font-semibold text-slate-900">
                            {interview.duration || 30} min
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Job */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                      <BriefcaseBusiness size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-400">
                        Position
                      </p>

                      <p className="truncate text-sm font-semibold text-slate-800">
                        {interview.job?.title ||
                          "Job Position"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                      <MapPin size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-400">
                        Location
                      </p>

                      <p className="truncate text-sm font-semibold text-slate-800">
                        {interview.job?.location ||
                          "Remote"}
                      </p>
                    </div>
                  </div>

                  {/* Candidate */}
                  <div className="mt-4 flex items-center gap-3 border-t border-slate-200 pt-4">
                    <User
                      size={16}
                      className="text-slate-400"
                    />

                    <span className="text-xs text-slate-500">
                      Candidate:{" "}
                      <span className="font-semibold text-slate-700">
                        {interview.candidate?.name ||
                          "Candidate"}
                      </span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row">
                    {canJoin && (
                      <Link
                        to={`/interview-room/${interview._id}`}
                        className={`btn flex-1 gap-2 ${
                          state === "ongoing"
                            ? "btn-success"
                            : "btn-primary"
                        }`}
                      >
                        <Video size={16} />
                        {state === "ongoing"
                          ? "Join Now"
                          : "Join Interview"}
                      </Link>
                    )}

                    <Link
                      to={`/recruiter/interviews/${interview._id}`}
                      className="btn btn-outline flex-1 gap-2 border-slate-300 text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <Eye size={16} />
                      View Details
                    </Link>
                  </div>

                  {/* Time info */}
                  <p className="mt-3 text-center text-xs text-slate-400">
                    Scheduled for{" "}
                    {formatDateTime(
                      interview.scheduledAt
                    )}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecruiterInterviews;