const express = require("express");

const {
  getJobs,
  getJobDetails,
} = require("../controllers/jobSearchController");

const router = express.Router();

// Get jobs / search / filter
router.get("/", getJobs);

// Get single job details
router.get("/:id", getJobDetails);

module.exports = router;