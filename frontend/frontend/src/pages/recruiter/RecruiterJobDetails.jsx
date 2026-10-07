import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  Edit3,
  Eye,
  FileText,
  MapPin,
  Trash2,
  Users,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

const formatDate = (date) => {
  if (!date) return "Not available";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatJobType = (type) => {
  if (!type) return "Full Time";

  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

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

const RecruiterJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [jobResponse, applicationsResponse] =
        await Promise.all([
          api.get(`/recruiter/jobs/${id}`),
          api.get("/recruiter/applications"),
        ]);

      const jobData =
        jobResponse.data?.job ||
        jobResponse.data?.data ||
        null;

      if (!jobData) {
        throw new Error("Job not found.");
      }

      setJob(jobData);

      const allApplications =
        applicationsResponse.data?.applications || [];

      const relatedApplications = allApplications.filter(
        (application) => {
          const applicationJob =
            application.job?._id || application.job;

          return (
            applicationJob?.toString() === id?.toString()
          );
        }
      );

      setApplications(relatedApplications);
    } catch (err) {
      console.error("Recruiter job details error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load job details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const applicationStats = useMemo(() => {
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

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort(
        (a, b) =>
          new Date(b.appliedAt || b.createdAt) -
          new Date(a.appliedAt || a.createdAt)
      )
      .slice(0, 5);
  }, [applications]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError("");

      await api.delete(`/recruiter/jobs/${id}`);

      navigate("/recruiter/jobs");
    } catch (err) {
      console.error("Delete job error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete this job."
      );

      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Job Details"
          description="View job posting information and performance."
        />

        <div className="space-y-6">
          <div className="h-56 animate-pulse rounded-2xl bg-white" />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-96 animate-pulse rounded-2xl bg-white lg:col-span-2" />
            <div className="h-96 animate-pulse rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div>
        <PageHeader
          title="Job Details"
          description="View job posting information."
        />

        <Card>
          <div className="p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertCircle size={25} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Unable to load job
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>

            <Link
              to="/recruiter/jobs"
              className="btn btn-primary mt-5 gap-2"
            >
              <ArrowLeft size={17} />
              Back to Jobs
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <PageHeader
        title="Job Details"
        description="Manage your job posting and review candidates."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              to="/recruiter/jobs"
              className="btn btn-outline gap-2 border-slate-300 text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <ArrowLeft size={17} />
              Back
            </Link>

            <Link
              to={`/recruiter/jobs/${id}/edit`}
              className="btn btn-primary gap-2"
            >
              <Edit3 size={17} />
              Edit Job
            </Link>
          </div>
        }
      />

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Job Hero */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 p-6 text-white md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
                <BriefcaseBusiness size={30} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="break-words text-2xl font-bold md:text-3xl">
                    {job.title}
                  </h1>

                  {job.isActive !== false ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-indigo-100">
                  <span className="flex items-center gap-1.5">
                    <Building2 size={15} />
                    {job.company?.name || "Your Company"}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <MapPin size={15} />
                    {job.location || "Remote"}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <BriefcaseBusiness size={15} />
                    {formatJobType(job.jobType)}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to={`/recruiter/jobs/${id}/edit`}
              className="btn border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <Edit3 size={17} />
              Edit Posting
            </Link>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 sm:grid-cols-4 sm:divide-y-0">
          <div className="p-5 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <Eye size={17} />
              <span className="text-sm">Views</span>
            </div>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {job.views || 0}
            </p>
          </div>

          <div className="p-5 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <Users size={17} />
              <span className="text-sm">Applications</span>
            </div>

            <p className="mt-1 text-2xl font-bold text-indigo-600">
              {applicationStats.total}
            </p>
          </div>

          <div className="p-5 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <CalendarDays size={17} />
              <span className="text-sm">Interviews</span>
            </div>

            <p className="mt-1 text-2xl font-bold text-violet-600">
              {applicationStats.interviews}
            </p>
          </div>

          <div className="p-5 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <CheckCircle2 size={17} />
              <span className="text-sm">Accepted</span>
            </div>

            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {applicationStats.accepted}
            </p>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* Left */}
        <div className="space-y-6 xl:col-span-2">
          {/* Description */}
          <Card>
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                  <FileText size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Job Description
                  </h2>

                  <p className="text-sm text-slate-500">
                    Details visible to candidates.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                {job.description}
              </p>
            </div>
          </Card>

          {/* Skills */}
          <Card>
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-bold text-slate-900">
                Required Skills
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Skills specified for this position.
              </p>
            </div>

            <div className="p-5">
              {job.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  No specific skills added.
                </p>
              )}
            </div>
          </Card>

          {/* Recent Applications */}
          <Card>
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="font-bold text-slate-900">
                  Recent Applications
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest candidates for this job.
                </p>
              </div>

              <Link
                to={`/recruiter/applications?job=${id}`}
                className="btn btn-sm btn-ghost gap-1 text-indigo-600 hover:bg-indigo-50"
              >
                View All
                <ExternalLink size={14} />
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="p-8 text-center">
                <Users
                  size={30}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 font-semibold text-slate-700">
                  No applications yet
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Candidate applications will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentApplications.map((application) => (
                  <Link
                    key={application._id}
                    to={`/recruiter/applications/${application._id}`}
                    className="block p-5 transition hover:bg-slate-50"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 flex-1 gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-600">
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
                            {application.applicant?.email ||
                              "No email"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Applied{" "}
                            {formatDate(
                              application.appliedAt
                            )}
                          </p>
                        </div>
                      </div>

                      <Badge
                        variant={
                          application.status === "ACCEPTED"
                            ? "success"
                            : application.status ===
                              "REJECTED"
                            ? "error"
                            : application.status ===
                              "UNDER_REVIEW"
                            ? "warning"
                            : "info"
                        }
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
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Job Information */}
          <Card>
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-bold text-slate-900">
                Job Information
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="flex items-start gap-3 p-4">
                <MapPin
                  size={18}
                  className="mt-0.5 text-indigo-600"
                />

                <div>
                  <p className="text-xs text-slate-400">
                    Location
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {job.location || "Remote"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4">
                <BriefcaseBusiness
                  size={18}
                  className="mt-0.5 text-indigo-600"
                />

                <div>
                  <p className="text-xs text-slate-400">
                    Employment Type
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatJobType(job.jobType)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4">
                <DollarSign
                  size={18}
                  className="mt-0.5 text-indigo-600"
                />

                <div>
                  <p className="text-xs text-slate-400">
                    Salary
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatSalary(
                      job.salaryMin,
                      job.salaryMax
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4">
                <Clock3
                  size={18}
                  className="mt-0.5 text-indigo-600"
                />

                <div>
                  <p className="text-xs text-slate-400">
                    Experience
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {job.experienceRequired || 0} years
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4">
                <Users
                  size={18}
                  className="mt-0.5 text-indigo-600"
                />

                <div>
                  <p className="text-xs text-slate-400">
                    Vacancies
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {job.vacancies || 1}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4">
                <CalendarDays
                  size={18}
                  className="mt-0.5 text-indigo-600"
                />

                <div>
                  <p className="text-xs text-slate-400">
                    Posted On
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatDate(job.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Application Breakdown */}
          <Card>
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-bold text-slate-900">
                Application Overview
              </h2>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-slate-500">
                    Applied
                  </span>

                  <span className="font-semibold text-slate-800">
                    {applicationStats.applied}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-indigo-500"
                    style={{
                      width: `${
                        applicationStats.total
                          ? (applicationStats.applied /
                              applicationStats.total) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-slate-500">
                    Under Review
                  </span>

                  <span className="font-semibold text-slate-800">
                    {applicationStats.review}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-amber-500"
                    style={{
                      width: `${
                        applicationStats.total
                          ? (applicationStats.review /
                              applicationStats.total) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-slate-500">
                    Interviews
                  </span>

                  <span className="font-semibold text-slate-800">
                    {applicationStats.interviews}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-violet-500"
                    style={{
                      width: `${
                        applicationStats.total
                          ? (applicationStats.interviews /
                              applicationStats.total) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-slate-500">
                    Accepted
                  </span>

                  <span className="font-semibold text-slate-800">
                    {applicationStats.accepted}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{
                      width: `${
                        applicationStats.total
                          ? (applicationStats.accepted /
                              applicationStats.total) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-slate-500">
                    Rejected
                  </span>

                  <span className="font-semibold text-slate-800">
                    {applicationStats.rejected}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-red-500"
                    style={{
                      width: `${
                        applicationStats.total
                          ? (applicationStats.rejected /
                              applicationStats.total) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Company */}
          <Card>
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Building2 size={20} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-400">
                    Posted By
                  </p>

                  <p className="truncate font-bold text-slate-900">
                    {job.company?.name || "Your Company"}
                  </p>

                  {job.company?.industry && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      {job.company.industry}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex gap-3">
              <Trash2
                size={20}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <div>
                <h3 className="font-bold text-red-800">
                  Delete Job
                </h3>

                <p className="mt-1 text-sm leading-5 text-red-700">
                  Permanently remove this job posting.
                </p>

                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="btn btn-sm mt-3 border-red-300 bg-white text-red-600 hover:bg-red-100"
                >
                  Delete Job
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Delete this job?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This action cannot be undone. The job posting will
              be permanently removed.
            </p>

            <div className="modal-action">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="btn btn-outline border-slate-300 text-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
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

          <form method="dialog" className="modal-backdrop">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
            >
              close
            </button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default RecruiterJobDetails;