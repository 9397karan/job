const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  applyForJob,
  getMyApplications,
  getApplicationById,
} = require("../controllers/applicationController");

const router = express.Router();

// Apply for job
router.post(
  "/",
  protect,
  authorize("JOB_SEEKER"),
  applyForJob
);

// Get logged-in user's applications
router.get(
  "/my",
  protect,
  authorize("JOB_SEEKER"),
  getMyApplications
);

// Get single application
router.get(
  "/:id",
  protect,
  authorize("JOB_SEEKER"),
  getApplicationById
);

module.exports = router;