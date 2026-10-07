import { useEffect, useState } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Lightbulb,
  Loader2,
  Sparkles,
  Target,
  Upload,
  XCircle,
} from "lucide-react";

import api from "../../services/api";
import { analyzeResume } from "../../services/resumeAnalyzerService";


// =====================================================
// SCORE CARD
// =====================================================

const ScoreCard = ({
  title,
  score,
  icon: Icon,
}) => {
  const safeScore = Math.max(
    0,
    Math.min(100, Number(score) || 0)
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-600">
          <Icon size={18} />

          <span className="text-sm font-medium">
            {title}
          </span>
        </div>

        <span className="text-2xl font-bold text-indigo-600">
          {safeScore}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-700"
          style={{
            width: `${safeScore}%`,
          }}
        />
      </div>
    </div>
  );
};


// =====================================================
// RESULT SECTION
// =====================================================

const ResultSection = ({
  title,
  items = [],
  icon: Icon,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon size={18} />
        </div>

        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>
      </div>

      {items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex gap-3 text-sm leading-6 text-slate-600"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />

              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-400">
          No suggestions available.
        </p>
      )}
    </div>
  );
};


// =====================================================
// TAG SECTION
// =====================================================

const TagSection = ({
  title,
  items = [],
  positive = false,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-slate-900">
        {title}
      </h3>

      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                positive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">
          None identified.
        </p>
      )}
    </div>
  );
};


