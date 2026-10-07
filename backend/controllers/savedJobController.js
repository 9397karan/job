const SavedJob = require("../models/SavedJob");
const Job = require("../models/Job");

// Save a job
const saveJob = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const existing = await SavedJob.findOne({
      user: userId,
      job: jobId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Job already saved",
      });
    }

    const savedJob = await SavedJob.create({
      user: userId,
      job: jobId,
    });

    const populated = await SavedJob.findById(savedJob._id)
      .populate({
        path: "job",
        populate: {
          path: "company",
          select: "name industry location website",
        },
      });

    res.status(201).json({
      success: true,
      message: "Job saved successfully",
      savedJob: populated,
    });
  } catch (error) {
    console.error("Save job error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save job",
    });
  }
};

// Get saved jobs
const getSavedJobs = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const savedJobs = await SavedJob.find({
      user: userId,
    })
      .populate({
        path: "job",
        populate: {
          path: "company",
          select: "name industry location website",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: savedJobs.length,
      savedJobs,
    });
  } catch (error) {
    console.error("Get saved jobs error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch saved jobs",
    });
  }
};

// Remove saved job
const removeSavedJob = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { jobId } = req.params;

    const savedJob = await SavedJob.findOneAndDelete({
      user: userId,
      job: jobId,
    });

    if (!savedJob) {
      return res.status(404).json({
        success: false,
        message: "Saved job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job removed from saved jobs",
    });
  } catch (error) {
    console.error("Remove saved job error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove saved job",
    });
  }
};

module.exports = {
  saveJob,
  getSavedJobs,
  removeSavedJob,
};