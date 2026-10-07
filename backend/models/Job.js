const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    location: {
      type: String,
      required: true,
      trim: true,
    },

    jobType: {
      type: String,
      enum: [
        "FULL_TIME",
        "PART_TIME",
        "INTERNSHIP",
        "CONTRACT",
        "REMOTE",
      ],
      default: "FULL_TIME",
    },

    salaryMin: {
      type: Number,
      min: 0,
    },

    salaryMax: {
      type: Number,
      min: 0,
    },

    experienceRequired: {
      type: Number,
      min: 0,
      default: 0,
    },

    vacancies: {
      type: Number,
      min: 1,
      default: 1,
    },

    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Search indexes
jobSchema.index({
  title: "text",
  description: "text",
});

jobSchema.index({ location: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ recruiter: 1 });

module.exports = mongoose.model("Job", jobSchema);