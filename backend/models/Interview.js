const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },

    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    duration: {
      type: Number,
      default: 30,
      min: 5,
    },

    // Internal ZEGOCLOUD room ID
    roomId: {
      type: String,
      required: true,
      unique: true,
    },

    // JobConnect URL
    joinLink: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "SCHEDULED",
        "ONGOING",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "SCHEDULED",
    },

    recordingUrl: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Interview",
  interviewSchema
);