const Application = require("../models/Application");

/*
|--------------------------------------------------------------------------
| Get Recruiter's Applications
|--------------------------------------------------------------------------
| GET /api/recruiter/applications
| Optional:
| GET /api/recruiter/applications?job=JOB_ID
|--------------------------------------------------------------------------
*/
const getRecruiterApplications = async (req, res) => {
  try {
    const recruiterId = req.user.id || req.user._id;
    const { job } = req.query;

    const filter = {
      recruiter: recruiterId,
    };

    // Filter by specific job
    if (job) {
      filter.job = job;
    }

    const applications = await Application.find(filter)
      .populate(
        "applicant",
        "name email phone profileImage skills education experience resumeUrl"
      )
      .populate({
        path: "job",
        select:
          "title location jobType salaryMin salaryMax experienceRequired vacancies company",
        populate: {
          path: "company",
          select: "name industry location logo website",
        },
      })
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error(
      "Get recruiter applications error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Single Recruiter Application
|--------------------------------------------------------------------------
| GET /api/recruiter/applications/:id
|--------------------------------------------------------------------------
*/
const getRecruiterApplicationById = async (req, res) => {
  try {
    const recruiterId = req.user.id || req.user._id;

    const application = await Application.findOne({
      _id: req.params.id,
      recruiter: recruiterId,
    })
      .populate(
        "applicant",
        "name email phone profileImage skills education experience resumeUrl"
      )
      .populate({
        path: "job",
        select:
          "title description skills location jobType salaryMin salaryMax experienceRequired vacancies company",
        populate: {
          path: "company",
          select: "name industry location logo website",
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
    console.error(
      "Get recruiter application error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch application",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update Application Status
|--------------------------------------------------------------------------
| PUT /api/recruiter/applications/:id/status
|--------------------------------------------------------------------------
*/
const updateApplicationStatus = async (req, res) => {
  try {
    const recruiterId = req.user.id || req.user._id;

    const { status, notes } = req.body;

    const allowedStatuses = [
      "APPLIED",
      "UNDER_REVIEW",
      "INTERVIEW_SCHEDULED",
      "ACCEPTED",
      "REJECTED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      recruiter: recruiterId,
    }).populate("job", "title");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    application.status = status;
    application.reviewedAt = new Date();

    if (notes !== undefined) {
      application.notes = notes;
    }

    await application.save();

    const updatedApplication =
      await Application.findById(application._id)
        .populate(
          "applicant",
          "name email phone profileImage"
        )
        .populate({
          path: "job",
          select:
            "title location jobType salaryMin salaryMax company",
          populate: {
            path: "company",
            select:
              "name industry location logo website",
          },
        })
        .populate("recruiter", "name email");

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application: updatedApplication,
    });
  } catch (error) {
    console.error(
      "Update application status error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update application status",
    });
  }
};

module.exports = {
  getRecruiterApplications,
  getRecruiterApplicationById,
  updateApplicationStatus,
};