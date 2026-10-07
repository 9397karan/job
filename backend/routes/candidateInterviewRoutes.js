const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  getCandidateInterviews,
} = require("../controllers/interviewController");

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("JOB_SEEKER"),
  getCandidateInterviews
);

module.exports = router;