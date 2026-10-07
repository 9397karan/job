const express = require("express");

const {
  getRecruiterDashboard,
} = require("../controllers/recruiterDashboardController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");


const router = express.Router();

router.get(
  "/",
  protect,
  authorize("RECRUITER"),
  getRecruiterDashboard
);

module.exports = router;