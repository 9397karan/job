const Job = require("../models/Job");
const Application = require("../models/Application");
const Interview = require("../models/Interview");

const getRecruiterDashboard = async (req, res) => {
  try {
    const recruiterId = req.user.id || req.user._id;

    // Recruiter's jobs
    const jobs = await Job.find({
      recruiter: recruiterId,
    })
      .populate("company", "name")
      .sort({ createdAt: -1 });

    const jobIds = jobs.map((job) => job._id);

    // Applications
    const applications = await Application.find({
      recruiter: recruiterId,
    })
      .populate("applicant", "name email profileImage")
      .populate("job", "title location jobType")
      .sort({ appliedAt: -1 })
      .limit(10);

    // Interviews
    const interviews = await Interview.find({
      recruiter: recruiterId,
    })
      .populate("candidate", "name email")
      .populate("job", "title")
      .sort({ scheduledAt: 1 });

    // Statistics
    const totalJobs = jobs.length;

    const totalApplicants = await Application.countDocuments({
      recruiter: recruiterId,
    });

    const totalViews = jobs.reduce(
      (total, job) => total + (job.views || 0),
      0
    );

    const upcomingInterviews = interviews.filter(
      (interview) =>
        new Date(interview.scheduledAt) > new Date() &&
        interview.status !== "CANCELLED" &&
        interview.status !== "COMPLETED"
    );

    res.status(200).json({
      success: true,

      stats: {
        totalJobs,
        totalApplicants,
        totalViews,
        upcomingInterviews: upcomingInterviews.length,
      },

      recentApplications: applications,

      jobs,

      interviews: upcomingInterviews.slice(0, 5),
    });
  } catch (error) {
    console.error(
      "Recruiter dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load recruiter dashboard",
    });
  }
};

module.exports = {
  getRecruiterDashboard,
};