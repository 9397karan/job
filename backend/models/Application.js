const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resumeUrl: {
      type: String,
      default: "",
    },

    coverLetter: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "APPLIED",
        "UNDER_REVIEW",
        "INTERVIEW_SCHEDULED",
        "ACCEPTED",
        "REJECTED",
      ],
      default: "APPLIED",
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },

    reviewedAt: {
      type: Date,
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

// Prevent duplicate applications
applicationSchema.index(
  { job: 1, applicant: 1 },
  { unique: true }
);

applicationSchema.index({ applicant: 1 });
applicationSchema.index({ recruiter: 1 });
applicationSchema.index({ status: 1 });

module.exports = mongoose.model(
  "Application",
  applicationSchema
);