const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  scheduleInterview,
  getRecruiterInterviews,
  getRecruiterInterviewById,
  updateInterviewStatus,
} = require("../controllers/interviewController");

const router = express.Router();

// Schedule interview
router.post(
  "/",
  protect,
  authorize("RECRUITER"),
  scheduleInterview
);

// Get recruiter interviews
router.get(
  "/",
  protect,
  authorize("RECRUITER"),
  getRecruiterInterviews
);

// Get single interview
router.get(
  "/:id",
  protect,
  authorize("RECRUITER"),
  getRecruiterInterviewById
);

// Update interview status
router.put(
  "/:id/status",
  protect,
  authorize("RECRUITER"),
  updateInterviewStatus
);

module.exports = router;