const express = require("express");

const {
  getAdminDashboard,
  getAdminUsers,
  getAdminCompanies,
  getAdminJobs,
  getAdminApplicationStats,
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("ADMIN"));

router.get(
  "/dashboard",
  getAdminDashboard
);

router.get(
  "/users",
  getAdminUsers
);

router.get(
  "/companies",
  getAdminCompanies
);

router.get(
  "/jobs",
  getAdminJobs
);

router.get(
  "/applications/stats",
  getAdminApplicationStats
);

module.exports = router;