// =====================================================
// MAIN COMPONENT
// =====================================================

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);

  const [jobs, setJobs] = useState([]);

  const [jobId, setJobId] = useState("");

  const [analysis, setAnalysis] = useState(null);

  const [loading, setLoading] = useState(false);

  const [jobsLoading, setJobsLoading] = useState(true);

  const [error, setError] = useState("");

  // ---------------------------------------------------
  // LOAD JOBS
  // ---------------------------------------------------

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setJobsLoading(true);

        const response = await api.get(
          "/jobs?limit=20&page=1"
        );

        setJobs(response.data.jobs || []);
      } catch (error) {
        console.error(
          "Failed to load jobs:",
          error
        );
      } finally {
        setJobsLoading(false);
      }
    };

    loadJobs();
  }, []);

  // ---------------------------------------------------
  // FILE CHANGE
  // ---------------------------------------------------

  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    setError("");
    setAnalysis(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // PDF validation

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      setError(
        "Only PDF resumes are supported."
      );

      setFile(null);

      return;
    }

    // 5MB validation

    if (
      selectedFile.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Resume must be smaller than 5 MB."
      );

      setFile(null);

      return;
    }

    setFile(selectedFile);
  };

  // ---------------------------------------------------
  // ANALYZE
  // ---------------------------------------------------

  const handleAnalyze = async () => {
    if (!file) {
      setError(
        "Please select your resume first."
      );

      return;
    }

    try {
      setLoading(true);

      setError("");

      setAnalysis(null);

      const response =
        await analyzeResume(
          file,
          jobId
        );

      setAnalysis(
        response.analysis
      );
    } catch (error) {
      console.error(
        "Resume analysis failed:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to analyze resume. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // REMOVE FILE
  // ---------------------------------------------------

  const handleRemoveFile = () => {
    setFile(null);
    setAnalysis(null);
    setError("");

    const input =
      document.getElementById(
        "resume-upload"
      );

    if (input) {
      input.value = "";
    }
  };

  // ---------------------------------------------------
  // UI
  // ---------------------------------------------------

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}

      <div>
        <div className="mb-2 flex items-center gap-2 text-indigo-600">
          <Sparkles size={18} />

          <span className="text-sm font-semibold">
            AI Career Assistant
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Resume Analyzer
        </h1>

        <p className="mt-1 max-w-2xl text-slate-500">
          Upload your resume and get AI-powered ATS
          analysis, skill matching, and practical
          improvement suggestions.
        </p>
      </div>


      {/* ============================================ */}
      {/* UPLOAD + JOB */}
      {/* ============================================ */}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

        {/* UPLOAD CARD */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Upload Resume
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Upload a PDF resume up to 5 MB.
            </p>
          </div>

          <label
            htmlFor="resume-upload"
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 px-6 py-12 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Upload size={26} />
            </div>

            <p className="font-semibold text-slate-800">
              {file
                ? "Change resume"
                : "Choose your resume"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              PDF only · Maximum 5 MB
            </p>

            <input
              id="resume-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={
                handleFileChange
              }
            />
          </label>


          {/* SELECTED FILE */}

          {file && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <FileText size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-800">
                  {file.name}
                </p>

                <p className="text-xs text-slate-500">
                  {(
                    file.size /
                    1024 /
                    1024
                  ).toFixed(2)}{" "}
                  MB
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleRemoveFile
                }
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-red-500"
              >
                <XCircle size={19} />
              </button>
            </div>
          )}


          {/* ERROR */}

          {error && (
            <div className="mt-4 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertTriangle
                size={18}
                className="shrink-0"
              />

              <span>{error}</span>
            </div>
          )}
        </div>


        {/* JOB MATCH CARD */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="font-semibold text-slate-900">
              Job Match
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Select a job to compare your resume
              against its requirements.
            </p>
          </div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Select Job
          </label>

          <select
            value={jobId}
            onChange={(event) =>
              setJobId(
                event.target.value
              )
            }
            disabled={jobsLoading}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">
              General Resume Analysis
            </option>

            {!jobsLoading &&
              jobs.map((job) => (
                <option
                  key={job._id}
                  value={job._id}
                >
                  {job.title}
                </option>
              ))}
          </select>

          {jobId && (
            <div className="mt-3 rounded-xl bg-indigo-50 p-3 text-xs leading-5 text-indigo-700">
              AI will compare your resume
              against the selected job's
              skills and requirements.
            </div>
          )}

          <button
            type="button"
            onClick={
              handleAnalyze
            }
            disabled={
              loading || !file
            }
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Analyzing Resume...
              </>
            ) : (
              <>
                <Sparkles size={18} />

                Analyze Resume
              </>
            )}
          </button>
        </div>
      </div>


      {/* ============================================ */}
      {/* RESULTS */}
      {/* ============================================ */}

      {analysis && (
        <div className="space-y-6">

          {/* OVERALL SCORE */}

          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-lg md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div>
                <div className="mb-2 flex items-center gap-2 text-indigo-100">
                  <Sparkles size={18} />

                  <span className="text-sm font-medium">
                    AI Resume Analysis
                  </span>
                </div>

                <h2 className="text-2xl font-bold">
                  Overall Resume Score
                </h2>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-indigo-100">
                  {analysis.summary ||
                    "Your resume has been analyzed using AI."}
                </p>
              </div>


              <div className="flex h-32 w-32 shrink-0 flex-col items-center justify-center rounded-full border-8 border-white/20 bg-white/10">
                <span className="text-4xl font-bold">
                  {analysis.overallScore ??
                    0}
                </span>

                <span className="text-xs text-indigo-100">
                  / 100
                </span>
              </div>
            </div>
          </div>


          {/* SCORE CARDS */}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <ScoreCard
              title="ATS"
              score={
                analysis.atsScore
              }
              icon={Target}
            />

            <ScoreCard
              title="Skills"
              score={
                analysis.skillsScore
              }
              icon={
                CheckCircle2
              }
            />

            <ScoreCard
              title="Experience"
              score={
                analysis.experienceScore
              }
              icon={FileText}
            />

            <ScoreCard
              title="Projects"
              score={
                analysis.projectScore
              }
              icon={Lightbulb}
            />

            <ScoreCard
              title="Education"
              score={
                analysis.educationScore
              }
              icon={Target}
            />
          </div>


          {/* STRENGTHS + IMPROVEMENTS */}

          <div className="grid gap-6 lg:grid-cols-2">
            <ResultSection
              title="Strengths"
              items={
                analysis.strengths
              }
              icon={
                CheckCircle2
              }
            />

            <ResultSection
              title="Areas to Improve"
              items={
                analysis.improvements
              }
              icon={
                AlertTriangle
              }
            />
          </div>


          {/* SKILLS */}

          <div className="grid gap-6 lg:grid-cols-2">
            <TagSection
              title="Matched Skills"
              items={
                analysis.matchedSkills
              }
              positive
            />

            <TagSection
              title="Missing / Recommended Skills"
              items={
                analysis.missingSkills
              }
            />
          </div>


          {/* SUGGESTIONS */}

          <div className="grid gap-6 lg:grid-cols-3">
            <ResultSection
              title="Keyword Suggestions"
              items={
                analysis.keywordSuggestions
              }
              icon={Target}
            />

            <ResultSection
              title="Project Suggestions"
              items={
                analysis.projectSuggestions
              }
              icon={
                Lightbulb
              }
            />

            <ResultSection
              title="Experience Suggestions"
              items={
                analysis.experienceSuggestions
              }
              icon={FileText}
            />
          </div>


          {/* FORMATTING */}

          <ResultSection
            title="Formatting Suggestions"
            items={
              analysis.formattingSuggestions
            }
            icon={
              AlertTriangle
            }
          />
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;