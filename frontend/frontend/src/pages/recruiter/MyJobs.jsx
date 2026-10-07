import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  BriefcaseBusiness,
  MapPin,
  Eye,
  Users,
  Edit3,
  Trash2,
  MoreVertical,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";

const formatSalary = (min, max) => {
  if (!min && !max) return "Salary not specified";

  if (min && max) {
    return `₹${Number(min).toLocaleString("en-IN")} - ₹${Number(
      max
    ).toLocaleString("en-IN")}`;
  }

  if (min) {
    return `From ₹${Number(min).toLocaleString("en-IN")}`;
  }

  return `Up to ₹${Number(max).toLocaleString("en-IN")}`;
};

const formatJobType = (type) => {
  if (!type) return "Full Time";

  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getJobStatus = (job) => {
  if (job.isActive === false) {
    return {
      label: "Inactive",
      className: "bg-slate-100 text-slate-600",
      dot: "bg-slate-400",
    };
  }

  return {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  };
};

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [jobType, setJobType] = useState("ALL");

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const [jobsResponse, applicationsResponse] =
        await Promise.all([
          api.get("/recruiter/jobs"),
          api.get("/recruiter/applications"),
        ]);

      setJobs(jobsResponse.data?.jobs || []);
      setApplications(
        applicationsResponse.data?.applications || []
      );
    } catch (err) {
      console.error("My jobs error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your jobs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const applicationCount = (jobId) => {
    return applications.filter((application) => {
      const applicationJobId =
        application.job?._id || application.job;

      return applicationJobId?.toString() === jobId?.toString();
    }).length;
  };

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !query ||
        job.title?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.skills?.some((skill) =>
          skill.toLowerCase().includes(query)
        );

      const matchesStatus =
        status === "ALL" ||
        (status === "ACTIVE" && job.isActive !== false) ||
        (status === "INACTIVE" && job.isActive === false);

      const matchesJobType =
        jobType === "ALL" || job.jobType === jobType;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesJobType
      );
    });
  }, [jobs, search, status, jobType]);

  const stats = useMemo(() => {
    return {
      total: jobs.length,

      active: jobs.filter(
        (job) => job.isActive !== false
      ).length,

      inactive: jobs.filter(
        (job) => job.isActive === false
      ).length,

      applications: applications.length,

      views: jobs.reduce(
        (total, job) => total + (job.views || 0),
        0
      ),
    };
  }, [jobs, applications]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      setError("");

      await api.delete(`/recruiter/jobs/${deleteId}`);

      setJobs((prev) =>
        prev.filter((job) => job._id !== deleteId)
      );

      setDeleteId(null);
    } catch (err) {
      console.error("Delete job error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete this job."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="My Jobs"
          description="Manage your job postings and candidates."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl bg-white"
            />
          ))}
        </div>

        <div className="mt-6 h-40 animate-pulse rounded-2xl bg-white" />

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
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
        title="My Jobs"
        description="Create, manage and monitor your job postings."
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

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          <AlertCircle size={18} />

          <span className="flex-1">{error}</span>

          <button
            onClick={fetchJobs}
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
              <p className="text-sm font-medium text-slate-500">
                Total Jobs
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stats.total}
              </p>
            </div>

            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <BriefcaseBusiness size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Active Jobs
              </p>

              <p className="mt-1 text-2xl font-bold text-emerald-600">
                {stats.active}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <span className="block h-3 w-3 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Applications
              </p>

              <p className="mt-1 text-2xl font-bold text-violet-600">
                {stats.applications}
              </p>
            </div>

            <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
              <Users size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Views
              </p>

              <p className="mt-1 text-2xl font-bold text-orange-600">
                {stats.views}
              </p>
            </div>

            <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
              <Eye size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mt-6">
        <div className="flex flex-col gap-4 p-4 lg:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs by title, location or skill..."
              className="input input-bordered w-full border-slate-300 bg-white pl-10 text-slate-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="select select-bordered w-full border-slate-300 bg-white text-slate-900 lg:w-44"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          {/* Job Type */}
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="select select-bordered w-full border-slate-300 bg-white text-slate-900 lg:w-48"
          >
            <option value="ALL">All Job Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="CONTRACT">Contract</option>
            <option value="REMOTE">Remote</option>
          </select>

          <button
            onClick={fetchJobs}
            className="btn btn-outline border-slate-300 text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </Card>

      {/* Result count */}
      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {filteredJobs.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-800">
            {jobs.length}
          </span>{" "}
          jobs
        </p>
      </div>

      {/* Jobs */}
      {filteredJobs.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={BriefcaseBusiness}
            title={
              jobs.length === 0
                ? "No jobs posted yet"
                : "No jobs found"
            }
            description={
              jobs.length === 0
                ? "Create your first job posting to start receiving applications."
                : "Try changing your search or filters."
            }
            action={
              jobs.length === 0 ? (
                <Link
                  to="/recruiter/jobs/create"
                  className="btn btn-primary gap-2"
                >
                  <Plus size={17} />
                  Post Your First Job
                </Link>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {filteredJobs.map((job) => {
            const statusInfo = getJobStatus(job);
            const applicationsCount = applicationCount(
              job._id
            );

            return (
              <Card
                key={job._id}
                className="group overflow-hidden"
              >
                {/* Top */}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Logo */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <BriefcaseBusiness size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <Link
                            to={`/recruiter/jobs/${job._id}`}
                            className="block truncate text-lg font-bold text-slate-900 transition hover:text-indigo-600"
                          >
                            {job.title}
                          </Link>

                          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                            <MapPin size={14} />
                            {job.location || "Remote"}
                          </p>
                        </div>

                        <span
                          className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.className}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`}
                          />

                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {formatJobType(job.jobType)}
                    </span>

                    {job.experienceRequired !== undefined && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {job.experienceRequired} yrs experience
                      </span>
                    )}

                    {job.vacancies && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {job.vacancies}{" "}
                        {job.vacancies === 1
                          ? "vacancy"
                          : "vacancies"}
                      </span>
                    )}
                  </div>

                  {/* Salary */}
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-slate-800">
                      {formatSalary(
                        job.salaryMin,
                        job.salaryMax
                      )}
                    </p>
                  </div>

                  {/* Skills */}
                  {job.skills?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                        >
                          {skill}
                        </span>
                      ))}

                      {job.skills.length > 5 && (
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                          +{job.skills.length - 5}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Metrics */}
                  <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-slate-500">
                        <Eye size={14} />
                        <span className="text-xs">
                          Views
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {job.views || 0}
                      </p>
                    </div>

                    <div className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-slate-500">
                        <Users size={14} />
                        <span className="text-xs">
                          Applications
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {applicationsCount}
                      </p>
                    </div>

                    <div className="p-3 text-center">
                      <p className="text-xs text-slate-500">
                        Posted
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {formatDate(
                          job.createdAt || job.postedAt
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row">
                  <Link
                    to={`/recruiter/jobs/${job._id}`}
                    className="btn btn-sm flex-1 gap-2 border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    <ExternalLink size={15} />
                    View Details
                  </Link>

                  <Link
                    to={`/recruiter/jobs/${job._id}/edit`}
                    className="btn btn-sm flex-1 gap-2 border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-100"
                  >
                    <Edit3 size={15} />
                    Edit Job
                  </Link>

                  <button
                    onClick={() => setDeleteId(job._id)}
                    className="btn btn-sm gap-2 border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100"
                  >
                    <Trash2 size={15} />
                    <span className="sm:hidden">
                      Delete
                    </span>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Delete this job?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This action cannot be undone. The job posting and
              its associated data may no longer be available.
            </p>

            <div className="modal-action">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="btn btn-outline border-slate-300 text-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn border-red-600 bg-red-600 text-white hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Job
                  </>
                )}
              </button>
            </div>
          </div>

          <form
            method="dialog"
            className="modal-backdrop"
          >
            <button onClick={() => setDeleteId(null)}>
              close
            </button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default MyJobs;