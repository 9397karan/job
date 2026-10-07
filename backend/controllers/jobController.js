const Job = require("../models/Job");
const Company = require("../models/Company");

// ==========================================
// CREATE JOB
// ==========================================
const createJob = async (req, res) => {
  try {
    const recruiterId = req.user.id || req.user._id;

    if (!recruiterId) {
      return res.status(401).json({
        success: false,
        message: "Recruiter ID not found",
      });
    }

    const {
      title,
      description,
      skills,
      location,
      jobType,
      salaryMin,
      salaryMax,
      experienceRequired,
      vacancies,
    } = req.body;

    // Validate required fields
    if (!title || !description || !location) {
      return res.status(400).json({
        success: false,
        message: "Title, description and location are required",
      });
    }

    // Find recruiter's company
    const company = await Company.findOne({
      recruiter: recruiterId,
    });

    if (!company) {
      return res.status(400).json({
        success: false,
        message:
          "Please create your company profile before posting a job.",
      });
    }

    // Create job
    const job = await Job.create({
      recruiter: recruiterId,
      company: company._id,
      title: title.trim(),
      description: description.trim(),
      skills: Array.isArray(skills) ? skills : [],
      location: location.trim(),
      jobType: jobType || "FULL_TIME",
      salaryMin:
        salaryMin !== undefined && salaryMin !== ""
          ? Number(salaryMin)
          : undefined,
      salaryMax:
        salaryMax !== undefined && salaryMax !== ""
          ? Number(salaryMax)
          : undefined,
      experienceRequired:
        experienceRequired !== undefined &&
        experienceRequired !== ""
          ? Number(experienceRequired)
          : 0,
      vacancies:
        vacancies !== undefined && vacancies !== ""
          ? Number(vacancies)
          : 1,
    });

    const populatedJob = await Job.findById(job._id)
      .populate("company", "name industry location website");

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      job: populatedJob,
    });

  } catch (error) {
    console.error("Create job error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create job",
    });
  }
};
// ==========================================
// GET ALL RECRUITER JOBS
// ==========================================
const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      recruiter: req.user.id,
    })
      .populate("company", "name logo industry location")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Get recruiter jobs error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
    });
  }
};

// ==========================================
// GET SINGLE JOB
// ==========================================
const getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      recruiter: req.user.id,
    })
      .populate("company", "name logo industry location website")
      .populate("recruiter", "name email");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Get job error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch job",
    });
  }
};

// ==========================================
// UPDATE JOB
// ==========================================
const updateJob = async (req, res) => {
  try {
    const {
      title,
      description,
      skills,
      location,
      jobType,
      salaryMin,
      salaryMax,
      experienceRequired,
      vacancies,
    } = req.body;

    const job = await Job.findOne({
      _id: req.params.id,
      recruiter: req.user.id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Salary validation
    const newSalaryMin =
      salaryMin !== undefined ? salaryMin : job.salaryMin;

    const newSalaryMax =
      salaryMax !== undefined ? salaryMax : job.salaryMax;

    if (
      newSalaryMin !== undefined &&
      newSalaryMax !== undefined &&
      Number(newSalaryMin) > Number(newSalaryMax)
    ) {
      return res.status(400).json({
        success: false,
        message: "Minimum salary cannot be greater than maximum salary",
      });
    }

    // Update only provided fields
    if (title !== undefined) job.title = title;
    if (description !== undefined) job.description = description;
    if (skills !== undefined) {
      job.skills = Array.isArray(skills) ? skills : [];
    }
    if (location !== undefined) job.location = location;
    if (jobType !== undefined) job.jobType = jobType;
    if (salaryMin !== undefined) job.salaryMin = salaryMin;
    if (salaryMax !== undefined) job.salaryMax = salaryMax;
    if (experienceRequired !== undefined) {
      job.experienceRequired = experienceRequired;
    }
    if (vacancies !== undefined) {
      job.vacancies = vacancies;
    }

    await job.save();

    const updatedJob = await Job.findById(job._id)
      .populate("company", "name logo industry location")
      .populate("recruiter", "name email");

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Update job error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update job",
    });
  }
};

// ==========================================
// DELETE JOB
// ==========================================
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      recruiter: req.user.id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    await Job.findByIdAndDelete(job._id);

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete job error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete job",
    });
  }
};

module.exports = {
  createJob,
  getRecruiterJobs,
  getJobById,
  updateJob,
  deleteJob,
};