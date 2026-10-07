import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Heart,
  Loader2,
  MapPin,
  Send,
  Users,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../services/api";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";


const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [profile, setProfile] = useState(null);
  const [application, setApplication] = useState(null);
  const [saved, setSaved] = useState(false);

  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showApplyModal, setShowApplyModal] =
    useState(false);

  const [coverLetter, setCoverLetter] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  /* =========================================================
     FETCH DATA
  ========================================================= */

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        jobResponse,
        profileResponse,
        applicationResponse,
        savedResponse,
      ] = await Promise.all([
        api.get(`/jobs/${id}`),
        api.get("/job-seeker/profile"),
        api
          .get("/applications/my")
          .catch(() => ({
            data: { applications: [] },
          })),
        api
          .get("/saved-jobs")
          .catch(() => ({
            data: { savedJobs: [] },
          })),
      ]);

      setJob(
        jobResponse.data.job ||
          jobResponse.data.data
      );

      setProfile(
        profileResponse.data.user ||
          profileResponse.data.profile
      );

      const applications =
        applicationResponse.data.applications ||
        [];

      const existingApplication =
        applications.find(
          (item) =>
            item.job?._id === id ||
            item.job === id
        );

      setApplication(
        existingApplication || null
      );

      const savedJobs =
        savedResponse.data.savedJobs ||
        savedResponse.data.jobs ||
        [];

      setSaved(
        savedJobs.some(
          (item) =>
            item.job?._id === id ||
            item.job === id ||
            item._id === id
        )
      );
    } catch (err) {
      console.error(
        "Job details error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load job details."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, [id]);


  /* =========================================================
     SAVE / UNSAVE JOB
  ========================================================= */

  const handleSaveJob = async () => {
    try {
      setSaving(true);

      if (saved) {
        await api.delete(`/saved-jobs/${id}`);

        setSaved(false);
      } else {
        await api.post("/saved-jobs", {
          jobId: id,
        });

        setSaved(true);
      }
    } catch (err) {
      console.error(
        "Save job error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to update saved job."
      );
    } finally {
      setSaving(false);
    }
  };


  /* =========================================================
     APPLY
  ========================================================= */

  const handleApply = async () => {
    try {
      setApplying(true);
      setError("");

      const response = await api.post(
        "/applications",
        {
          jobId: id,
          coverLetter,
        }
      );

      setApplication(
        response.data.application
      );

      setSuccess(
        "Application submitted successfully."
      );

      setShowApplyModal(false);

      setCoverLetter("");
    } catch (err) {
      console.error(
        "Application error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to submit application."
      );
    } finally {
      setApplying(false);
    }
  };


  /* =========================================================
     FORMAT HELPERS
  ========================================================= */

  const formatSalary = (
    min,
    max
  ) => {
    if (!min && !max) {
      return "Not disclosed";
    }

    const format = (value) => {
      if (value >= 100000) {
        return `₹${(
          value / 100000
        ).toFixed(1)}L`;
      }

      if (value >= 1000) {
        return `₹${Math.round(
          value / 1000
        )}K`;
      }

      return `₹${value}`;
    };

    if (min && max) {
      return `${format(min)} - ${format(max)}`;
    }

    return min
      ? format(min)
      : format(max);
  };


  const formatJobType = (type) => {
    if (!type) {
      return "Full Time";
    }

    return type
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  };


  const formatDate = (date) => {
    if (!date) return "Recently";

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
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
            Loading job details...
          </p>

        </div>

      </div>
    );
  }


  /* =========================================================
     ERROR
  ========================================================= */

  if (error && !job) {
    return (
      <div className="mx-auto max-w-3xl py-16">

        <Card className="text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <FileText
              size={26}
              className="text-red-500"
            />
          </div>

          <h2 className="mt-4 text-xl font-bold">
            Unable to load job
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <button
            onClick={() =>
              navigate(-1)
            }
            className="btn btn-primary mt-6"
          >
            Go Back
          </button>

        </Card>

      </div>
    );
  }


  if (!job) {
    return null;
  }


  const company =
    job.company || {};

  const hasApplied =
    Boolean(application);

  const isAccepted =
    application?.status ===
    "ACCEPTED";

  const isRejected =
    application?.status ===
    "REJECTED";


  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* =====================================================
          BACK
      ===================================================== */}

      <button
        onClick={() =>
          navigate(-1)
        }
        className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary"
      >
        <ArrowLeft
          size={17}
          className="transition-transform group-hover:-translate-x-0.5"
        />

        Back to Jobs
      </button>


      {/* =====================================================
          SUCCESS / ERROR
      ===================================================== */}

      {success && (
        <div className="alert border border-emerald-200 bg-emerald-50 text-emerald-700">

          <CheckCircle2 size={19} />

          <span>
            {success}
          </span>

          <button
            className="ml-auto text-xs font-semibold underline"
            onClick={() =>
              setSuccess("")
            }
          >
            Dismiss
          </button>

        </div>
      )}

      {error && (
        <div className="alert border border-red-200 bg-red-50 text-red-700">

          <span>
            {error}
          </span>

          <button
            className="ml-auto text-xs font-semibold underline"
            onClick={() =>
              setError("")
            }
          >
            Dismiss
          </button>

        </div>
      )}


      {/* =====================================================
          JOB HERO
      ===================================================== */}

      <Card className="overflow-hidden border-slate-200 bg-white p-0">

        <div className="h-2 bg-gradient-to-r from-primary via-indigo-500 to-violet-500" />

        <div className="p-5 md:p-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-start">

            {/* Company logo */}

            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 md:h-20 md:w-20">

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
                <Building2
                  size={32}
                />
              )}

            </div>


            {/* Job heading */}

            <div className="min-w-0 flex-1">

              <div className="flex flex-col gap-2">

                <div className="flex flex-wrap items-center gap-2">

                  {job.jobType ===
                    "REMOTE" && (
                    <Badge variant="success">
                      Remote
                    </Badge>
                  )}

                  {hasApplied && (
                    <Badge
                      variant={
                        isAccepted
                          ? "success"
                          : isRejected
                            ? "error"
                            : "info"
                      }
                    >
                      {application.status?.replace(
                        /_/g,
                        " "
                      )}
                    </Badge>
                  )}

                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  {job.title}
                </h1>

                <p className="text-base font-semibold text-slate-600">
                  {company.name ||
                    "Company"}
                </p>

              </div>


              {/* Metadata */}

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">

                <span className="flex items-center gap-1.5">
                  <MapPin size={16} />
                  {job.location ||
                    "Location not specified"}
                </span>

                <span className="flex items-center gap-1.5">
                  <BriefcaseBusiness
                    size={16}
                  />
                  {formatJobType(
                    job.jobType
                  )}
                </span>

                <span className="flex items-center gap-1.5">
                  ₹
                  {formatSalary(
                    job.salaryMin,
                    job.salaryMax
                  )}
                </span>

                <span className="flex items-center gap-1.5">
                  <CalendarDays
                    size={16}
                  />
                  Posted{" "}
                  {formatDate(
                    job.createdAt
                  )}
                </span>

              </div>

            </div>


            {/* Actions */}

            <div className="flex flex-col gap-2 sm:flex-row md:flex-col">

              {hasApplied ? (
                <Link
                  to={`/job-seeker/applications/${application._id}`}
                  className="btn btn-primary gap-2"
                >
                  <FileText
                    size={17}
                  />
                  View Application
                </Link>
              ) : (
                <Button
                  onClick={() =>
                    setShowApplyModal(
                      true
                    )
                  }
                  className="gap-2"
                >
                  <Send size={17} />
                  Apply Now
                </Button>
              )}

              <button
                type="button"
                disabled={saving}
                onClick={handleSaveJob}
                className={`btn gap-2 ${
                  saved
                    ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                    : "btn-outline"
                }`}
              >

                {saving ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Heart
                    size={17}
                    fill={
                      saved
                        ? "currentColor"
                        : "none"
                    }
                  />
                )}

                {saved
                  ? "Saved"
                  : "Save Job"}

              </button>

            </div>

          </div>

        </div>

      </Card>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

        {/* =================================================
            LEFT
        ================================================= */}

        <div className="space-y-6">

          {/* About */}
          <Card className="border-slate-200 bg-white">

            <h2 className="text-lg font-bold text-slate-900">
              About the Job
            </h2>

            <div className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600">
              {job.description ||
                "No job description provided."}
            </div>

          </Card>


          {/* Skills */}
          <Card className="border-slate-200 bg-white">

            <h2 className="text-lg font-bold text-slate-900">
              Required Skills
            </h2>

            {job.skills?.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">

                {job.skills.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600"
                    >
                      {skill}
                    </span>
                  )
                )}

              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                No specific skills listed.
              </p>
            )}

          </Card>


          {/* Experience */}
          <Card className="border-slate-200 bg-white">

            <h2 className="text-lg font-bold text-slate-900">
              Experience & Requirements
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <InfoBox
                icon={BriefcaseBusiness}
                label="Experience"
                value={
                  job.experienceRequired ===
                  0
                    ? "Fresher"
                    : `${job.experienceRequired}+ years`
                }
              />

              <InfoBox
                icon={Users}
                label="Vacancies"
                value={
                  job.vacancies ||
                  1
                }
              />

              <InfoBox
                icon={Clock}
                label="Employment"
                value={formatJobType(
                  job.jobType
                )}
              />

              <InfoBox
                icon={MapPin}
                label="Location"
                value={
                  job.location ||
                  "Not specified"
                }
              />

            </div>

          </Card>

        </div>


        {/* =================================================
            RIGHT SIDEBAR
        ================================================= */}

        <aside className="space-y-6">

          {/* Job information */}

          <Card className="border-slate-200 bg-white">

            <h2 className="text-lg font-bold text-slate-900">
              Job Information
            </h2>

            <div className="mt-5 space-y-4">

              <InfoRow
                icon={BriefcaseBusiness}
                label="Job Type"
                value={formatJobType(
                  job.jobType
                )}
              />

              <InfoRow
                icon={MapPin}
                label="Location"
                value={
                  job.location ||
                  "Not specified"
                }
              />

              <InfoRow
                icon={FileText}
                label="Experience"
                value={
                  job.experienceRequired ===
                  0
                    ? "Fresher"
                    : `${job.experienceRequired}+ years`
                }
              />

              <InfoRow
                icon={Users}
                label="Vacancies"
                value={
                  job.vacancies ||
                  1
                }
              />

              <InfoRow
                icon={CalendarDays}
                label="Posted"
                value={formatDate(
                  job.createdAt
                )}
              />

            </div>

          </Card>


          {/* Company */}

          <Card className="border-slate-200 bg-white">

            <h2 className="text-lg font-bold text-slate-900">
              About the Company
            </h2>

            <div className="mt-5 flex items-center gap-3">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-slate-500">

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
                  <Building2
                    size={22}
                  />
                )}

              </div>

              <div className="min-w-0">

                <p className="truncate font-semibold text-slate-900">
                  {company.name ||
                    "Company"}
                </p>

                {company.industry && (
                  <p className="text-xs text-slate-500">
                    {company.industry}
                  </p>
                )}

              </div>

            </div>

            {company.description && (
              <p className="mt-4 text-sm leading-6 text-slate-500">
                {company.description}
              </p>
            )}

            {company.location && (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <MapPin size={15} />

                {company.location}
              </div>
            )}

            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm mt-5 w-full gap-2"
              >
                Visit Company Website

                <ExternalLink
                  size={14}
                />
              </a>
            )}

          </Card>

        </aside>

      </div>


      {/* =====================================================
          APPLY MODAL
      ===================================================== */}

      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Header */}
            <div className="border-b border-slate-200 p-5 md:p-6">

              <div className="flex items-start justify-between gap-4">

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Apply for this position
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {job.title} ·{" "}
                    {company.name ||
                      "Company"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowApplyModal(
                      false
                    )
                  }
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  ×
                </button>

              </div>

            </div>


            {/* Body */}
            <div className="space-y-5 p-5 md:p-6">

              {/* Resume */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <FileText
                      size={19}
                    />
                  </div>

                  <div className="min-w-0">

                    <p className="text-sm font-semibold text-slate-900">
                      Resume
                    </p>

                    <p className="text-xs text-slate-500">
                      {profile?.resumeUrl
                        ? "Your uploaded resume will be submitted."
                        : "No resume uploaded."}
                    </p>

                  </div>

                </div>

                {!profile?.resumeUrl && (
                  <Link
                    to="/job-seeker/profile"
                    className="btn btn-warning btn-sm mt-3"
                  >
                    Upload Resume
                  </Link>
                )}

              </div>


              {/* Cover letter */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Cover Letter
                  <span className="ml-1 font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <textarea
                  value={coverLetter}
                  onChange={(event) =>
                    setCoverLetter(
                      event.target.value
                    )
                  }
                  rows={7}
                  placeholder="Tell the recruiter why you're a good fit for this position..."
                  className="textarea textarea-bordered w-full rounded-xl bg-white text-sm leading-6 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />

              </div>

            </div>


            {/* Footer */}
            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  setShowApplyModal(
                    false
                  )
                }
                className="btn btn-ghost"
              >
                Cancel
              </button>

              <Button
                loading={applying}
                disabled={
                  !profile?.resumeUrl
                }
                onClick={handleApply}
                className="gap-2"
              >
                <Send size={16} />

                Submit Application
              </Button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};


/* =========================================================
   INFO ROW
========================================================= */

const InfoRow = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon size={16} />
      </div>

      <div className="min-w-0">

        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-medium text-slate-700">
          {value}
        </p>

      </div>

    </div>
  );
};


/* =========================================================
   INFO BOX
========================================================= */

const InfoBox = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
        <Icon size={18} />
      </div>

      <div>

        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-700">
          {value}
        </p>

      </div>

    </div>
  );
};

export default JobDetails;