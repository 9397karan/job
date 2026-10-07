const Company = require("../models/Company");

// ==========================================
// GET COMPANY
// ==========================================

const getCompany = async (req, res) => {
  try {
    const recruiterId = req.user.id || req.user._id;

    if (!recruiterId) {
      return res.status(401).json({
        success: false,
        message: "Recruiter ID not found",
      });
    }

    const company = await Company.findOne({
      recruiter: recruiterId,
    });

    // Company doesn't exist yet
    if (!company) {
      return res.status(200).json({
        success: true,
        company: null,
      });
    }

    res.status(200).json({
      success: true,
      company,
    });

  } catch (error) {
    console.error("Get company error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch company profile",
    });
  }
};


// ==========================================
// CREATE / UPDATE COMPANY
// ==========================================

const createOrUpdateCompany = async (req, res) => {
  try {
    const recruiterId = req.user.id || req.user._id;

    // Check recruiter ID
    if (!recruiterId) {
      return res.status(401).json({
        success: false,
        message: "Recruiter ID not found",
      });
    }

    const {
      name,
      description,
      industry,
      website,
      location,
    } = req.body;

    // Validate company name
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    // Check existing company
    let company = await Company.findOne({
      recruiter: recruiterId,
    });

    // ==========================================
    // CREATE
    // ==========================================

    if (!company) {
      company = await Company.create({
        recruiter: recruiterId,
        name: name.trim(),
        description: description?.trim() || "",
        industry: industry?.trim() || "",
        website: website?.trim() || "",
        location: location?.trim() || "",
      });

      return res.status(201).json({
        success: true,
        message: "Company created successfully",
        company,
      });
    }

    // ==========================================
    // UPDATE
    // ==========================================

    company.name = name.trim();
    company.description = description?.trim() || "";
    company.industry = industry?.trim() || "";
    company.website = website?.trim() || "";
    company.location = location?.trim() || "";

    await company.save();

    res.status(200).json({
      success: true,
      message: "Company profile updated successfully",
      company,
    });

  } catch (error) {
    console.error("Create/Update company error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save company profile",
    });
  }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  getCompany,
  createOrUpdateCompany,
};