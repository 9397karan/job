const Job = require("../models/Job");

// ==========================================
// GET ALL JOBS / SEARCH JOBS
// ==========================================
const getJobs = async (req, res) => {
  try {
    const {
      search,
      location,
      jobType,
      skill,
      minSalary,
      maxSalary,
      page = 1,
      limit = 20,
    } = req.query;

    // Keep pagination within SRS limit
    const currentPage = Math.max(Number(page) || 1, 1);
    const perPage = Math.min(Math.max(Number(limit) || 20, 1), 20);

    const skip = (currentPage - 1) * perPage;

    // Build query
    const query = {};

    // Search title + description
    if (search && search.trim()) {
      query.$text = {
        $search: search.trim(),
      };
    }

    // Location filter
    if (location && location.trim()) {
      query.location = {
        $regex: location.trim(),
        $options: "i",
      };
    }

    // Job type filter
    if (jobType && jobType.trim()) {
      query.jobType = jobType.trim().toUpperCase();
    }

    // Skill filter
    if (skill && skill.trim()) {
      query.skills = {
        $regex: skill.trim(),
        $options: "i",
      };
    }

    // Minimum salary
    if (minSalary !== undefined) {
      const value = Number(minSalary);

      if (!Number.isNaN(value)) {
        query.salaryMax = {
          $gte: value,
        };
      }
    }

    // Maximum salary
    if (maxSalary !== undefined) {
      const value = Number(maxSalary);

      if (!Number.isNaN(value)) {
        query.salaryMin = {
          ...(query.salaryMin || {}),
          $lte: value,
        };
      }
    }

    // Fetch total count
    const totalJobs = await Job.countDocuments(query);

    // Fetch jobs
    const jobs = await Job.find(query)
      .populate(
        "company",
        "name logo industry location website"
      )
      .populate(
        "recruiter",
        "name"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean();

    const totalPages = Math.ceil(totalJobs / perPage);

    res.status(200).json({
      success: true,
      count: jobs.length,
      totalJobs,
      totalPages,
      currentPage,
      jobs,
    });
  } catch (error) {
    console.error("Get jobs error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
    });
  }
};

// ==========================================
// GET SINGLE JOB DETAILS
// ==========================================
const getJobDetails = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate(
        "company",
        "name description logo industry website location"
      )
      .populate(
        "recruiter",
        "name email"
      );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Increase views
    job.views += 1;
    await job.save();

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Get job details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch job details",
    });
  }
};

module.exports = {
  getJobs,
  getJobDetails,
};