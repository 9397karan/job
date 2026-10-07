const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  getProfile,
  updateProfile,
  uploadResume,
} = require("../controllers/jobSeekerController");
const upload = require("../config/uploadMiddleware");
const router = express.Router();

// ==========================================
// JOB SEEKER PROFILE
// ==========================================

router.get(
  "/profile",
  protect,
  authorize("JOB_SEEKER"),
  getProfile
);

router.put(
  "/profile",
  protect,
  authorize("JOB_SEEKER"),
  updateProfile
);

router.post(
  "/resume",
  protect,
  authorize("JOB_SEEKER"),
  upload.single("resume"),
  uploadResume
);
module.exports = router;