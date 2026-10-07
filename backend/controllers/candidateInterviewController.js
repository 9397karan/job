const Interview =
  require("../models/Interview");

const getCandidateInterviews =
  async (req, res) => {
    try {
      const candidateId =
        req.user.id ||
        req.user._id;

      if (!candidateId) {
        return res.status(401).json({
          success: false,
          message:
            "Candidate ID not found",
        });
      }

      const interviews =
        await Interview.find({
          candidate: candidateId,
        })
          .populate({
            path: "job",
            select:
              "title location jobType company",

            populate: {
              path: "company",

              select:
                "name industry location website logo",
            },
          })

          .populate(
            "recruiter",
            "name email"
          )

          .populate(
            "application",
            "status coverLetter"
          )

          .sort({
            scheduledAt: 1,
          });

      return res.status(200).json({
        success: true,

        count:
          interviews.length,

        interviews,
      });

    } catch (error) {
      console.error(
        "Get candidate interviews error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch interviews",
      });
    }
  };

module.exports = {
  getCandidateInterviews,
};