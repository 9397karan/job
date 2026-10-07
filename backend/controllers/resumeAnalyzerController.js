const { PDFParse } = require("pdf-parse");

const Job = require("../models/Job");

const {
  analyzeResume,
} = require("../services/groqService");

const analyzeResumeController = async (req, res) => {
  try {
    // ---------------------------------------
    // 1. Check uploaded file
    // ---------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF resume.",
      });
    }

    // ---------------------------------------
    // 2. Validate PDF
    // ---------------------------------------

    if (
      req.file.mimetype !== "application/pdf" &&
      !req.file.originalname.toLowerCase().endsWith(".pdf")
    ) {
      return res.status(400).json({
        success: false,
        message: "Only PDF resumes are supported.",
      });
    }

    // ---------------------------------------
    // 3. Validate size
    // ---------------------------------------

    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "Resume must be smaller than 5 MB.",
      });
    }

    // ---------------------------------------
    // 4. Get selected job
    // ---------------------------------------

    let job = null;

    if (req.body.jobId) {
      job = await Job.findById(req.body.jobId).select(
        "title description skills experienceRequired jobType location company"
      );

      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Selected job was not found.",
        });
      }
    }

    // ---------------------------------------
    // 5. Parse PDF
    // ---------------------------------------

    const parser = new PDFParse({
      data: req.file.buffer,
    });

    const pdfData = await parser.getText();

    // Important: free parser resources
    await parser.destroy();

    const resumeText = pdfData.text?.trim();

    // ---------------------------------------
    // 6. Check extracted text
    // ---------------------------------------

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message:
          "Could not extract text from this PDF. Please upload a text-based PDF resume.",
      });
    }

    if (resumeText.length < 100) {
      return res.status(400).json({
        success: false,
        message:
          "The resume contains too little readable text for analysis.",
      });
    }

    // ---------------------------------------
    // 7. Limit resume text
    // ---------------------------------------

    const limitedResumeText =
      resumeText.slice(0, 20000);

    // ---------------------------------------
    // 8. Send to Groq
    // ---------------------------------------

    const analysis = await analyzeResume({
      resumeText: limitedResumeText,
      job,
    });

    // ---------------------------------------
    // 9. Response
    // ---------------------------------------

    return res.status(200).json({
      success: true,
      message: "Resume analyzed successfully.",
      analysis,
    });
  } catch (error) {
    console.error(
      "RESUME ANALYZER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to analyze resume.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

module.exports = {
  analyzeResumeController,
};