import { useEffect, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Heart,
  Loader2,
  MapPin,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import { CardSkeleton } from "../../components/ui/Skeleton";

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState("");

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/saved-jobs");

      setSavedJobs(
        response.data.savedJobs ||
          response.data.jobs ||
          response.data.data ||
          []
      );
    } catch (error) {
      console.error(
        "Fetch saved jobs error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load saved jobs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const getJob = (saved) => {
    return saved.job || saved;
  };

  const getJobId = (saved) => {
    const job = getJob(saved);

    return job?._id || saved._id;
  };

  const handleRemove = async (saved) => {
    const jobId = getJobId(saved);

    if (!jobId) return;

    try {
      setRemoving(jobId);

      await api.delete(
        `/saved-jobs/${jobId}`
      );

      setSavedJobs((current) =>
        current.filter(
          (item) =>
            getJobId(item) !== jobId
        )
      );
    } catch (error) {
      console.error(
        "Remove saved job error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to remove saved job."
      );
    } finally {
      setRemoving(null);
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) {
      return "Salary not disclosed";
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

    const savedDate = new Date(date);

    return savedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <PageHeader
        title="Saved Jobs"
        description="Keep track of opportunities you want to explore later."
        action={
          <Link
            to="/job-seeker/jobs"
            className="btn btn-primary gap-2"
          >
            <BriefcaseBusiness size={17} />
            Find More Jobs
          </Link>
        }
      />

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="alert border border-red-200 bg-red-50 text-red-700">

          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="ml-auto text-xs font-semibold underline"
          >
            Dismiss
          </button>

        </div>
      )}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      {!loading && savedJobs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <SummaryCard
            icon={Heart}
            label="Saved Jobs"
            value={savedJobs.length}
            description="Opportunities saved for later"
          />

          <SummaryCard
            icon={BriefcaseBusiness}
            label="Ready to Explore"
            value={savedJobs.length}
            description="Review and apply when ready"
          />

          <SummaryCard
            icon={MapPin}
            label="Opportunities"
            value="Active"
            description="Keep your job search moving"
          />

        </div>
      )}

      {/* =====================================================
          CONTENT
      ===================================================== */}

      {loading ? (
        <div className="grid gap-4 xl:grid-cols-2">

          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />

        </div>
      ) : savedJobs.length === 0 ? (
        <Card className="border-slate-200 bg-white">

          <EmptyState
            icon={Heart}
            title="No saved jobs yet"
            description="When you find a job you like, save it and come back here when you're ready to apply."
            action={
              <Link
                to="/job-seeker/jobs"
                className="btn btn-primary gap-2"
              >
                <BriefcaseBusiness size={17} />
                Browse Jobs
              </Link>
            }
          />

        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">

          {savedJobs.map((saved) => {
            const job = getJob(saved);
            const jobId = getJobId(saved);

            if (!job) return null;

            return (
              <SavedJobCard
                key={
                  saved._id ||
                  jobId
                }
                job={job}
                savedAt={saved.createdAt}
                removing={
                  removing === jobId
                }
                onRemove={() =>
                  handleRemove(saved)
                }
                formatSalary={
                  formatSalary
                }
                formatJobType={
                  formatJobType
                }
                formatDate={
                  formatDate
                }
              />
            );
          })}

        </div>
      )}

    </div>
  );
};


/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  description,
}) => {
  return (
    <Card className="border-slate-200 bg-white">

      <div className="flex items-center gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon size={20} />
        </div>

        <div className="min-w-0">

          <p className="text-xs font-medium text-slate-400">
            {label}
          </p>

          <p className="mt-0.5 text-xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>

        </div>

      </div>

    </Card>
  );
};


/* =========================================================
   SAVED JOB CARD
========================================================= */

const SavedJobCard = ({
  job,
  savedAt,
  removing,
  onRemove,
  formatSalary,
  formatJobType,
  formatDate,
}) => {
  return (
    <Card
      hover
      className="group border-slate-200 bg-white"
    >

      <div className="flex flex-col gap-5">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-start gap-4">

          {/* Company logo */}

          <div className="flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-indigo-50 text-indigo-600">

            {job.company?.logo ? (
              <img
                src={job.company.logo}
                alt={
                  job.company?.name ||
                  "Company"
                }
                className="h-full w-full object-cover"
              />
            ) : (
              <BriefcaseBusiness
                size={22}
              />
            )}

          </div>

          {/* Title */}

          <div className="min-w-0 flex-1">

            <div className="flex items-start justify-between gap-3">

              <div className="min-w-0">

                <Link
                  to={`/job-seeker/jobs/${job._id}`}
                  className="line-clamp-2 text-lg font-bold tracking-tight text-slate-900 transition hover:text-primary"
                >
                  {job.title}
                </Link>

                <p className="mt-1 truncate text-sm font-medium text-slate-500">
                  {job.company?.name ||
                    "Company"}
                </p>

              </div>

              {/* Saved icon */}

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                <Heart
                  size={17}
                  fill="currentColor"
                />
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            DETAILS
        ================================================= */}

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">

          <span className="flex items-center gap-1.5">
            <MapPin size={15} />
            {job.location ||
              "Location not specified"}
          </span>

          <span className="flex items-center gap-1.5">
            <BriefcaseBusiness
              size={15}
            />
            {formatJobType(
              job.jobType
            )}
          </span>

          <span className="font-medium text-slate-700">
            {formatSalary(
              job.salaryMin,
              job.salaryMax
            )}
          </span>

        </div>

        {/* =================================================
            SKILLS
        ================================================= */}

        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2">

            {job.skills
              .slice(0, 5)
              .map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                >
                  {skill}
                </span>
              ))}

            {job.skills.length > 5 && (
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-400">
                +{job.skills.length - 5}
              </span>
            )}

          </div>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-xs text-slate-400">
              Saved
            </p>

            <p className="mt-0.5 text-xs font-medium text-slate-600">
              {formatDate(savedAt)}
            </p>

          </div>

          <div className="flex gap-2">

            <button
              type="button"
              disabled={removing}
              onClick={onRemove}
              className="btn btn-ghost btn-sm gap-1.5 text-red-500 hover:bg-red-50 hover:text-red-600"
            >

              {removing ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Trash2 size={15} />
              )}

              Remove

            </button>

            <Link
              to={`/job-seeker/jobs/${job._id}`}
              className="btn btn-primary btn-sm"
            >
              View Job
            </Link>

          </div>

        </div>

      </div>

    </Card>
  );
};

export default SavedJobs;