import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Video,
  User,
  BriefcaseBusiness,
  MapPin,
  Mail,
  CheckCircle2,
  XCircle,
  PlayCircle,
  FileText,
  ExternalLink,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
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

const RecruiterInterviewDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);

  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchInterview = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/recruiter/interviews/${id}`
      );

      const data =
        response.data?.interview ||
        response.data?.data ||
        null;

      if (!data) {
        throw new Error("Interview not found.");
      }

      setInterview(data);
      setStatus(data.status || "SCHEDULED");
      setNotes(data.notes || "");
    } catch (err) {
      console.error("Interview details error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load interview."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterview();
  }, [id]);

  const handleStatusUpdate = async (newStatus = status) => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.put(
        `/recruiter/interviews/${id}/status`,
        {
          status: newStatus,
          notes,
        }
      );

      const updatedInterview =
        response.data?.interview ||
        response.data?.data ||
        null;

      if (updatedInterview) {
        setInterview(updatedInterview);
        setStatus(updatedInterview.status);
        setNotes(updatedInterview.notes || "");
      } else {
        setInterview((prev) => ({
          ...prev,
          status: newStatus,
          notes,
        }));
      }

      setSuccess("Interview updated successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Update interview error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update interview."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    await handleStatusUpdate(status);
  };

  const canJoin =
    interview &&
    interview.status !== "CANCELLED" &&
    interview.status !== "COMPLETED";

  const candidate = interview?.candidate;
  const job = interview?.job;

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Interview Details"
          description="View and manage interview information."
        />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="h-56 animate-pulse rounded-2xl bg-white" />
            <div className="h-72 animate-pulse rounded-2xl bg-white" />
          </div>

          <div className="h-[450px] animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  if (error && !interview) {
    return (
      <div>
        <PageHeader
          title="Interview Details"
          description="View and manage interview information."
        />

        <Card>
          <div className="p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertCircle size={26} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Interview not found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>

            <Link
              to="/recruiter/interviews"
              className="btn btn-primary mt-5 gap-2"
            >
              <ArrowLeft size={17} />
              Back to Interviews
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Interview Details"
        description="Manage the candidate interview and meeting status."
        action={
          <Link
            to="/recruiter/interviews"
            className="btn btn-outline gap-2 border-slate-300 text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <ArrowLeft size={17} />
            Back to Interviews
          </Link>
        }
      />

      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          <CheckCircle2 size={19} />
          {success}
        </div>
      )}

      {error && interview && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 xl:col-span-2">
          {/* Interview Hero */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 text-white shadow-sm">
            <div className="p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur">
                    {candidate?.name
                      ?.charAt(0)
                      ?.toUpperCase() || "U"}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
                      Video Interview
                    </p>

                    <h1 className="mt-1 text-2xl font-bold md:text-3xl">
                      {candidate?.name || "Candidate"}
                    </h1>

                    <p className="mt-1 text-sm text-indigo-100">
                      {job?.title || "Job Position"}
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

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                  <CalendarDays size={19} />

                  <p className="mt-3 text-xs text-indigo-200">
                    Date
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatDate(interview.scheduledAt)}
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                  <Clock3 size={19} />

                  <p className="mt-3 text-xs text-indigo-200">
                    Time
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatTime(interview.scheduledAt)}
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                  <Video size={19} />

                  <p className="mt-3 text-xs text-indigo-200">
                    Duration
                  </p>

                  <p className="mt-1 font-semibold">
                    {interview.duration || 30} minutes
                  </p>
                </div>
              </div>

              {canJoin && (
                <Link
                  to={`/interview-room/${interview._id}`}
                  className="btn mt-6 w-full gap-2 border-0 bg-white text-indigo-700 hover:bg-indigo-50 md:w-auto"
                >
                  <Video size={18} />
                  Join Interview
                </Link>
              )}
            </div>
          </div>

          {/* Candidate */}
          <Card>
            <div className="border-b border-slate-200 p-5 md:p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                  <User size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Candidate Information
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Details of the candidate attending the interview.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2 md:p-6">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-400">
                  Full Name
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {candidate?.name || "N/A"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-400">
                  Email
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <Mail
                    size={15}
                    className="text-slate-400"
                  />

                  <p className="truncate font-semibold text-slate-800">
                    {candidate?.email || "N/A"}
                  </p>
                </div>
              </div>

              {candidate?.phone && (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-400">
                    Phone
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {candidate.phone}
                  </p>
                </div>
              )}

              {candidate?.skills?.length > 0 && (
                <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2">
                  <p className="text-xs text-slate-400">
                    Skills
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {candidate.skills.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Job */}
          <Card>
            <div className="border-b border-slate-200 p-5 md:p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                  <BriefcaseBusiness size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Job Information
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Position associated with this interview.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 md:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <BriefcaseBusiness size={21} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-900">
                    {job?.title || "Job Position"}
                  </h3>

                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {job?.location || "Remote"}
                    </span>

                    {job?.jobType && (
                      <span>
                        {job.jobType.replace(
                          /_/g,
                          " "
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {interview.application && (
                <Link
                  to={`/recruiter/applications/${
                    interview.application._id ||
                    interview.application
                  }`}
                  className="btn btn-outline mt-5 gap-2 border-slate-300 text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <FileText size={16} />
                  View Application
                </Link>
              )}
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <div className="border-b border-slate-200 p-5 md:p-6">
              <h2 className="font-bold text-slate-900">
                Interview Notes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add internal notes about the interview.
              </p>
            </div>

            <div className="p-5 md:p-6">
              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                rows={5}
                placeholder="Add interview notes..."
                className="textarea textarea-bordered w-full border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:outline-none"
              />

              <button
                onClick={handleSaveNotes}
                disabled={saving}
                className="btn btn-primary mt-4 gap-2"
              >
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Save Notes
                  </>
                )}
              </button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Meeting Card */}
          <Card className="overflow-hidden">
            <div className="bg-slate-900 p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-2.5">
                  <Video size={20} />
                </div>

                <div>
                  <h2 className="font-bold">
                    Video Meeting
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    ZEGOCLOUD powered room
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="text-xs text-slate-400">
                  Room ID
                </p>

                <p className="mt-1 break-all rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-700">
                  {interview.roomId || "Generated automatically"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Scheduled For
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {formatDateTime(
                    interview.scheduledAt
                  )}
                </p>
              </div>

              {canJoin ? (
                <Link
                  to={`/interview-room/${interview._id}`}
                  className="btn btn-primary w-full gap-2"
                >
                  <Video size={17} />
                  Join Meeting
                </Link>
              ) : (
                <button
                  disabled
                  className="btn w-full gap-2"
                >
                  {interview.status === "COMPLETED" ? (
                    <>
                      <CheckCircle2 size={17} />
                      Interview Completed
                    </>
                  ) : (
                    <>
                      <XCircle size={17} />
                      Interview Cancelled
                    </>
                  )}
                </button>
              )}
            </div>
          </Card>

          {/* Status */}
          <Card>
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-bold text-slate-900">
                Interview Status
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Update the current interview state.
              </p>
            </div>

            <div className="space-y-4 p-5">
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className="select select-bordered w-full border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:outline-none"
              >
                <option value="SCHEDULED">
                  Scheduled
                </option>

                <option value="ONGOING">
                  Ongoing
                </option>

                <option value="COMPLETED">
                  Completed
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>
              </select>

              <button
                onClick={() =>
                  handleStatusUpdate(status)
                }
                disabled={saving}
                className="btn btn-primary w-full gap-2"
              >
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Update Status
                  </>
                )}
              </button>
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <div className="p-5">
              <h2 className="font-bold text-slate-900">
                Interview Timeline
              </h2>

              <div className="mt-5 space-y-5">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <CalendarDays size={15} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Interview Scheduled
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDateTime(
                        interview.createdAt
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Video size={15} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Meeting Room Created
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Secure ZEGOCLOUD room
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <ShieldCheck size={15} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Current Status
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {interview.status?.replace(
                        /_/g,
                        " "
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-3">
            <Link
              to={`/recruiter/applications/${
                interview.application?._id ||
                interview.application ||
                ""
              }`}
              className="btn btn-outline w-full gap-2 border-slate-300 text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <FileText size={16} />
              View Application
            </Link>

            <Link
              to="/recruiter/interviews"
              className="btn btn-ghost w-full gap-2 text-slate-600"
            >
              <ArrowLeft size={16} />
              All Interviews
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterInterviewDetails;