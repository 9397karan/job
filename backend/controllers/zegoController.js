const Interview = require("../models/Interview");

const {
  generateToken04,
} = require("../utils/zegoServerAssistant");

const getZegoToken = async (req, res) => {
  try {
    const userId =
      req.user.id || req.user._id;

    const interviewId = req.params.id;

    // ==========================================
    // FIND INTERVIEW
    // ==========================================

    const interview =
      await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // ==========================================
    // CHECK USER ACCESS
    // ==========================================

    const recruiterId =
      interview.recruiter.toString();

    const candidateId =
      interview.candidate.toString();

    const currentUserId =
      userId.toString();

    if (
      currentUserId !== recruiterId &&
      currentUserId !== candidateId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to join this interview",
      });
    }

    // ==========================================
    // CHECK INTERVIEW STATUS
    // ==========================================

    if (interview.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message:
          "This interview has been cancelled",
      });
    }

    // ==========================================
    // ZEGO CONFIG
    // ==========================================

    const appId = Number(
      process.env.ZEGO_APP_ID
    );

    const serverSecret =
      process.env.ZEGO_SERVER_SECRET;

    if (!appId) {
      return res.status(500).json({
        success: false,
        message:
          "ZEGO_APP_ID is missing",
      });
    }

    if (!serverSecret) {
      return res.status(500).json({
        success: false,
        message:
          "ZEGO_SERVER_SECRET is missing",
      });
    }

    // ==========================================
    // GENERATE TOKEN04
    // ==========================================

    const token = generateToken04(
      appId,
      currentUserId,
      serverSecret,
      60 * 60,
      ""
    );

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      appId,

      token,

      roomId:
        interview.roomId,

      userId:
        currentUserId,

      userName:
        req.user.name ||
        "JobConnect User",
    });

  } catch (error) {
    console.error(
      "Zego token error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate interview credentials",
    });
  }
};

module.exports = {
  getZegoToken,
};