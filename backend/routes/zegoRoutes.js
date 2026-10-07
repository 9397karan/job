const express = require("express");

const {
  getZegoToken,
} = require(
  "../controllers/zegoController"
);

const protect =
  require("../middleware/authMiddleware");

const authorize =
  require("../middleware/roleMiddleware");

const router =
  express.Router();

router.get(
  "/:id/zego-token",
  protect,
  authorize(
    "JOB_SEEKER",
    "RECRUITER"
  ),
  getZegoToken
);

module.exports = router;