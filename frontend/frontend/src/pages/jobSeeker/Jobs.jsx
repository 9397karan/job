import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import { CardSkeleton } from "../../components/ui/Skeleton";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [skill, setSkill] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [mobileFilters, setMobileFilters] =
    useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.append("page", page);
      params.append("limit", 10);

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (location.trim()) {
        params.append(
          "location",
          location.trim()
        );
      }

      if (jobType) {
        params.append("jobType", jobType);
      }

      if (skill.trim()) {
        params.append("skill", skill.trim());
      }

      if (minSalary) {
        params.append("minSalary", minSalary);
      }

      if (maxSalary) {
        params.append("maxSalary", maxSalary);
      }

      const response = await api.get(
        `/jobs?${params.toString()}`
      );

      setJobs(
        response.data.jobs ||
          response.data.data ||
          []
      );

      setTotalPages(
        response.data.totalPages ||
          response.data.pagination?.totalPages ||
          1
      );
    } catch (error) {
      console.error(
        "Fetch jobs error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page]);

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);
    fetchJobs();
  };

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setJobType("");
    setSkill("");
    setMinSalary("");
    setMaxSalary("");
    setPage(1);

    setTimeout(() => {
      fetchJobs();
    }, 0);
  };

  const activeFilterCount = [
    location,
    jobType,
    skill,
    minSalary,
    maxSalary,
  ].filter(Boolean).length;

  const formatSalary = (min, max) => {
    if (!min && !max) {
      return "Salary not disclosed";
    }

    const format = (value) => {
      if (value >= 100000) {
        return `₹${(value / 100000).toFixed(1)}L`;
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

    return min ? format(min) : format(max);
  };

  const formatDate = (date) => {
    if (!date) return "";

    const created = new Date(date);
    const now = new Date();

    const difference =
      now.getTime() - created.getTime();

    const days = Math.floor(
      difference / (1000 * 60 * 60 * 24)
    );

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";

    if (days < 7) {
      return `${days} days ago`;
    }

    return created.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <PageHeader
        title="Find Jobs"
        description="Discover opportunities that match your skills and career goals."
        action={
          <button
            type="button"
            onClick={() =>
              setMobileFilters(true)
            }
            className="btn btn-outline gap-2 lg:hidden"
          >
            <SlidersHorizontal size={17} />

            Filters

            {activeFilterCount > 0 && (
              <span className="badge badge-primary badge-sm">
                {activeFilterCount}
              </span>
            )}
          </button>
        }
      />

      {/* =====================================================
          SEARCH BAR
      ===================================================== */}

      <Card className="border-slate-200 bg-white">

        <form
          onSubmit={handleSearch}
          className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]"
        >

          {/* Search */}
          <div className="flex h-12 items-center gap-3 rounded-xl border border-base-300 bg-base-100 px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">

            <Search
              size={19}
              className="shrink-0 text-base-content/40"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Job title, skills or keywords"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-base-content/40"
            />

          </div>

          {/* Location */}
          <div className="flex h-12 items-center gap-3 rounded-xl border border-base-300 bg-base-100 px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">

            <MapPin
              size={19}
              className="shrink-0 text-base-content/40"
            />

            <input
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
              placeholder="Location"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-base-content/40"
            />

          </div>

          <Button
            type="submit"
            className="h-12 px-7"
          >
            <Search size={17} />
            Search Jobs
          </Button>

        </form>

      </Card>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">

        {/* =================================================
            FILTERS DESKTOP
        ================================================= */}

        <aside className="hidden lg:block">

          <div className="sticky top-24">

            <Card>

              <div className="mb-5 flex items-center justify-between">

                <div className="flex items-center gap-2">
                  <Filter size={17} />

                  <h2 className="font-semibold">
                    Filters
                  </h2>
                </div>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Clear all
                  </button>
                )}

              </div>

              <FilterContent
                jobType={jobType}
                setJobType={setJobType}
                skill={skill}
                setSkill={setSkill}
                minSalary={minSalary}
                setMinSalary={setMinSalary}
                maxSalary={maxSalary}
                setMaxSalary={setMaxSalary}
                onApply={() => {
                  setPage(1);
                  fetchJobs();
                }}
              />

            </Card>

          </div>

        </aside>

        {/* =================================================
            JOB RESULTS
        ================================================= */}

        <section className="min-w-0">

          {/* Result header */}
          <div className="mb-4 flex items-center justify-between">

            <div>
              <h2 className="font-semibold">
                Available Jobs
              </h2>

              <p className="mt-1 text-xs text-base-content/50">
                {loading
                  ? "Finding opportunities..."
                  : `${jobs.length} jobs shown`}
              </p>
            </div>

            {activeFilterCount > 0 && (
              <div className="hidden flex-wrap justify-end gap-2 sm:flex">

                {location && (
                  <Badge variant="ghost">
                    <MapPin size={12} />
                    {location}
                  </Badge>
                )}

                {jobType && (
                  <Badge variant="ghost">
                    {jobType.replace(
                      "_",
                      " "
                    )}
                  </Badge>
                )}

                {skill && (
                  <Badge variant="ghost">
                    {skill}
                  </Badge>
                )}

              </div>
            )}

          </div>

          {/* Loading */}
          {loading ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={BriefcaseBusiness}
              title="No jobs found"
              description="Try changing your search or removing some filters to find more opportunities."
              action={
                <Button
                  variant="outline"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">

              {jobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  formatSalary={formatSalary}
                  formatDate={formatDate}
                />
              ))}

            </div>
          )}

          {/* =================================================
              PAGINATION
          ================================================= */}

          {!loading &&
            jobs.length > 0 &&
            totalPages > 1 && (
              <div className="mt-7 flex items-center justify-center gap-2">

                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() =>
                    setPage((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  className="btn btn-outline btn-sm btn-square"
                >
                  <ChevronLeft size={17} />
                </button>

                <div className="flex items-center gap-1">

                  {Array.from(
                    {
                      length: Math.min(
                        totalPages,
                        5
                      ),
                    },
                    (_, index) => {
                      const pageNumber =
                        index + 1;

                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() =>
                            setPage(pageNumber)
                          }
                          className={`btn btn-sm min-w-9 ${
                            page === pageNumber
                              ? "btn-primary"
                              : "btn-ghost"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                  )}

                </div>

                <button
                  type="button"
                  disabled={
                    page === totalPages
                  }
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        totalPages,
                        current + 1
                      )
                    )
                  }
                  className="btn btn-outline btn-sm btn-square"
                >
                  <ChevronRight size={17} />
                </button>

              </div>
            )}

        </section>

      </div>

      {/* =====================================================
          MOBILE FILTER DRAWER
      ===================================================== */}

      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">

          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() =>
              setMobileFilters(false)
            }
          />

          <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-base-100 p-5 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div className="flex items-center gap-2">
                <Filter size={18} />

                <h2 className="text-lg font-bold">
                  Filters
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMobileFilters(false)
                }
                className="btn btn-ghost btn-circle btn-sm"
              >
                <X size={19} />
              </button>

            </div>

            <FilterContent
              jobType={jobType}
              setJobType={setJobType}
              skill={skill}
              setSkill={setSkill}
              minSalary={minSalary}
              setMinSalary={setMinSalary}
              maxSalary={maxSalary}
              setMaxSalary={setMaxSalary}
              onApply={() => {
                setPage(1);
                setMobileFilters(false);
                fetchJobs();
              }}
            />

          </div>

        </div>
      )}

    </div>
  );
};

/* =========================================================
   FILTER CONTENT
========================================================= */

const FilterContent = ({
  jobType,
  setJobType,
  skill,
  setSkill,
  minSalary,
  setMinSalary,
  maxSalary,
  setMaxSalary,
  onApply,
}) => {
  return (
    <div className="space-y-6">

      {/* Job type */}
      <div>

        <label className="mb-2 block text-sm font-semibold">
          Job Type
        </label>

        <select
          value={jobType}
          onChange={(event) =>
            setJobType(event.target.value)
          }
          className="select select-bordered w-full rounded-xl bg-base-100"
        >
          <option value="">
            All types
          </option>

          <option value="FULL_TIME">
            Full Time
          </option>

          <option value="PART_TIME">
            Part Time
          </option>

          <option value="INTERNSHIP">
            Internship
          </option>

          <option value="CONTRACT">
            Contract
          </option>

          <option value="REMOTE">
            Remote
          </option>
        </select>

      </div>

      {/* Skill */}
      <div>

        <label className="mb-2 block text-sm font-semibold">
          Skill
        </label>

        <input
          value={skill}
          onChange={(event) =>
            setSkill(event.target.value)
          }
          placeholder="e.g. React"
          className="input input-bordered w-full rounded-xl"
        />

      </div>

      {/* Salary */}
      <div>

        <label className="mb-2 block text-sm font-semibold">
          Salary Range
        </label>

        <div className="grid grid-cols-2 gap-2">

          <input
            type="number"
            value={minSalary}
            onChange={(event) =>
              setMinSalary(event.target.value)
            }
            placeholder="Min"
            className="input input-bordered w-full rounded-xl"
          />

          <input
            type="number"
            value={maxSalary}
            onChange={(event) =>
              setMaxSalary(event.target.value)
            }
            placeholder="Max"
            className="input input-bordered w-full rounded-xl"
          />

        </div>

      </div>

      <Button
        onClick={onApply}
        className="w-full"
      >
        Apply Filters
      </Button>

    </div>
  );
};

/* =========================================================
   JOB CARD
========================================================= */

const JobCard = ({
  job,
  formatSalary,
  formatDate,
}) => {
  return (
    <Card
      hover
      className="group"
    >

      <div className="flex flex-col gap-5">

        <div className="flex gap-4">

          {/* Company logo */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">

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

          {/* Main information */}
          <div className="min-w-0 flex-1">

            <div className="flex flex-col justify-between gap-1 sm:flex-row">

              <div>
                <Link
                  to={`/job-seeker/jobs/${job._id}`}
                  className="text-lg font-bold tracking-tight transition group-hover:text-primary"
                >
                  {job.title}
                </Link>

                <p className="mt-1 text-sm font-medium text-base-content/60">
                  {job.company?.name ||
                    "Company"}
                </p>
              </div>

              <span className="text-xs text-base-content/40">
                {formatDate(job.createdAt)}
              </span>

            </div>

          </div>

        </div>

        {/* Job details */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-base-content/60">

          <span className="flex items-center gap-1.5">
            <MapPin size={15} />
            {job.location ||
              "Location not specified"}
          </span>

          <span className="flex items-center gap-1.5">
            <BriefcaseBusiness size={15} />
            {formatJobType(job.jobType)}
          </span>

          <span className="font-medium text-base-content/70">
            {formatSalary(
              job.salaryMin,
              job.salaryMax
            )}
          </span>

        </div>

        {/* Skills */}
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2">

            {job.skills
              .slice(0, 6)
              .map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-base-200 px-2.5 py-1 text-xs font-medium text-base-content/60"
                >
                  {skill}
                </span>
              ))}

            {job.skills.length > 6 && (
              <span className="rounded-lg bg-base-200 px-2.5 py-1 text-xs text-base-content/40">
                +{job.skills.length - 6}
              </span>
            )}

          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col justify-between gap-3 border-t border-base-300/70 pt-4 sm:flex-row sm:items-center">

          <div className="flex items-center gap-2">

            {job.jobType === "REMOTE" && (
              <Badge variant="success">
                Remote
              </Badge>
            )}

            {job.experienceRequired !==
              undefined && (
              <span className="text-xs text-base-content/45">
                {job.experienceRequired === 0
                  ? "Fresher"
                  : `${job.experienceRequired}+ years experience`}
              </span>
            )}

          </div>

          <Link
            to={`/job-seeker/jobs/${job._id}`}
            className="btn btn-primary btn-sm w-full sm:w-auto"
          >
            View Details
          </Link>

        </div>

      </div>

    </Card>
  );
};

const formatJobType = (type) => {
  if (!type) return "Full Time";

  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

export default Jobs;