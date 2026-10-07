const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  saveJob,
  getSavedJobs,
  removeSavedJob,
} = require("../controllers/savedJobController");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("JOB_SEEKER"),
  saveJob
);

router.get(
  "/",
  protect,
  authorize("JOB_SEEKER"),
  getSavedJobs
);

router.delete(
  "/:jobId",
  protect,
  authorize("JOB_SEEKER"),
  removeSavedJob
);

module.exports = router;