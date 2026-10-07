const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Any authenticated user
router.get("/protected", protect, (req, res) => {
  res.json({
    success: true,
    message: "You are authenticated",
    user: req.user,
  });
});

// Job Seeker only
router.get(
  "/job-seeker",
  protect,
  authorize("JOB_SEEKER"),
  (req, res) => {
    res.json({
      success: true,
      message: "Job Seeker route accessed",
    });
  }
);

// Recruiter only
router.get(
  "/recruiter",
  protect,
  authorize("RECRUITER"),
  (req, res) => {
    res.json({
      success: true,
      message: "Recruiter route accessed",
    });
  }
);

// Admin only
router.get(
  "/admin",
  protect,
  authorize("ADMIN"),
  (req, res) => {
    res.json({
      success: true,
      message: "Admin route accessed",
    });
  }
);

module.exports = router;