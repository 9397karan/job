import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Users,
  FileText,
  MapPin,
  BriefcaseBusiness,
  CalendarDays,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock3,
  XCircle,
  Video,
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

const getStatusVariant = (status) => {
  switch (status) {
    case "APPLIED":
      return "info";
    case "UNDER_REVIEW":
      return "warning";
    case "INTERVIEW_SCHEDULED":
      return "success";
    case "ACCEPTED":
      return "success";
    case "REJECTED":
      return "error";
    default:
      return "neutral";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "APPLIED":
      return FileText;
    case "UNDER_REVIEW":
      return Clock3;
    case "INTERVIEW_SCHEDULED":
      return Video;
    case "ACCEPTED":
      return CheckCircle2;
    case "REJECTED":
      return XCircle;
    default:
      return FileText;
  }
};

const RecruiterApplications = () => {
  const [searchParams] = useSearchParams();

  const jobFromUrl = searchParams.get("job");

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [jobFilter, setJobFilter] = useState(jobFromUrl || "ALL");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const [applicationsResponse, jobsResponse] =
        await Promise.all([
          api.get("/recruiter/applications"),
          api.get("/recruiter/jobs"),
        ]);

      setApplications(
        applicationsResponse.data?.applications || []
      );

      setJobs(jobsResponse.data?.jobs || []);
    } catch (err) {
      console.error("Recruiter applications error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const candidateName =
        application.applicant?.name?.toLowerCase() || "";

      const candidateEmail =
        application.applicant?.email?.toLowerCase() || "";

      const jobTitle =
        application.job?.title?.toLowerCase() || "";

      const location =
        application.job?.location?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        candidateName.includes(query) ||
        candidateEmail.includes(query) ||
        jobTitle.includes(query) ||
        location.includes(query);

      const matchesStatus =
        status === "ALL" ||
        application.status === status;

      const applicationJobId =
        application.job?._id || application.job;

      const matchesJob =
        jobFilter === "ALL" ||
        applicationJobId?.toString() ===
          jobFilter?.toString();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesJob
      );
    });
  }, [applications, search, status, jobFilter]);

  const stats = useMemo(() => {
    return {
      total: applications.length,

      applied: applications.filter(
        (item) => item.status === "APPLIED"
      ).length,

      review: applications.filter(
        (item) => item.status === "UNDER_REVIEW"
      ).length,

      interviews: applications.filter(
        (item) => item.status === "INTERVIEW_SCHEDULED"
      ).length,

      accepted: applications.filter(
        (item) => item.status === "ACCEPTED"
      ).length,

      rejected: applications.filter(
        (item) => item.status === "REJECTED"
      ).length,
    };
  }, [applications]);

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Applications"
          description="Review and manage candidates who applied to your jobs."
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
        title="Applications"
        description="Review candidates and manage their application status."
      />

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          <AlertCircle size={18} />

          <span className="flex-1">{error}</span>

          <button
            onClick={fetchApplications}
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
                Total Applications
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stats.total}
              </p>
            </div>

            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Users size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Needs Review
              </p>

              <p className="mt-1 text-2xl font-bold text-amber-600">
                {stats.applied + stats.review}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <Clock3 size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Interviews
              </p>

              <p className="mt-1 text-2xl font-bold text-violet-600">
                {stats.interviews}
              </p>
            </div>

            <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
              <Video size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Accepted
              </p>

              <p className="mt-1 text-2xl font-bold text-emerald-600">
                {stats.accepted}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
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
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="select select-bordered w-full border-slate-300 bg-white text-slate-900 lg:w-48"
          >
            <option value="ALL">All Status</option>
            <option value="APPLIED">Applied</option>
            <option value="UNDER_REVIEW">
              Under Review
            </option>
            <option value="INTERVIEW_SCHEDULED">
              Interview Scheduled
            </option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="select select-bordered w-full border-slate-300 bg-white text-slate-900 lg:w-56"
          >
            <option value="ALL">All Jobs</option>

            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title}
              </option>
            ))}
          </select>

          <button
            onClick={fetchApplications}
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
            {filteredApplications.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-800">
            {applications.length}
          </span>{" "}
          applications
        </p>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Users}
            title={
              applications.length === 0
                ? "No applications yet"
                : "No applications found"
            }
            description={
              applications.length === 0
                ? "Candidate applications will appear here when someone applies to your jobs."
                : "Try changing your search or filters."
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {filteredApplications.map((application) => {
            const StatusIcon = getStatusIcon(
              application.status
            );

            return (
              <Card
                key={application._id}
                className="overflow-hidden"
              >
                <div className="p-5">
                  {/* Candidate Header */}
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xl font-bold text-white">
                      {application.applicant?.name
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-bold text-slate-900">
                            {application.applicant?.name ||
                              "Candidate"}
                          </h3>

                          <p className="truncate text-sm text-slate-500">
                            {application.applicant?.email ||
                              "Email not available"}
                          </p>
                        </div>

                        <Badge
                          variant={getStatusVariant(
                            application.status
                          )}
                        >
                          <span className="flex items-center gap-1.5">
                            <StatusIcon size={13} />
                            {application.status?.replace(
                              /_/g,
                              " "
                            )}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Job */}
                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-white p-2 text-indigo-600 shadow-sm">
                        <BriefcaseBusiness size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Applied For
                        </p>

                        <p className="mt-1 truncate font-semibold text-slate-900">
                          {application.job?.title ||
                            "Job Position"}
                        </p>

                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {application.job?.location ||
                              "Remote"}
                          </span>

                          <span className="flex items-center gap-1">
                            <BriefcaseBusiness size={12} />
                            {application.job?.jobType
                              ?.replace(/_/g, " ") ||
                              "Full Time"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Candidate Info */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-xs text-slate-400">
                        Applied On
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                        <CalendarDays size={14} />
                        {formatDate(
                          application.appliedAt
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-xs text-slate-400">
                        Skills
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {application.applicant?.skills
                          ?.length || 0}{" "}
                        skills
                      </p>
                    </div>
                  </div>

                  {/* Skills */}
                  {application.applicant?.skills?.length >
                    0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {application.applicant.skills
                        .slice(0, 6)
                        .map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                          >
                            {skill}
                          </span>
                        ))}

                      {application.applicant.skills.length >
                        6 && (
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                          +
                          {application.applicant.skills
                            .length - 6}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Resume */}
                  {application.resumeUrl && (
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm transition hover:border-indigo-200 hover:bg-indigo-50/50"
                    >
                      <div className="rounded-lg bg-red-50 p-2 text-red-500">
                        <FileText size={18} />
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">
                          Candidate Resume
                        </p>

                        <p className="text-xs text-slate-500">
                          Open PDF resume
                        </p>
                      </div>

                      <Eye
                        size={17}
                        className="text-indigo-600"
                      />
                    </a>
                  )}

                  {/* Actions */}
                  <div className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row">
                    <Link
                      to={`/recruiter/applications/${application._id}`}
                      className="btn btn-primary flex-1 gap-2"
                    >
                      <Eye size={16} />
                      Review Application
                    </Link>

                    {application.status ===
                      "INTERVIEW_SCHEDULED" && (
                      <Link
                        to={`/interview-room/${application.interview?._id || application.relatedInterview?._id || application.interviewId || ""}`}
                        className="btn btn-outline flex-1 gap-2 border-violet-300 text-violet-700 hover:bg-violet-50"
                      >
                        <Video size={16} />
                        Join Interview
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecruiterApplications;