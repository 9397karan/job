import { useEffect, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Clock,
  FileText,
  Heart,
  MapPin,
  Search,
  Sparkles,
  TrendingUp,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { CardSkeleton } from "../../components/ui/Skeleton";


const Dashboard = () => {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);

  const [savedCount, setSavedCount] = useState(0);

  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [
        jobsResponse,
        applicationsResponse,
        interviewsResponse,
        savedResponse,
      ] = await Promise.all([
        api.get("/jobs?limit=5&page=1"),
        api.get("/applications/my"),
        api.get("/interviews"),
        api.get("/saved-jobs"),
      ]);

      setJobs(
        jobsResponse.data.jobs ||
          jobsResponse.data.data ||
          []
      );

      setApplications(
        applicationsResponse.data.applications || []
      );

      setInterviews(
        interviewsResponse.data.interviews || []
      );

      setSavedCount(
        savedResponse.data.savedJobs?.length ||
          savedResponse.data.jobs?.length ||
          savedResponse.data.count ||
          0
      );
    } catch (error) {
      console.error(
        "Dashboard data error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  const formatSalary = (min, max) => {
    if (!min && !max) {
      return "Salary not disclosed";
    }

    const format = (value) => {
      if (value >= 100000) {
        return `₹${(value / 100000).toFixed(1)}L`;
      }

      return `₹${value.toLocaleString("en-IN")}`;
    };

    if (min && max) {
      return `${format(min)} - ${format(max)}`;
    }

    return min ? format(min) : format(max);
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const upcomingInterviews = interviews
    .filter(
      (interview) =>
        new Date(interview.scheduledAt) >
        new Date() &&
        interview.status === "SCHEDULED"
    )
    .slice(0, 3);

  const recentApplications =
    applications.slice(0, 5);

  return (
    <div className="space-y-7">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-indigo-600 p-6 text-white shadow-lg shadow-primary/10 md:p-8">

        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

        <div className="pointer-events-none absolute -bottom-24 right-20 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative z-10 max-w-3xl">

          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/80">
            <Sparkles size={16} />

            Welcome back
          </div>

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
            Hello, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 md:text-base">
            Find opportunities that match your
            skills and take the next step in your
            career.
          </p>

          <Link
            to="/job-seeker/jobs"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary shadow-lg transition hover:-translate-y-0.5 hover:bg-white/95"
          >
            <Search size={18} />

            Find Jobs

            <ArrowRight size={16} />
          </Link>

        </div>
      </section>

      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Applications"
          value={applications.length}
          description="Jobs you've applied to"
          icon={FileText}
          iconClass="text-primary"
          iconBg="bg-primary/10"
        />

        <StatCard
          title="Saved Jobs"
          value={savedCount}
          description="Jobs saved for later"
          icon={Heart}
          iconClass="text-rose-500"
          iconBg="bg-rose-500/10"
        />

        <StatCard
          title="Interviews"
          value={upcomingInterviews.length}
          description="Upcoming interviews"
          icon={Video}
          iconClass="text-indigo-500"
          iconBg="bg-indigo-500/10"
        />

        <StatCard
          title="Profile"
          value={
            user?.resumeUrl
              ? "Complete"
              : "Incomplete"
          }
          description={
            user?.resumeUrl
              ? "Resume uploaded"
              : "Upload your resume"
          }
          icon={TrendingUp}
          iconClass="text-emerald-500"
          iconBg="bg-emerald-500/10"
        />

      </section>

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">

        {/* =================================================
            RECOMMENDED JOBS
        ================================================= */}

        <section>

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold">
                Recommended Jobs
              </h2>

              <p className="mt-1 text-sm text-base-content/50">
                Latest opportunities you may like
              </p>
            </div>

            <Link
              to="/job-seeker/jobs"
              className="btn btn-ghost btn-sm gap-1 text-primary"
            >
              View all
              <ArrowRight size={15} />
            </Link>

          </div>

          {loading ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={BriefcaseBusiness}
              title="No jobs available"
              description="There are no job postings available right now."
              action={
                <Link
                  to="/job-seeker/jobs"
                  className="btn btn-primary btn-sm"
                >
                  Browse Jobs
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">

              {jobs.slice(0, 5).map((job) => (
                <Card
                  key={job._id}
                  hover
                  className="group"
                >

                  <div className="flex flex-col gap-4 sm:flex-row">

                    {/* Company logo */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {job.company?.logo ? (
                        <img
                          src={job.company.logo}
                          alt={
                            job.company?.name ||
                            "Company"
                          }
                          className="h-full w-full rounded-xl object-cover"
                        />
                      ) : (
                        <BriefcaseBusiness
                          size={22}
                        />
                      )}
                    </div>

                    {/* Job info */}
                    <div className="min-w-0 flex-1">

                      <div className="flex flex-col justify-between gap-2 sm:flex-row">

                        <div>
                          <Link
                            to={`/job-seeker/jobs/${job._id}`}
                            className="text-base font-bold transition hover:text-primary md:text-lg"
                          >
                            {job.title}
                          </Link>

                          <p className="mt-1 text-sm font-medium text-base-content/60">
                            {job.company?.name ||
                              "Company"}
                          </p>
                        </div>

                        <span className="text-xs text-base-content/40">
                          {formatDate(
                            job.createdAt
                          )}
                        </span>

                      </div>

                      {/* Details */}
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-base-content/55">

                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} />
                          {job.location ||
                            "Location not specified"}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <BriefcaseBusiness
                            size={14}
                          />
                          {job.jobType ||
                            "Full Time"}
                        </span>

                        <span className="flex items-center gap-1.5">
                          ₹
                          {formatSalary(
                            job.salaryMin,
                            job.salaryMax
                          )}
                        </span>

                      </div>

                      {/* Skills */}
                      {job.skills?.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">

                          {job.skills
                            .slice(0, 4)
                            .map((skill) => (
                              <span
                                key={skill}
                                className="rounded-lg bg-base-200 px-2.5 py-1 text-[11px] font-medium text-base-content/60"
                              >
                                {skill}
                              </span>
                            ))}

                          {job.skills.length > 4 && (
                            <span className="rounded-lg bg-base-200 px-2.5 py-1 text-[11px] text-base-content/40">
                              +{job.skills.length - 4}
                            </span>
                          )}

                        </div>
                      )}

                    </div>

                    {/* Action */}
                    <div className="flex items-end sm:items-center">

                      <Link
                        to={`/job-seeker/jobs/${job._id}`}
                        className="btn btn-outline btn-sm w-full sm:w-auto"
                      >
                        View Job
                      </Link>

                    </div>

                  </div>

                </Card>
              ))}

            </div>
          )}

        </section>

        {/* =================================================
            RIGHT COLUMN
        ================================================= */}

        <aside className="space-y-6">

          {/* Upcoming interviews */}
          <Card>

            <div className="mb-5 flex items-center justify-between">

              <div>
                <h2 className="font-bold">
                  Upcoming Interviews
                </h2>

                <p className="mt-1 text-xs text-base-content/50">
                  Your next interview sessions
                </p>
              </div>

              <Video
                size={19}
                className="text-primary"
              />

            </div>

            {loading ? (
              <div className="space-y-3">
                <CardSkeleton />
              </div>
            ) : upcomingInterviews.length ===
              0 ? (
              <div className="py-7 text-center">

                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-base-200">
                  <CalendarDays
                    size={20}
                    className="text-base-content/40"
                  />
                </div>

                <p className="text-sm font-medium">
                  No upcoming interviews
                </p>

                <p className="mt-1 text-xs text-base-content/50">
                  Scheduled interviews will appear
                  here.
                </p>

              </div>
            ) : (
              <div className="space-y-3">

                {upcomingInterviews.map(
                  (interview) => (
                    <div
                      key={interview._id}
                      className="rounded-xl border border-base-300 bg-base-200/40 p-4"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold">
                            {interview.job?.title ||
                              "Interview"}
                          </p>

                          <p className="mt-1 truncate text-xs text-base-content/50">
                            {interview.job?.company
                              ?.name ||
                              interview.recruiter
                                ?.name ||
                              "Recruiter"}
                          </p>

                        </div>

                        <span className="badge badge-info badge-sm">
                          Scheduled
                        </span>

                      </div>

                      <div className="mt-3 flex items-center gap-3 text-xs text-base-content/55">

                        <span className="flex items-center gap-1">
                          <CalendarDays size={13} />
                          {formatDate(
                            interview.scheduledAt
                          )}
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock size={13} />
                          {new Date(
                            interview.scheduledAt
                          ).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>

                      </div>

                      <Link
                        to={`/interview-room/${interview._id}`}
                        className="btn btn-primary btn-sm mt-4 w-full gap-2"
                      >
                        <Video size={15} />
                        Join Interview
                      </Link>

                    </div>
                  )
                )}

              </div>
            )}

            {upcomingInterviews.length > 0 && (
              <Link
                to="/job-seeker/interviews"
                className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                View all interviews
                <ArrowRight size={13} />
              </Link>
            )}

          </Card>

          {/* Profile completion */}
          <Card>

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                <UserIcon />
              </div>

              <div>
                <h3 className="font-semibold">
                  Complete your profile
                </h3>

                <p className="mt-1 text-xs leading-5 text-base-content/50">
                  A complete profile helps recruiters
                  understand your skills and experience.
                </p>
              </div>

            </div>

            <div className="mt-5">

              <div className="mb-2 flex justify-between text-xs">
                <span className="text-base-content/50">
                  Profile completion
                </span>

                <span className="font-semibold text-emerald-600">
                  {user?.resumeUrl ? "100%" : "60%"}
                </span>
              </div>

              <progress
                className="progress progress-success h-2 w-full"
                value={user?.resumeUrl ? 100 : 60}
                max="100"
              />

            </div>

            <Link
              to="/job-seeker/profile"
              className="btn btn-outline btn-sm mt-5 w-full"
            >
              Update Profile
            </Link>

          </Card>

        </aside>

      </div>

      {/* =====================================================
          RECENT APPLICATIONS
      ===================================================== */}

      <section>

        <div className="mb-4 flex items-center justify-between">

          <div>
            <h2 className="text-lg font-bold">
              Recent Applications
            </h2>

            <p className="mt-1 text-sm text-base-content/50">
              Track your latest job applications
            </p>
          </div>

          <Link
            to="/job-seeker/applications"
            className="btn btn-ghost btn-sm gap-1 text-primary"
          >
            View all
            <ArrowRight size={15} />
          </Link>

        </div>

        <Card padding={false}>

          {loading ? (
            <div className="space-y-3 p-5">
              <CardSkeleton />
            </div>
          ) : recentApplications.length ===
            0 ? (
            <EmptyState
              icon={FileText}
              title="No applications yet"
              description="Start applying to jobs and your applications will appear here."
              action={
                <Link
                  to="/job-seeker/jobs"
                  className="btn btn-primary btn-sm"
                >
                  Find Jobs
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>
                  <tr className="border-b border-base-300 text-left text-xs uppercase tracking-wider text-base-content/40">

                    <th className="px-5 py-4 font-semibold">
                      Position
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Company
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Applied
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Status
                    </th>

                    <th className="px-5 py-4" />

                  </tr>
                </thead>

                <tbody>

                  {recentApplications.map(
                    (application) => (
                      <tr
                        key={application._id}
                        className="border-b border-base-300/70 last:border-0 hover:bg-base-200/40"
                      >

                        <td className="px-5 py-4">

                          <Link
                            to={`/job-seeker/applications/${application._id}`}
                            className="font-semibold hover:text-primary"
                          >
                            {application.job?.title ||
                              "Job"}
                          </Link>

                        </td>

                        <td className="px-5 py-4 text-sm text-base-content/60">
                          {application.job
                            ?.company?.name ||
                            "Company"}
                        </td>

                        <td className="px-5 py-4 text-sm text-base-content/55">
                          {formatDate(
                            application.appliedAt
                          )}
                        </td>

                        <td className="px-5 py-4">
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
                        </td>

                        <td className="px-5 py-4 text-right">

                          <Link
                            to={`/job-seeker/applications/${application._id}`}
                            className="btn btn-ghost btn-xs"
                          >
                            View
                          </Link>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </Card>

      </section>

    </div>
  );
};

/* Small profile icon */
const UserIcon = () => {
  return (
    <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-emerald-500">
      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
    </div>
  );
};

export default Dashboard;