const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
createOrUpdateCompany,
  getCompany,

} = require("../controllers/recruiterController");

const {
  createJob,
  getRecruiterJobs,
  getJobById,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");
const {
  getRecruiterApplications,
  getRecruiterApplicationById,
  updateApplicationStatus,
} = require("../controllers/recruiterApplicationController");
const router = express.Router();

// ==========================================
// COMPANY ROUTES
// ==========================================

router.get(
  "/company",
  protect,
  authorize("RECRUITER"),
  getCompany
);

router.put(
  "/company",
  protect,
  authorize("RECRUITER"),
  createOrUpdateCompany
);


// ==========================================
// JOB ROUTES
// ==========================================

// Create job
router.post(
  "/jobs",
  protect,
  authorize("RECRUITER"),
  createJob
);

// Get recruiter's jobs
router.get(
  "/jobs",
  protect,
  authorize("RECRUITER"),
  getRecruiterJobs
);

// Get single job
router.get(
  "/jobs/:id",
  protect,
  authorize("RECRUITER"),
  getJobById
);

// Update job
router.put(
  "/jobs/:id",
  protect,
  authorize("RECRUITER"),
  updateJob
);

// Delete job
router.delete(
  "/jobs/:id",
  protect,
  authorize("RECRUITER"),
  deleteJob
);


router.get(
  "/applications",
  protect,
  authorize("RECRUITER"),
  getRecruiterApplications
);

router.get(
  "/applications/:id",
  protect,
  authorize("RECRUITER"),
  getRecruiterApplicationById
);

router.put(
  "/applications/:id/status",
  protect,
  authorize("RECRUITER"),
  updateApplicationStatus
);
module.exports = router;