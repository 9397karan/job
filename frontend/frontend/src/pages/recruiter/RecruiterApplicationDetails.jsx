import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Mail,
  MapPin,
  Phone,
  User,
  Video,
  XCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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

const RecruiterApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);

  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/recruiter/applications/${id}`
      );

      const data =
        response.data?.application ||
        response.data?.data ||
        null;

      if (!data) {
        throw new Error("Application not found.");
      }

      setApplication(data);
      setStatus(data.status || "APPLIED");
      setNotes(data.notes || "");
    } catch (err) {
      console.error(
        "Recruiter application details error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load application."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!status) return;

    try {
      setUpdating(true);
      setError("");
      setMessage("");

      const response = await api.put(
        `/recruiter/applications/${id}/status`,
        {
          status,
          notes,
        }
      );

      const updatedApplication =
        response.data?.application ||
        response.data?.data ||
        null;

      if (updatedApplication) {
        setApplication(updatedApplication);
        setStatus(
          updatedApplication.status || status
        );
        setNotes(updatedApplication.notes || notes);
      } else {
        await fetchApplication();
      }

      setMessage("Application status updated successfully.");
    } catch (err) {
      console.error("Status update error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update application status."
      );
    } finally {
      setUpdating(false);
    }
  };

  const interview = useMemo(() => {
    if (!application) return null;

    return (
      application.interview ||
      application.relatedInterview ||
      null
    );
  }, [application]);

  const timeline = useMemo(() => {
    const currentStatus = application?.status;

    const stages = [
      {
        key: "APPLIED",
        label: "Application Submitted",
        description: "Candidate applied for this position.",
        date:
          application?.appliedAt ||
          application?.createdAt,
        icon: FileText,
      },
      {
        key: "UNDER_REVIEW",
        label: "Under Review",
        description: "Application is being reviewed.",
        date: application?.reviewedAt,
        icon: Clock3,
      },
      {
        key: "INTERVIEW_SCHEDULED",
        label: "Interview Scheduled",
        description: "Candidate has been invited for an interview.",
        date: interview?.scheduledAt,
        icon: Video,
      },
      {
        key: "ACCEPTED",
        label: "Accepted",
        description: "Candidate has been selected.",
        date: null,
        icon: CheckCircle2,
      },
    ];

    if (currentStatus === "REJECTED") {
      stages.push({
        key: "REJECTED",
        label: "Application Rejected",
        description: "Application was not selected.",
        date: application?.reviewedAt,
        icon: XCircle,
      });
    }

    const order = {
      APPLIED: 0,
      UNDER_REVIEW: 1,
      INTERVIEW_SCHEDULED: 2,
      ACCEPTED: 3,
      REJECTED: 3,
    };

    return stages.map((stage) => ({
      ...stage,
      completed:
        currentStatus === "REJECTED"
          ? stage.key === "APPLIED" ||
            stage.key === "REJECTED"
          : order[stage.key] <= order[currentStatus],
      active: stage.key === currentStatus,
    }));
  }, [application, interview]);

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Application Details"
          description="Review candidate information."
        />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="h-52 animate-pulse rounded-2xl bg-white" />
            <div className="h-72 animate-pulse rounded-2xl bg-white" />
            <div className="h-72 animate-pulse rounded-2xl bg-white" />
          </div>

          <div className="h-[500px] animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  if (error && !application) {
    return (
      <div>
        <PageHeader
          title="Application Details"
          description="Review candidate information."
        />

        <Card>
          <div className="p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertCircle size={25} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Unable to load application
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>

            <Link
              to="/recruiter/applications"
              className="btn btn-primary mt-5 gap-2"
            >
              <ArrowLeft size={17} />
              Back to Applications
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const candidate = application.applicant;
  const job = application.job;

  return (
    <div>
      <PageHeader
        title="Application Details"
        description="Review the candidate and manage their application."
        action={
          <Link
            to="/recruiter/applications"
            className="btn btn-outline gap-2 border-slate-300 text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <ArrowLeft size={17} />
            Back to Applications
          </Link>
        }
      />

      {/* Alerts */}
      {message && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Candidate Header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 p-6 text-white md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl font-bold backdrop-blur">
              {candidate?.name
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold">
                    {candidate?.name || "Candidate"}
                  </h1>

                  <p className="mt-1 text-indigo-100">
                    {candidate?.email || "Email unavailable"}
                  </p>
                </div>

                <Badge variant={getStatusVariant(status)}>
                  {status?.replace(/_/g, " ")}
                </Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-indigo-100">
                <span className="flex items-center gap-1.5">
                  <BriefcaseBusiness size={15} />
                  {job?.title || "Job Position"}
                </span>

                <span className="flex items-center gap-1.5">
                  <MapPin size={15} />
                  {job?.location || "Remote"}
                </span>

                <span className="flex items-center gap-1.5">
                  <CalendarDays size={15} />
                  Applied{" "}
                  {formatDate(application.appliedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 xl:col-span-2">
          {/* Candidate Contact */}
          <Card>
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-bold text-slate-900">
                Candidate Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Contact and profile information.
              </p>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                    <Mail size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">
                      Email
                    </p>

                    <a
                      href={`mailto:${candidate?.email || ""}`}
                      className="mt-1 block truncate text-sm font-semibold text-slate-800 hover:text-indigo-600"
                    >
                      {candidate?.email || "Not available"}
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                    <Phone size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">
                      Phone
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {candidate?.phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
                    <User size={17} />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Professional Summary
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {candidate?.bio ||
                        "No professional summary provided."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Skills */}
          <Card>
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-bold text-slate-900">
                Skills
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Skills listed in the candidate profile.
              </p>
            </div>

            <div className="p-5">
              {candidate?.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
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
                  No skills listed.
                </p>
              )}
            </div>
          </Card>

          {/* Education */}
          {candidate?.education && (
            <Card>
              <div className="border-b border-slate-200 p-5">
                <h2 className="font-bold text-slate-900">
                  Education
                </h2>
              </div>

              <div className="p-5">
                <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                  {candidate.education}
                </p>
              </div>
            </Card>
          )}

          {/* Experience */}
          {candidate?.experience && (
            <Card>
              <div className="border-b border-slate-200 p-5">
                <h2 className="font-bold text-slate-900">
                  Experience
                </h2>
              </div>

              <div className="p-5">
                <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                  {candidate.experience}
                </p>
              </div>
            </Card>
          )}

          {/* Resume */}
          <Card>
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">
                    Resume
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Candidate's submitted resume.
                  </p>
                </div>

                <FileText
                  size={21}
                  className="text-indigo-600"
                />
              </div>
            </div>

            <div className="p-5">
              {application.resumeUrl ||
              candidate?.resumeUrl ? (
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-500">
                    <FileText size={20} />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">
                      Candidate Resume
                    </p>

                    <p className="text-xs text-slate-500">
                      PDF resume submitted with this application.
                    </p>
                  </div>

                  <a
                    href={
                      application.resumeUrl ||
                      candidate.resumeUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-primary gap-2"
                  >
                    <ExternalLink size={15} />
                    Open Resume
                  </a>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                  <FileText
                    size={28}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-2 font-semibold text-slate-700">
                    No resume available
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    This candidate has not submitted a resume.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Cover Letter */}
          <Card>
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-bold text-slate-900">
                Cover Letter
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Message submitted by the candidate.
              </p>
            </div>

            <div className="p-5">
              {application.coverLetter ? (
                <div className="rounded-xl bg-slate-50 p-5">
                  <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                    {application.coverLetter}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  No cover letter was submitted.
                </p>
              )}
            </div>
          </Card>

          {/* Application Timeline */}
          <Card>
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-bold text-slate-900">
                Application Timeline
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track the candidate's progress.
              </p>
            </div>

            <div className="p-5">
              <div className="space-y-0">
                {timeline.map((item, index) => {
                  const Icon = item.icon;
                  const last = index === timeline.length - 1;

                  return (
                    <div
                      key={item.key}
                      className="flex gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            item.active
                              ? "bg-indigo-600 text-white"
                              : item.completed
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          <Icon size={16} />
                        </div>

                        {!last && (
                          <div
                            className={`h-14 w-px ${
                              item.completed
                                ? "bg-emerald-200"
                                : "bg-slate-200"
                            }`}
                          />
                        )}
                      </div>

                      <div className="pb-6">
                        <p
                          className={`text-sm font-semibold ${
                            item.active
                              ? "text-indigo-700"
                              : "text-slate-800"
                          }`}
                        >
                          {item.label}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.description}
                        </p>

                        {item.date && (
                          <p className="mt-1 text-xs text-slate-400">
                            {formatDateTime(item.date)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-bold text-slate-900">
                Manage Application
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Update the candidate's current status.
              </p>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Application Status
                </label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                  className="select select-bordered w-full border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:outline-none"
                >
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

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Recruiter Notes
                </label>

                <textarea
                  value={notes}
                  onChange={(e) =>
                    setNotes(e.target.value)
                  }
                  rows={5}
                  placeholder="Add private notes about this candidate..."
                  className="textarea textarea-bordered w-full border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleStatusUpdate}
                disabled={updating}
                className="btn btn-primary w-full gap-2"
              >
                {updating ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    Update Application
                  </>
                )}
              </button>
            </div>
          </Card>

          {/* Interview */}
          {status === "INTERVIEW_SCHEDULED" || interview ? (
            <Card>
              <div className="border-b border-slate-200 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                    <Video size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Interview
                    </h2>

                    <p className="text-sm text-slate-500">
                      Interview information.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {interview ? (
                  <>
                    <div className="space-y-3">
                      <div className="rounded-xl bg-violet-50 p-4">
                        <p className="text-xs text-violet-500">
                          Scheduled For
                        </p>

                        <p className="mt-1 font-semibold text-violet-900">
                          {formatDateTime(
                            interview.scheduledAt
                          )}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-200 p-3">
                          <p className="text-xs text-slate-400">
                            Duration
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {interview.duration || 30} min
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-3">
                          <p className="text-xs text-slate-400">
                            Status
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {interview.status || "SCHEDULED"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                      <Link
                        to={`/interview-room/${interview._id}`}
                        className="btn btn-primary w-full gap-2"
                      >
                        <Video size={17} />
                        Join Interview
                      </Link>

                      <Link
                        to={`/recruiter/interviews/${interview._id}`}
                        className="btn btn-outline w-full gap-2 border-slate-300 text-slate-700"
                      >
                        View Interview Details
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm leading-6 text-slate-500">
                      The application is marked as interview
                      scheduled, but interview details are not
                      available yet.
                    </p>

                    <Link
                      to={`/recruiter/interviews/schedule?applicationId=${application._id}`}
                      className="btn btn-primary mt-4 w-full gap-2"
                    >
                      <CalendarDays size={17} />
                      Schedule Interview
                    </Link>
                  </>
                )}
              </div>
            </Card>
          ) : (
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-5">
              <div className="flex gap-3">
                <div className="rounded-xl bg-white p-2.5 text-indigo-600 shadow-sm">
                  <Video size={19} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Ready for an Interview?
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    If this candidate is ready for the next
                    stage, schedule a video interview.
                  </p>

                  <Link
                    to={`/recruiter/interviews/schedule?applicationId=${application._id}`}
                    className="btn btn-primary btn-sm mt-4 gap-2"
                  >
                    <CalendarDays size={15} />
                    Schedule Interview
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Job */}
          <Card>
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-bold text-slate-900">
                Applied Job
              </h2>
            </div>

            <div className="p-5">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <BriefcaseBusiness size={20} />
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">
                    {job?.title || "Job Position"}
                  </p>

                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={12} />
                    {job?.location || "Remote"}
                  </p>
                </div>
              </div>

              <Link
                to={`/recruiter/jobs/${job?._id}`}
                className="btn btn-outline btn-sm mt-4 w-full gap-2 border-slate-300 text-slate-700"
              >
                <ExternalLink size={15} />
                View Job
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RecruiterApplicationDetails;