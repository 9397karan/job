const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["JOB_SEEKER", "RECRUITER", "ADMIN"],
      default: "JOB_SEEKER",
      required: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    education: [
      {
        degree: {
          type: String,
          trim: true,
        },
        institution: {
          type: String,
          trim: true,
        },
        startYear: Number,
        endYear: Number,
      },
    ],

    experience: [
      {
        company: {
          type: String,
          trim: true,
        },
        position: {
          type: String,
          trim: true,
        },
        startDate: Date,
        endDate: Date,
        description: {
          type: String,
          trim: true,
        },
      },
    ],

    resumeUrl: {
      type: String,
      default: "",
    },

    resumePublicId: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isSuspended: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);