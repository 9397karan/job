import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  Users,
  CalendarDays,
  Building2,
  Plus,
  ArrowRight,
  Clock3,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Eye,
  FileText,
  Video,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";

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

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [company, setCompany] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        jobsResponse,
        applicationsResponse,
        interviewsResponse,
        companyResponse,
      ] = await Promise.all([
        api.get("/recruiter/jobs"),
        api.get("/recruiter/applications"),
        api.get("/recruiter/interviews"),
        api.get("/recruiter/company"),
      ]);

      setJobs(jobsResponse.data?.jobs || []);
      setApplications(applicationsResponse.data?.applications || []);
      setInterviews(interviewsResponse.data?.interviews || []);
      setCompany(
        companyResponse.data?.company ||
          companyResponse.data?.data ||
          null
      );
    } catch (err) {
      console.error("Recruiter dashboard error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load recruiter dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = useMemo(() => {
    return {
      jobs: jobs.length,

      activeJobs: jobs.filter(
        (job) => job.isActive !== false
      ).length,

      applications: applications.length,

      pendingApplications: applications.filter(
        (application) =>
          application.status === "APPLIED" ||
          application.status === "UNDER_REVIEW"
      ).length,

      interviews: interviews.length,

      upcomingInterviews: interviews.filter(
        (interview) =>
          interview.status === "SCHEDULED" ||
          interview.status === "ONGOING"
      ).length,

      accepted: applications.filter(
        (application) => application.status === "ACCEPTED"
      ).length,
    };
  }, [jobs, applications, interviews]);

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort(
        (a, b) =>
          new Date(b.appliedAt || b.createdAt) -
          new Date(a.appliedAt || a.createdAt)
      )
      .slice(0, 5);
  }, [applications]);

  const upcomingInterviews = useMemo(() => {
    return [...interviews]
      .filter(
        (interview) =>
          interview.status === "SCHEDULED" ||
          interview.status === "ONGOING"
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledAt) -
          new Date(b.scheduledAt)
      )
      .slice(0, 4);
  }, [interviews]);

  const topJobs = useMemo(() => {
    return [...jobs]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);
  }, [jobs]);

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Recruiter Dashboard"
          description="Manage your jobs, candidates and interviews."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-white"
            />
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-2xl bg-white" />
          <div className="h-96 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Welcome${company?.name ? `, ${company.name}` : ""}`}
        description="Manage your recruitment activity from one place."
        action={
          <Link
            to="/recruiter/jobs/create"
            className="btn btn-primary gap-2"
          >
            <Plus size={18} />
            Post New Job
          </Link>
        }
      />

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          <span className="flex-1">{error}</span>

          <button
            onClick={fetchDashboard}
            className="btn btn-sm btn-outline border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}

      {/* Company profile warning */}
      {!company?.name && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="rounded-xl bg-white p-3 text-amber-600 shadow-sm">
              <Building2 size={22} />
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-slate-900">
                Complete your company profile
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                Add your company information so candidates can
                learn more about your organization.
              </p>
            </div>

            <Link
              to="/recruiter/company"
              className="btn btn-sm border-amber-300 bg-white text-amber-700 hover:bg-amber-100"
            >
              Setup Profile
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Jobs"
          value={stats.jobs}
          icon={BriefcaseBusiness}
          color="primary"
          description={`${stats.activeJobs} active jobs`}
        />

        <StatCard
          title="Applications"
          value={stats.applications}
          icon={Users}
          color="success"
          description={`${stats.pendingApplications} need review`}
        />

        <StatCard
          title="Interviews"
          value={stats.interviews}
          icon={CalendarDays}
          color="warning"
          description={`${stats.upcomingInterviews} upcoming`}
        />

        <StatCard
          title="Accepted"
          value={stats.accepted}
          icon={CheckCircle2}
          color="info"
          description="Candidates hired"
        />
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/recruiter/jobs/create"
          className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Plus size={19} />
            </div>

            <div className="flex-1">
              <p className="font-semibold text-slate-900">
                Post a Job
              </p>

              <p className="text-xs text-slate-500">
                Create a new opening
              </p>
            </div>

            <ArrowRight
              size={17}
              className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600"
            />
          </div>
        </Link>

        <Link
          to="/recruiter/applications"
          className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <Users size={19} />
            </div>

            <div className="flex-1">
              <p className="font-semibold text-slate-900">
                Review Candidates
              </p>

              <p className="text-xs text-slate-500">
                View applications
              </p>
            </div>

            <ArrowRight
              size={17}
              className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600"
            />
          </div>
        </Link>

        <Link
          to="/recruiter/interviews"
          className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
              <Video size={19} />
            </div>

            <div className="flex-1">
              <p className="font-semibold text-slate-900">
                Interviews
              </p>

              <p className="text-xs text-slate-500">
                Manage video interviews
              </p>
            </div>

            <ArrowRight
              size={17}
              className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600"
            />
          </div>
        </Link>

        <Link
          to="/recruiter/company"
          className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-50 p-2.5 text-orange-600">
              <Building2 size={19} />
            </div>

            <div className="flex-1">
              <p className="font-semibold text-slate-900">
                Company Profile
              </p>

              <p className="text-xs text-slate-500">
                Manage company details
              </p>
            </div>

            <ArrowRight
              size={17}
              className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600"
            />
          </div>
        </Link>
      </div>

      {/* Main dashboard */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* Recent applications */}
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div>
              <h2 className="font-bold text-slate-900">
                Recent Applications
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest candidates who applied to your jobs.
              </p>
            </div>

            <Link
              to="/recruiter/applications"
              className="btn btn-sm btn-ghost gap-1 text-indigo-600 hover:bg-indigo-50"
            >
              View All
              <ArrowRight size={15} />
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No applications yet"
              description="Applications from candidates will appear here."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {recentApplications.map((application) => (
                <Link
                  key={application._id}
                  to={`/recruiter/applications/${application._id}`}
                  className="block p-5 transition hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-600">
                        {application.applicant?.name
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {application.applicant?.name ||
                            "Candidate"}
                        </p>

                        <p className="mt-0.5 truncate text-sm text-slate-500">
                          {application.job?.title ||
                            "Job Application"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Applied{" "}
                          {formatDate(
                            application.appliedAt ||
                              application.createdAt
                          )}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={getStatusVariant(
                        application.status
                      )}
                    >
                      {application.status?.replace(
                        /_/g,
                        " "
                      )}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming interviews */}
        <Card>
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div>
              <h2 className="font-bold text-slate-900">
                Upcoming Interviews
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your next candidate meetings.
              </p>
            </div>

            <Link
              to="/recruiter/interviews"
              className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
            >
              <ArrowRight size={18} />
            </Link>
          </div>

          {upcomingInterviews.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No upcoming interviews"
              description="Scheduled interviews will appear here."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingInterviews.map((interview) => (
                <div
                  key={interview._id}
                  className="p-4"
                >
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Video size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {interview.candidate?.name ||
                          "Candidate"}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {interview.job?.title ||
                          "Interview"}
                      </p>

                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <CalendarDays size={13} />
                        {formatDate(
                          interview.scheduledAt
                        )}

                        <Clock3 size={13} className="ml-1" />

                        {interview.scheduledAt
                          ? new Date(
                              interview.scheduledAt
                            ).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </div>

                      <Link
                        to={`/interview-room/${interview._id}`}
                        className="btn btn-xs btn-primary mt-3 gap-1"
                      >
                        <Video size={13} />
                        Join
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Job performance */}
      <Card className="mt-6">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">
              Job Performance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              See how your job postings are performing.
            </p>
          </div>

          <Link
            to="/recruiter/jobs"
            className="btn btn-sm btn-outline gap-2 border-slate-300 text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600"
          >
            Manage Jobs
            <ArrowRight size={15} />
          </Link>
        </div>

        {topJobs.length === 0 ? (
          <EmptyState
            icon={BriefcaseBusiness}
            title="No jobs posted"
            description="Create your first job posting to start receiving applications."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="border-slate-200 text-slate-500">
                  <th>Job</th>
                  <th>Location</th>
                  <th>Views</th>
                  <th>Applications</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {topJobs.map((job) => {
                  const jobApplications =
                    applications.filter(
                      (application) =>
                        application.job?._id === job._id ||
                        application.job === job._id
                    ).length;

                  return (
                    <tr
                      key={job._id}
                      className="border-slate-100 hover:bg-slate-50"
                    >
                      <td>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {job.title}
                          </p>

                          <p className="text-xs text-slate-500">
                            {job.jobType?.replace(
                              /_/g,
                              " "
                            )}
                          </p>
                        </div>
                      </td>

                      <td>
                        <span className="text-sm text-slate-600">
                          {job.location || "Remote"}
                        </span>
                      </td>

                      <td>
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Eye size={15} />
                          {job.views || 0}
                        </div>
                      </td>

                      <td>
                        <span className="font-semibold text-slate-800">
                          {jobApplications}
                        </span>
                      </td>

                      <td>
                        {job.isActive !== false ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td>
                        <Link
                          to={`/recruiter/jobs/${job._id}`}
                          className="btn btn-sm btn-ghost text-indigo-600 hover:bg-indigo-50"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Bottom insight */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-5">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-white p-3 text-indigo-600 shadow-sm">
              <TrendingUp size={22} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Recruitment Overview
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                You currently have{" "}
                <strong>{stats.pendingApplications}</strong>{" "}
                application
                {stats.pendingApplications !== 1
                  ? "s"
                  : ""}{" "}
                waiting for review.
              </p>

              <Link
                to="/recruiter/applications"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Review applications
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-white p-3 text-emerald-600 shadow-sm">
              <CalendarDays size={22} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Interview Schedule
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                You have{" "}
                <strong>{stats.upcomingInterviews}</strong>{" "}
                upcoming interview
                {stats.upcomingInterviews !== 1
                  ? "s"
                  : ""}.
              </p>

              <Link
                to="/recruiter/interviews"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
              >
                View interviews
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;