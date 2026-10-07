const Interview = require("../models/Interview");
const Application = require("../models/Application");

const {
  createNotification,
} = require("../services/notificationService");

const scheduleInterview = async (
  req,
  res
) => {
  try {
    const recruiterId =
      req.user.id || req.user._id;

    const {
      applicationId,
      scheduledAt,
      duration,
    } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message:
          "Application ID is required",
      });
    }

    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        message:
          "Interview date and time are required",
      });
    }

    // ==========================================
    // FIND APPLICATION
    // ==========================================

    const application =
      await Application.findOne({
        _id: applicationId,
        recruiter: recruiterId,
      })
        .populate(
          "applicant",
          "name email"
        )
        .populate(
          "job",
          "title location jobType"
        );

    if (!application) {
      return res.status(404).json({
        success: false,
        message:
          "Application not found",
      });
    }

    // ==========================================
    // DATE VALIDATION
    // ==========================================

    const interviewDate =
      new Date(scheduledAt);

    if (
      Number.isNaN(
        interviewDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid interview date",
      });
    }

    if (
      interviewDate <= new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Interview must be scheduled in the future",
      });
    }

    // ==========================================
    // CHECK EXISTING INTERVIEW
    // ==========================================

    const existingInterview =
      await Interview.findOne({
        application: applicationId,

        status: {
          $in: [
            "SCHEDULED",
            "ONGOING",
          ],
        },
      });

    if (existingInterview) {
      return res.status(400).json({
        success: false,
        message:
          "An active interview already exists for this application",
      });
    }

    // ==========================================
    // GENERATE ROOM ID AUTOMATICALLY
    // ==========================================

    const roomId =
      `jobconnect_${applicationId}_${Date.now()}`;

    // ==========================================
    // CREATE INTERVIEW
    // ==========================================

    const interview =
      await Interview.create({
        application:
          applicationId,

        recruiter:
          recruiterId,

        candidate:
          application.applicant._id,

        job:
          application.job._id,

        scheduledAt:
          interviewDate,

        duration:
          Number(duration) || 30,

        roomId,

        status:
          "SCHEDULED",
      });

    // ==========================================
    // GENERATE JOBCONNECT JOIN LINK
    // ==========================================

    const clientUrl =
      process.env.CLIENT_URL ||
      "http://localhost:5173";

    const joinLink =
      `${clientUrl}/interview-room/${interview._id}`;

    interview.joinLink =
      joinLink;

    await interview.save();

    // ==========================================
    // UPDATE APPLICATION
    // ==========================================

    application.status =
      "INTERVIEW_SCHEDULED";

    application.reviewedAt =
      new Date();

    await application.save();

    // ==========================================
    // REAL-TIME WEB NOTIFICATION
    // ==========================================

    await createNotification({
      recipient:
        application.applicant._id,

      sender:
        recruiterId,

      type:
        "INTERVIEW",

      title:
        "Interview Scheduled",

      message:
        `Your interview for "${application.job.title}" has been scheduled for ${interviewDate.toLocaleString(
          "en-IN"
        )}.`,

      relatedInterview:
        interview._id,

      relatedApplication:
        application._id,

      relatedJob:
        application.job._id,
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    const populatedInterview =
      await Interview.findById(
        interview._id
      )
        .populate(
          "candidate",
          "name email"
        )
        .populate(
          "recruiter",
          "name email"
        )
        .populate(
          "job",
          "title location jobType"
        )
        .populate(
          "application",
          "status"
        );

    return res.status(201).json({
      success: true,

      message:
        "Interview scheduled successfully",

      interview:
        populatedInterview,
    });

  } catch (error) {
    console.error(
      "Schedule interview error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to schedule interview",
    });
  }
};

// ==========================================
// GET CANDIDATE INTERVIEWS
// ==========================================

const getCandidateInterviews = async (req, res) => {
  try {
    const candidateId = req.user.id || req.user._id;

    if (!candidateId) {
      return res.status(401).json({
        success: false,
        message: "Candidate ID not found",
      });
    }

    const interviews = await Interview.find({
      candidate: candidateId,
    })
      .populate(
        "job",
        "title location jobType company"
      )
      .populate(
        "recruiter",
        "name email"
      )
      .populate(
        "application",
        "status coverLetter"
      )
      .sort({ scheduledAt: 1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });

  } catch (error) {
    console.error(
      "Get candidate interviews error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch candidate interviews",
    });
  }
};

// ==========================================
// GET RECRUITER INTERVIEWS
// ==========================================
const getRecruiterInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({
      recruiter: req.user.id,
    })
      .populate("candidate", "name email")
      .populate("job", "title")
      .populate("application", "status")
      .sort({ scheduledAt: 1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    console.error("Get recruiter interviews error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch interviews",
    });
  }
};

// ==========================================
// GET SINGLE RECRUITER INTERVIEW
// ==========================================
const getRecruiterInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      recruiter: req.user.id,
    })
      .populate("candidate", "name email phone")
      .populate("job", "title description location")
      .populate("application", "status coverLetter")
      .populate("recruiter", "name email");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error("Get recruiter interview error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch interview",
    });
  }
};

// ==========================================
// UPDATE INTERVIEW STATUS
// ==========================================
const updateInterviewStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "ONGOING",
      "COMPLETED",
      "CANCELLED",
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Interview status is required",
      });
    }

    const normalizedStatus = status.toUpperCase();

    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview status",
      });
    }

    const interview = await Interview.findOne({
      _id: req.params.id,
      recruiter: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    interview.status = normalizedStatus;

    await interview.save();

    res.status(200).json({
      success: true,
      message: "Interview status updated successfully",
      interview,
    });
  } catch (error) {
    console.error("Update interview status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update interview status",
    });
  }
};


module.exports = {
  scheduleInterview,
  getRecruiterInterviews,
  getRecruiterInterviewById,
  updateInterviewStatus,
  getCandidateInterviews
};