const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
// ==========================================
// GET JOB SEEKER PROFILE
// ==========================================

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "JOB_SEEKER") {
      return res.status(403).json({
        success: false,
        message: "Only Job Seekers can access this profile",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// UPDATE JOB SEEKER PROFILE
// ==========================================

const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      bio,
      skills,
      education,
      experience,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "JOB_SEEKER") {
      return res.status(403).json({
        success: false,
        message: "Only Job Seekers can update this profile",
      });
    }

    // Update only provided fields

    if (name !== undefined) {
      user.name = name;
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    if (bio !== undefined) {
      user.bio = bio;
    }

    if (skills !== undefined) {
      if (!Array.isArray(skills)) {
        return res.status(400).json({
          success: false,
          message: "Skills must be an array",
        });
      }

      user.skills = skills;
    }

    if (education !== undefined) {
      if (!Array.isArray(education)) {
        return res.status(400).json({
          success: false,
          message: "Education must be an array",
        });
      }

      user.education = education;
    }

    if (experience !== undefined) {
      if (!Array.isArray(experience)) {
        return res.status(400).json({
          success: false,
          message: "Experience must be an array",
        });
      }

      user.experience = experience;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
        skills: user.skills,
        education: user.education,
        experience: user.experience,
        resumeUrl: user.resumeUrl,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF resume",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "JOB_SEEKER") {
      return res.status(403).json({
        success: false,
        message: "Only Job Seekers can upload resumes",
      });
    }

    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "jobconnect/resumes",

            resource_type: "image",

            public_id: `resume_${user._id}_${Date.now()}`,

            format: "pdf",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        streamifier
          .createReadStream(req.file.buffer)
          .pipe(stream);
      });
    };

    const result = await uploadToCloudinary();

    user.resumeUrl = result.secure_url;
    user.resumePublicId = result.public_id;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resumeUrl: user.resumeUrl,
      publicId: user.resumePublicId,
    });
  } catch (error) {
    console.error("Resume upload error:", error);

    res.status(500).json({
      success: false,
      message: "Resume upload failed",
    });
  }
};
module.exports = {
  getProfile,
  uploadResume,
  updateProfile,
};