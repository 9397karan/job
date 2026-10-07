import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  MapPin,
  MessageSquare,
  Video,
  XCircle,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../services/api";

import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";


const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/applications/${id}`
      );

      setApplication(
        response.data.application ||
          response.data.data
      );
    } catch (error) {
      console.error(
        "Application details error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load application."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  /* =========================================================
     HELPERS
  ========================================================= */

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

  const formatDateTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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
        (letter) =>
          letter.toUpperCase()
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

      default:
        return "neutral";
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">

        <div className="text-center">

          <Loader2
            size={38}
            className="mx-auto animate-spin text-primary"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading application...
          </p>

        </div>

      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !application) {
    return (
      <div className="mx-auto max-w-3xl py-16">

        <Card className="border-slate-200 bg-white text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <FileText size={26} />
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Application not found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              "We couldn't find this application."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/job-seeker/applications")
            }
            className="btn btn-primary mt-6"
          >
            Back to Applications
          </button>

        </Card>

      </div>
    );
  }

  const job = application.job || {};
  const company = job.company || {};

  const status =
    application.status || "APPLIED";

  const interview =
    application.interview ||
    application.relatedInterview ||
    null;

  const isInterview =
    status === "INTERVIEW_SCHEDULED";

  const isAccepted =
    status === "ACCEPTED";

  const isRejected =
    status === "REJECTED";


  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* =====================================================
          BACK
      ===================================================== */}

      <button
        type="button"
        onClick={() =>
          navigate("/job-seeker/applications")
        }
        className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary"
      >
        <ArrowLeft
          size={17}
          className="transition-transform group-hover:-translate-x-0.5"
        />

        Back to Applications
      </button>


      {/* =====================================================
          HEADER
      ===================================================== */}

      <Card className="overflow-hidden border-slate-200 bg-white p-0">

        <div className="h-2 bg-gradient-to-r from-primary via-indigo-500 to-violet-500" />

        <div className="p-5 md:p-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-start">

            {/* Company logo */}

            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-indigo-50 text-indigo-600">

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
                  size={30}
                />
              )}

            </div>


            {/* Job information */}

            <div className="min-w-0 flex-1">

              <div className="flex flex-col gap-3">

                <Badge
                  variant={getStatusVariant(
                    status
                  )}
                  className="w-fit"
                >
                  {formatStatus(status)}
                </Badge>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  {job.title ||
                    "Job Application"}
                </h1>

                <p className="text-base font-semibold text-slate-600">
                  {company.name ||
                    "Company"}
                </p>

              </div>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">

                <span className="flex items-center gap-1.5">
                  <MapPin size={16} />
                  {job.location ||
                    "Location not specified"}
                </span>

                <span className="flex items-center gap-1.5">
                  <CalendarDays size={16} />
                  Applied{" "}
                  {formatDate(
                    application.appliedAt
                  )}
                </span>

              </div>

            </div>


            {/* Job action */}

            <Link
              to={`/job-seeker/jobs/${job._id}`}
              className="btn btn-outline gap-2"
            >
              View Job

              <ArrowRight size={16} />
            </Link>

          </div>

        </div>

      </Card>


      {/* =====================================================
          STATUS BANNER
      ===================================================== */}

      {isInterview && (
        <div className="overflow-hidden rounded-2xl border border-blue-200 bg-blue-50">

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Video size={19} />
              </div>

              <div>

                <h3 className="font-bold text-blue-900">
                  Interview Scheduled
                </h3>

                <p className="mt-1 text-sm text-blue-700">
                  Your application has progressed
                  to the interview stage.
                </p>

              </div>

            </div>

            <Link
              to="/job-seeker/interviews"
              className="btn btn-primary btn-sm gap-2"
            >
              View Interview

              <ArrowRight size={15} />
            </Link>

          </div>

        </div>
      )}


      {isAccepted && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

          <div className="flex items-start gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>

            <div>

              <h3 className="font-bold text-emerald-900">
                Application Accepted
              </h3>

              <p className="mt-1 text-sm text-emerald-700">
                Congratulations! The recruiter
                has accepted your application.
              </p>

            </div>

          </div>

        </div>
      )}


      {isRejected && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

          <div className="flex items-start gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <XCircle size={20} />
            </div>

            <div>

              <h3 className="font-bold text-red-900">
                Application Not Selected
              </h3>

              <p className="mt-1 text-sm text-red-700">
                This application was not selected
                for the position.
              </p>

            </div>

          </div>

        </div>
      )}


      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

        {/* =================================================
            LEFT
        ================================================= */}

        <div className="space-y-6">

          {/* Application timeline */}

          <Card className="border-slate-200 bg-white">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Application Progress
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Track the progress of your
                  application.
                </p>
              </div>

              <FileText
                size={20}
                className="text-primary"
              />

            </div>

            <ApplicationTimeline
              application={application}
            />

          </Card>


          {/* Cover Letter */}

          <Card className="border-slate-200 bg-white">

            <div className="flex items-center gap-2">

              <MessageSquare
                size={19}
                className="text-primary"
              />

              <h2 className="text-lg font-bold text-slate-900">
                Cover Letter
              </h2>

            </div>

            {application.coverLetter ? (
              <div className="mt-5 rounded-xl bg-slate-50 p-5">

                <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                  {application.coverLetter}
                </p>

              </div>
            ) : (
              <p className="mt-5 text-sm text-slate-400">
                No cover letter was submitted
                with this application.
              </p>
            )}

          </Card>


          {/* Recruiter Notes */}

          {application.notes && (
            <Card className="border-slate-200 bg-white">

              <div className="flex items-center gap-2">

                <MessageSquare
                  size={19}
                  className="text-primary"
                />

                <h2 className="text-lg font-bold text-slate-900">
                  Recruiter Notes
                </h2>

              </div>

              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">

                <p className="text-sm leading-6 text-amber-800">
                  {application.notes}
                </p>

              </div>

            </Card>
          )}

        </div>


        {/* =================================================
            RIGHT
        ================================================= */}

        <aside className="space-y-6">

          {/* Application summary */}

          <Card className="border-slate-200 bg-white">

            <h2 className="text-lg font-bold text-slate-900">
              Application Details
            </h2>

            <div className="mt-5 space-y-4">

              <DetailRow
                label="Status"
                value={
                  <Badge
                    variant={getStatusVariant(
                      status
                    )}
                  >
                    {formatStatus(status)}
                  </Badge>
                }
              />

              <DetailRow
                label="Applied On"
                value={formatDate(
                  application.appliedAt
                )}
              />

              <DetailRow
                label="Last Updated"
                value={formatDate(
                  application.reviewedAt ||
                    application.appliedAt
                )}
              />

              <DetailRow
                label="Application ID"
                value={
                  <span className="font-mono text-xs">
                    {application._id}
                  </span>
                }
              />

            </div>

          </Card>


          {/* Resume */}

          <Card className="border-slate-200 bg-white">

            <h2 className="text-lg font-bold text-slate-900">
              Submitted Resume
            </h2>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <FileText size={19} />
                </div>

                <div className="min-w-0">

                  <p className="text-sm font-semibold text-slate-700">
                    Resume.pdf
                  </p>

                  <p className="text-xs text-slate-400">
                    Submitted with application
                  </p>

                </div>

              </div>

              {application.resumeUrl && (
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm mt-4 w-full"
                >
                  View Resume
                </a>
              )}

            </div>

          </Card>


          {/* Interview */}

          {interview && (
            <Card className="border-blue-200 bg-blue-50">

              <div className="flex items-center gap-2">

                <Video
                  size={19}
                  className="text-blue-600"
                />

                <h2 className="font-bold text-blue-900">
                  Interview
                </h2>

              </div>

              <div className="mt-4 space-y-3">

                {interview.scheduledAt && (
                  <div className="flex items-center gap-3">

                    <CalendarDays
                      size={16}
                      className="text-blue-600"
                    />

                    <div>

                      <p className="text-xs text-blue-600">
                        Scheduled
                      </p>

                      <p className="text-sm font-semibold text-blue-900">
                        {formatDateTime(
                          interview.scheduledAt
                        )}
                      </p>

                    </div>

                  </div>
                )}

                {interview.duration && (
                  <div className="flex items-center gap-3">

                    <Clock3
                      size={16}
                      className="text-blue-600"
                    />

                    <div>

                      <p className="text-xs text-blue-600">
                        Duration
                      </p>

                      <p className="text-sm font-semibold text-blue-900">
                        {interview.duration}{" "}
                        minutes
                      </p>

                    </div>

                  </div>
                )}

              </div>

              <Link
                to={`/interview-room/${interview._id}`}
                className="btn btn-primary mt-5 w-full gap-2"
              >
                <Video size={16} />
                Join Interview
              </Link>

            </Card>
          )}

        </aside>

      </div>

    </div>
  );
};


/* =========================================================
   APPLICATION TIMELINE
========================================================= */

const ApplicationTimeline = ({
  application,
}) => {
  const status =
    application.status || "APPLIED";

  const steps = [
    {
      key: "APPLIED",
      title: "Application Submitted",
      description:
        "Your application was successfully submitted.",
      date: application.appliedAt,
      icon: FileText,
    },

    {
      key: "UNDER_REVIEW",
      title: "Under Review",
      description:
        "The recruiter is reviewing your application.",
      date: application.reviewedAt,
      icon: Clock3,
    },

    {
      key: "INTERVIEW_SCHEDULED",
      title: "Interview",
      description:
        "An interview has been scheduled.",
      date: application.reviewedAt,
      icon: Video,
    },

    {
      key: "ACCEPTED",
      title: "Accepted",
      description:
        "Your application has been accepted.",
      date: application.reviewedAt,
      icon: CheckCircle2,
    },
  ];

  const statusOrder = {
    APPLIED: 1,
    UNDER_REVIEW: 2,
    INTERVIEW_SCHEDULED: 3,
    ACCEPTED: 4,
    REJECTED: 4,
  };

  const currentOrder =
    statusOrder[status] || 1;

  return (
    <div className="mt-7">

      {steps.map((step, index) => {
        const StepIcon = step.icon;

        const stepOrder =
          statusOrder[step.key];

        const completed =
          currentOrder >= stepOrder;

        const current =
          status === step.key;

        const rejected =
          status === "REJECTED" &&
          step.key ===
            "INTERVIEW_SCHEDULED";

        return (
          <div
            key={step.key}
            className="relative flex gap-4"
          >

            {/* Connector */}

            {index <
              steps.length - 1 && (
              <div
                className={`
                  absolute
                  left-[18px]
                  top-10
                  h-[calc(100%-8px)]
                  w-px
                  ${
                    completed
                      ? "bg-primary"
                      : "bg-slate-200"
                  }
                `}
              />
            )}

            {/* Icon */}

            <div
              className={`
                relative z-10
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-full
                border
                ${
                  current
                    ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                    : completed
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-slate-200 bg-white text-slate-400"
                }
              `}
            >
              <StepIcon size={16} />
            </div>

            {/* Content */}

            <div
              className={`
                min-w-0
                ${
                  index <
                  steps.length - 1
                    ? "pb-8"
                    : ""
                }
              `}
            >

              <div className="flex flex-wrap items-center gap-2">

                <h3
                  className={`
                    text-sm font-semibold
                    ${
                      completed
                        ? "text-slate-900"
                        : "text-slate-400"
                    }
                  `}
                >
                  {step.title}
                </h3>

                {current && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    CURRENT
                  </span>
                )}

              </div>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {status ===
                  "REJECTED" &&
                step.key ===
                  "ACCEPTED"
                  ? "The application was not selected."
                  : step.description}
              </p>

              {step.date &&
                completed && (
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                    <CalendarDays
                      size={12}
                    />
                    {new Date(
                      step.date
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </p>
                )}

            </div>

          </div>
        );
      })}

      {/* Rejected state */}

      {status === "REJECTED" && (
        <div className="mt-1 flex gap-4">

          <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-500">
            <XCircle size={16} />
          </div>

          <div>

            <h3 className="text-sm font-semibold text-red-700">
              Application Rejected
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Unfortunately, this application
              was not selected.
            </p>

            {application.reviewedAt && (
              <p className="mt-2 text-[11px] text-slate-400">
                {new Date(
                  application.reviewedAt
                ).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </p>
            )}

          </div>

        </div>
      )}

    </div>
  );
};


/* =========================================================
   DETAIL ROW
========================================================= */

const DetailRow = ({
  label,
  value,
}) => {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">

      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-slate-700">
        {value}
      </span>

    </div>
  );
};

export default ApplicationDetails;