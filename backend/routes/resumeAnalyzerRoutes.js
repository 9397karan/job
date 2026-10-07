const express = require("express");

const {
  analyzeResumeController,
} = require("../controllers/resumeAnalyzerController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
  "/analyze",
  authMiddleware,
  roleMiddleware("JOB_SEEKER"),
  upload.single("resume"),
  analyzeResumeController
);

module.exports = router;