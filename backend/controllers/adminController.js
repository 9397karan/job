const User = require("../models/User");
const Company = require("../models/Company");
const Job = require("../models/Job");
const Application = require("../models/Application");

// =====================================================
// ADMIN DASHBOARD
// =====================================================

const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      jobSeekers,
      recruiters,
      totalCompanies,
      totalJobs,
      totalApplications,
    ] = await Promise.all([
      User.countDocuments({
        role: {
          $in: ["JOB_SEEKER", "RECRUITER"],
        },
      }),

      User.countDocuments({
        role: "JOB_SEEKER",
      }),

      User.countDocuments({
        role: "RECRUITER",
      }),

      Company.countDocuments(),

      Job.countDocuments(),

      Application.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        jobSeekers,
        recruiters,
        totalCompanies,
        totalJobs,
        totalApplications,
      },
    });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard.",
    });
  }
};


// =====================================================
// USERS
// =====================================================

const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: {
        $in: ["JOB_SEEKER", "RECRUITER"],
      },
    })
      .select(
        "name email role phone profileImage isActive isSuspended createdAt"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(
      "Admin users error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load users.",
    });
  }
};


// =====================================================
// COMPANIES
// =====================================================

const getAdminCompanies = async (req, res) => {
  try {
    const companies = await Company.find()
      .populate(
        "recruiter",
        "name email phone"
      )
      .sort({ createdAt: -1 });

    const companiesWithJobCount =
      await Promise.all(
        companies.map(async (company) => {
          const jobCount =
            await Job.countDocuments({
              company: company._id,
            });

          const applicationCount =
            await Application.countDocuments({
              job: {
                $in: await Job.find({
                  company: company._id,
                }).distinct("_id"),
              },
            });

          return {
            ...company.toObject(),
            jobCount,
            applicationCount,
          };
        })
      );

    res.status(200).json({
      success: true,
      count: companiesWithJobCount.length,
      companies: companiesWithJobCount,
    });
  } catch (error) {
    console.error(
      "Admin companies error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load companies.",
    });
  }
};


// =====================================================
// JOB POSTS
// =====================================================

const getAdminJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate(
        "recruiter",
        "name email"
      )
      .populate(
        "company",
        "name industry location"
      )
      .sort({ createdAt: -1 });

    const jobsWithApplications =
      await Promise.all(
        jobs.map(async (job) => {
          const applicationCount =
            await Application.countDocuments({
              job: job._id,
            });

          return {
            ...job.toObject(),
            applicationCount,
          };
        })
      );

    res.status(200).json({
      success: true,
      count: jobsWithApplications.length,
      jobs: jobsWithApplications,
    });
  } catch (error) {
    console.error(
      "Admin jobs error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load job posts.",
    });
  }
};


// =====================================================
// APPLICATION SUMMARY
// =====================================================

const getAdminApplicationStats = async (
  req,
  res
) => {
  try {
    const [
      total,
      applied,
      underReview,
      interviewScheduled,
      accepted,
      rejected,
    ] = await Promise.all([
      Application.countDocuments(),

      Application.countDocuments({
        status: "APPLIED",
      }),

      Application.countDocuments({
        status: "UNDER_REVIEW",
      }),

      Application.countDocuments({
        status: "INTERVIEW_SCHEDULED",
      }),

      Application.countDocuments({
        status: "ACCEPTED",
      }),

      Application.countDocuments({
        status: "REJECTED",
      }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        applied,
        underReview,
        interviewScheduled,
        accepted,
        rejected,
      },
    });
  } catch (error) {
    console.error(
      "Admin application stats error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load application statistics.",
    });
  }
};


module.exports = {
  getAdminDashboard,
  getAdminUsers,
  getAdminCompanies,
  getAdminJobs,
  getAdminApplicationStats,
};