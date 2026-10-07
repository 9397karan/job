import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";

const ScheduleInterview = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const applicationId = searchParams.get("applicationId");

  const [application, setApplication] = useState(null);

  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState("30");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchApplication = async () => {
    if (!applicationId) {
      setError("Application ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/recruiter/applications/${applicationId}`
      );

      const data =
        response.data?.application ||
        response.data?.data ||
        null;

      if (!data) {
        throw new Error("Application not found.");
      }

      setApplication(data);
    } catch (err) {
      console.error("Fetch application error:", err);

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
  }, [applicationId]);

  const getMinimumDateTime = () => {
    const now = new Date();

    const offset = now.getTimezoneOffset();
    const localDate = new Date(
      now.getTime() - offset * 60 * 1000
    );

    return localDate.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!applicationId) {
      setError("Application ID is missing.");
      return;
    }

    if (!scheduledAt) {
      setError("Please select an interview date and time.");
      return;
    }

    const selectedDate = new Date(scheduledAt);

    if (selectedDate <= new Date()) {
      setError(
        "Interview date and time must be in the future."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const response = await api.post(
        "/recruiter/interviews",
        {
          applicationId,
          scheduledAt: selectedDate.toISOString(),
          duration: Number(duration),
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to schedule interview."
        );
      }

      setSuccess(
        "Interview scheduled successfully. The candidate has been notified."
      );

      setTimeout(() => {
        navigate(
          `/recruiter/interviews/${response.data.interview._id}`
        );
      }, 900);
    } catch (err) {
      console.error("Schedule interview error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to schedule interview."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Schedule Interview"
          description="Create a video interview with the candidate."
        />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="h-64 animate-pulse rounded-2xl bg-white" />
            <div className="h-80 animate-pulse rounded-2xl bg-white" />
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
          title="Schedule Interview"
          description="Create a video interview with the candidate."
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

  const candidate = application?.applicant;
  const job = application?.job;

  return (
    <div>
      <PageHeader
        title="Schedule Interview"
        description="Set up a secure video interview with the candidate."
        action={
          <Link
            to={`/recruiter/applications/${applicationId}`}
            className="btn btn-outline gap-2 border-slate-300 text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <ArrowLeft size={17} />
            Back to Application
          </Link>
        }
      />

      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          <CheckCircle2 size={19} />
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          <AlertCircle size={19} />
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 xl:col-span-2">
          {/* Candidate */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 p-6 text-white">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur">
                  {candidate?.name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
                    Interview Candidate
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {candidate?.name || "Candidate"}
                  </h2>

                  <p className="mt-1 text-sm text-indigo-100">
                    {candidate?.email || "Email unavailable"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                    <BriefcaseBusiness size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">
                      Position
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                      {job?.title || "Job Position"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                    <MapPin size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">
                      Location
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                      {job?.location || "Remote"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
                    <Mail size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">
                      Candidate Email
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                      {candidate?.email || "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                    <CalendarDays size={17} />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Applied On
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {application?.appliedAt
                        ? new Date(
                            application.appliedAt
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Schedule Form */}
          <Card>
            <div className="border-b border-slate-200 p-5 md:p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                  <CalendarDays size={21} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Interview Schedule
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Choose when the video interview will take place.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-5 md:p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Interview Date & Time
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={18}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      min={getMinimumDateTime()}
                      onChange={(e) =>
                        setScheduledAt(e.target.value)
                      }
                      className="input input-bordered w-full border-slate-300 bg-white pl-10 text-slate-900 focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Select a future date and time.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Duration
                  </label>

                  <div className="relative">
                    <Clock3
                      size={18}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      value={duration}
                      onChange={(e) =>
                        setDuration(e.target.value)
                      }
                      className="select select-bordered w-full border-slate-300 bg-white pl-10 text-slate-900 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                    </select>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Recommended duration: 30–60 minutes.
                  </p>
                </div>
              </div>

              {/* Meeting Type */}
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    <Video size={21} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      ZEGOCLOUD Video Interview
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      A private video interview room will be
                      automatically created for this application.
                      Both the recruiter and candidate can join
                      using the generated interview link.
                    </p>
                  </div>
                </div>
              </div>

              {/* Confirmation */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex gap-3">
                  <ShieldCheck
                    size={19}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Before scheduling
                    </p>

                    <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
                      <li>
                        • The candidate will receive an interview
                        notification.
                      </li>
                      <li>
                        • A unique video interview room will be
                        created.
                      </li>
                      <li>
                        • The application status will become
                        "Interview Scheduled".
                      </li>
                      <li>
                        • The candidate can join from their
                        Interviews page.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <Link
                  to={`/recruiter/applications/${applicationId}`}
                  className="btn btn-outline border-slate-300 text-slate-700"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary gap-2 sm:min-w-52"
                >
                  {submitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <CalendarDays size={17} />
                      Schedule Interview
                    </>
                  )}
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Preview Sidebar */}
        <div className="space-y-6">
          <Card>
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-bold text-slate-900">
                Interview Preview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review the meeting details before scheduling.
              </p>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Candidate
                </p>

                <div className="mt-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                    {candidate?.name
                      ?.charAt(0)
                      ?.toUpperCase() || "U"}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {candidate?.name || "Candidate"}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {candidate?.email || "Email unavailable"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex gap-3">
                  <BriefcaseBusiness
                    size={18}
                    className="mt-0.5 text-indigo-600"
                  />

                  <div>
                    <p className="text-xs text-slate-400">
                      Position
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {job?.title || "Job Position"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex gap-3">
                  <CalendarDays
                    size={18}
                    className="mt-0.5 text-indigo-600"
                  />

                  <div>
                    <p className="text-xs text-slate-400">
                      Date & Time
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {scheduledAt
                        ? new Date(
                            scheduledAt
                          ).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Not selected"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex gap-3">
                  <Clock3
                    size={18}
                    className="mt-0.5 text-indigo-600"
                  />

                  <div>
                    <p className="text-xs text-slate-400">
                      Duration
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {duration} minutes
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
                <div className="flex gap-3">
                  <Video
                    size={19}
                    className="mt-0.5 text-violet-600"
                  />

                  <div>
                    <p className="font-semibold text-violet-900">
                      Video Interview
                    </p>

                    <p className="mt-1 text-xs leading-5 text-violet-700">
                      Powered by ZEGOCLOUD. The room is created
                      automatically after scheduling.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Tips */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <Clock3 size={19} />
              </div>

              <h3 className="font-bold text-slate-900">
                Interview Tips
              </h3>
            </div>

            <ul className="mt-4 space-y-3 text-sm leading-5 text-slate-500">
              <li className="flex gap-2">
                <span className="text-indigo-500">•</span>
                Allow enough time between interviews.
              </li>

              <li className="flex gap-2">
                <span className="text-indigo-500">•</span>
                Choose a time convenient for the candidate.
              </li>

              <li className="flex gap-2">
                <span className="text-indigo-500">•</span>
                Keep the interview focused on the job
                requirements.
              </li>

              <li className="flex gap-2">
                <span className="text-indigo-500">•</span>
                Test your camera and microphone before joining.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleInterview;