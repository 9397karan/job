const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const analyzeResume = async ({ resumeText, job = null }) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const jobContext = job
    ? `
SELECTED JOB

Job Title:
${job.title || "Not specified"}

Job Description:
${job.description || "Not specified"}

Required Skills:
${job.skills?.length ? job.skills.join(", ") : "Not specified"}

Experience Required:
${job.experienceRequired ?? 0} years

Job Type:
${job.jobType || "Not specified"}

Location:
${job.location || "Not specified"}
`
    : `
NO SPECIFIC JOB SELECTED.

Perform a general ATS-oriented resume analysis.
`;

  const prompt = `
You are an expert ATS resume analyzer and career assistant.

Analyze the resume provided below.

${jobContext}

RESUME:

${resumeText}

Return ONLY valid JSON.

Use exactly this structure:

{
  "overallScore": 0,
  "atsScore": 0,
  "skillsScore": 0,
  "experienceScore": 0,
  "projectScore": 0,
  "educationScore": 0,
  "summary": "",
  "strengths": [],
  "improvements": [],
  "matchedSkills": [],
  "missingSkills": [],
  "keywordSuggestions": [],
  "projectSuggestions": [],
  "experienceSuggestions": [],
  "formattingSuggestions": []
}

RULES:

1. All scores must be integers from 0 to 100.

2. overallScore should represent the overall quality and relevance of the resume.

3. atsScore should evaluate:
   - keyword relevance
   - clear sections
   - readable structure
   - ATS-friendly content
   - relevance to the selected job if one exists

4. skillsScore should evaluate the technical and professional skills shown in the resume.

5. experienceScore should evaluate the relevance and quality of experience.

6. projectScore should evaluate the quality and relevance of projects.

7. educationScore should evaluate education information.

8. Do not invent information.

9. matchedSkills must only contain skills clearly present in the resume.

10. If a job is selected, missingSkills should contain relevant job skills that are absent from the resume.

11. If no job is selected, missingSkills should contain useful skills that could strengthen the candidate's profile based on the resume.

12. Suggestions must be practical.

13. Do not claim that the candidate has experience that is not present.

14. Keep each array concise.

15. summary should be approximately 2-4 sentences.

16. Return JSON only. No markdown. No explanation outside JSON.

RESUME:
${resumeText}
`;

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",

    messages: [
      {
        role: "system",
        content:
          "You are a professional ATS resume analyzer. Always return valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],

    temperature: 0.2,

    response_format: {
      type: "json_object",
    },
  });

  const content = completion.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq returned an empty response.");
  }

  let result;

  try {
    result = JSON.parse(content);
  } catch (error) {
    console.error("Invalid Groq JSON:", content);
    throw new Error("Groq returned invalid JSON.");
  }

  return result;
};

module.exports = {
  analyzeResume,
};