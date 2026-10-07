const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const {
  createNotification,
} = require("../services/notificationService");
// ==========================================
// APPLY FOR JOB
// ==========================================

const applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    // Check job
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check applicant
    const applicant = await User.findById(req.user.id);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Make sure user has a resume
    if (!applicant.resumeUrl) {
      return res.status(400).json({
        success: false,
        message: "Please upload your resume before applying",
      });
    }

    // Check duplicate application
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user.id,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    // Create application
    const application = await Application.create({
      job: job._id,
      applicant: req.user.id,
      recruiter: job.recruiter,
      resumeUrl: applicant.resumeUrl,
      coverLetter: coverLetter || "",
    });
    await createNotification({
  recipient: job.recruiter,
  sender: req.user.id,
  type: "APPLICATION",
  title: "New Job Application",
  message: `${applicant.name} applied for ${job.title}`,
  relatedJob: job._id,
  relatedApplication: application._id,
});

    const populatedApplication = await Application.findById(
      application._id
    )
      .populate("job", "title location jobType salaryMin salaryMax")
      .populate("applicant", "name email phone")
      .populate("recruiter", "name email");

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application: populatedApplication,
    });
  } catch (error) {
    console.error("Apply for job error:", error);

    // Handle duplicate MongoDB index
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to submit application",
    });
  }
};

// ==========================================
// GET MY APPLICATIONS
// ==========================================
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      applicant: req.user.id,
    })
      .populate(
        "job",
        "title location jobType salaryMin salaryMax company"
      )
      .populate("recruiter", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get my applications error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
};

// ==========================================
// GET SINGLE APPLICATION
// ==========================================
const getApplicationById = async (req, res) => {
  try {
    const applicantId = req.user.id || req.user._id;

    const application = await Application.findOne({
      _id: req.params.id,
      applicant: applicantId,
    })
      .populate({
        path: "job",
        populate: {
          path: "company",
          select: "name industry location website logo",
        },
      })
      .populate("recruiter", "name email");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Get application error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get application",
    });
  }
};
module.exports = {
  applyForJob,
  getMyApplications,
  getApplicationById,
};