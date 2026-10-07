import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  DollarSign,
  FileText,
  GraduationCap,
  MapPin,
  Plus,
  Save,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";

const CreateJob = () => {
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    jobType: "FULL_TIME",
    salaryMin: "",
    salaryMax: "",
    experienceRequired: 0,
    vacancies: 1,
    skills: [],
  });

  const [skillInput, setSkillInput] = useState("");

  const [loadingCompany, setLoadingCompany] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await api.get("/recruiter/company");

        const data =
          response.data?.company ||
          response.data?.data ||
          null;

        setCompany(data);

        if (data?.location) {
          setForm((prev) => ({
            ...prev,
            location: data.location,
          }));
        }
      } catch (err) {
        console.error("Company fetch error:", err);
      } finally {
        setLoadingCompany(false);
      }
    };

    fetchCompany();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) return;

    const exists = form.skills.some(
      (item) => item.toLowerCase() === skill.toLowerCase()
    );

    if (exists) {
      setSkillInput("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
    }));

    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((item) => item !== skill),
    }));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      return "Job title is required.";
    }

    if (!form.description.trim()) {
      return "Job description is required.";
    }

    if (!form.location.trim()) {
      return "Job location is required.";
    }

    if (
      form.salaryMin !== "" &&
      form.salaryMax !== "" &&
      Number(form.salaryMin) > Number(form.salaryMax)
    ) {
      return "Minimum salary cannot be greater than maximum salary.";
    }

    if (Number(form.experienceRequired) < 0) {
      return "Experience cannot be negative.";
    }

    if (Number(form.vacancies) < 1) {
      return "At least one vacancy is required.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        jobType: form.jobType,
        salaryMin:
          form.salaryMin === ""
            ? undefined
            : Number(form.salaryMin),
        salaryMax:
          form.salaryMax === ""
            ? undefined
            : Number(form.salaryMax),
        experienceRequired: Number(
          form.experienceRequired
        ),
        vacancies: Number(form.vacancies),
        skills: form.skills,
      };

      const response = await api.post(
        "/recruiter/jobs",
        payload
      );

      setMessage(
        response.data?.message ||
          "Job posted successfully."
      );

      const createdJob = response.data?.job;

      setTimeout(() => {
        if (createdJob?._id) {
          navigate(`/recruiter/jobs/${createdJob._id}`);
        } else {
          navigate("/recruiter/jobs");
        }
      }, 700);
    } catch (err) {
      console.error("Create job error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to create the job."
      );
    } finally {
      setSaving(false);
    }
  };

  const clearForm = () => {
    setForm({
      title: "",
      description: "",
      location: company?.location || "",
      jobType: "FULL_TIME",
      salaryMin: "",
      salaryMax: "",
      experienceRequired: 0,
      vacancies: 1,
      skills: [],
    });

    setSkillInput("");
    setError("");
    setMessage("");
  };

  if (loadingCompany) {
    return (
      <div>
        <PageHeader
          title="Post a New Job"
          description="Create a new opportunity for candidates."
        />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="h-[700px] animate-pulse rounded-2xl bg-white xl:col-span-2" />
          <div className="h-[500px] animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Post a New Job"
        description="Create a detailed job posting to attract the right candidates."
        action={
          <Link
            to="/recruiter/jobs"
            className="btn btn-outline gap-2 border-slate-300 text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <ArrowLeft size={17} />
            Back to Jobs
          </Link>
        }
      />

      {/* Alerts */}
      {message && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Main Form */}
          <div className="space-y-6 xl:col-span-2">
            {/* Basic Information */}
            <Card>
              <div className="border-b border-slate-200 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                    <BriefcaseBusiness size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Basic Information
                    </h2>

                    <p className="text-sm text-slate-500">
                      Provide the main details of the position.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">
                {/* Job Title */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Job Title
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Full Stack Developer"
                    className="input input-bordered w-full border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Job Type + Location */}
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Job Type
                    </label>

                    <select
                      name="jobType"
                      value={form.jobType}
                      onChange={handleChange}
                      className="select select-bordered w-full border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="FULL_TIME">
                        Full Time
                      </option>

                      <option value="PART_TIME">
                        Part Time
                      </option>

                      <option value="INTERNSHIP">
                        Internship
                      </option>

                      <option value="CONTRACT">
                        Contract
                      </option>

                      <option value="REMOTE">
                        Remote
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Location
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <MapPin
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="e.g. Mumbai, Maharashtra"
                        className="input input-bordered w-full border-slate-300 bg-white pl-10 text-slate-900 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Job Description
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={9}
                    placeholder="Describe the role, responsibilities, expectations and what the candidate will be working on..."
                    className="textarea textarea-bordered w-full border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />

                  <div className="mt-1.5 text-right text-xs text-slate-400">
                    {form.description.length} characters
                  </div>
                </div>
              </div>
            </Card>

            {/* Compensation & Requirements */}
            <Card>
              <div className="border-b border-slate-200 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                    <DollarSign size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Compensation & Requirements
                    </h2>

                    <p className="text-sm text-slate-500">
                      Define salary, experience and vacancy information.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-2">
                {/* Minimum Salary */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Minimum Salary
                  </label>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                      ₹
                    </span>

                    <input
                      type="number"
                      name="salaryMin"
                      min="0"
                      value={form.salaryMin}
                      onChange={handleChange}
                      placeholder="e.g. 400000"
                      className="input input-bordered w-full border-slate-300 bg-white pl-8 text-slate-900 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Maximum Salary */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Maximum Salary
                  </label>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                      ₹
                    </span>

                    <input
                      type="number"
                      name="salaryMax"
                      min="0"
                      value={form.salaryMax}
                      onChange={handleChange}
                      placeholder="e.g. 800000"
                      className="input input-bordered w-full border-slate-300 bg-white pl-8 text-slate-900 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Required Experience
                  </label>

                  <div className="relative">
                    <GraduationCap
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="number"
                      name="experienceRequired"
                      min="0"
                      value={form.experienceRequired}
                      onChange={handleChange}
                      className="input input-bordered w-full border-slate-300 bg-white pl-10 text-slate-900 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-slate-400">
                    Enter required experience in years.
                  </p>
                </div>

                {/* Vacancies */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Number of Vacancies
                  </label>

                  <div className="relative">
                    <Users
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="number"
                      name="vacancies"
                      min="1"
                      value={form.vacancies}
                      onChange={handleChange}
                      className="input input-bordered w-full border-slate-300 bg-white pl-10 text-slate-900 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Skills */}
            <Card>
              <div className="border-b border-slate-200 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                    <Sparkles size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Required Skills
                    </h2>

                    <p className="text-sm text-slate-500">
                      Add technologies and skills candidates should know.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) =>
                      setSkillInput(e.target.value)
                    }
                    onKeyDown={handleSkillKeyDown}
                    placeholder="e.g. React, Node.js, MongoDB"
                    className="input input-bordered flex-1 border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={addSkill}
                    className="btn btn-primary gap-2"
                  >
                    <Plus size={17} />
                    <span className="hidden sm:inline">
                      Add
                    </span>
                  </button>
                </div>

                {form.skills.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {form.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
                      >
                        {skill}

                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="rounded-full p-0.5 transition hover:bg-indigo-200"
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                    <Sparkles
                      size={22}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 text-sm text-slate-500">
                      No skills added yet
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Add skills such as React, Java, Python or SQL.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Preview / Sidebar */}
          <div className="space-y-6">
            {/* Company */}
            <Card>
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Building2 size={21} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Company
                    </p>

                    <p className="truncate font-bold text-slate-900">
                      {company?.name || "Your Company"}
                    </p>
                  </div>
                </div>

                {company?.industry && (
                  <p className="mt-4 text-sm text-slate-500">
                    {company.industry}
                  </p>
                )}
              </div>
            </Card>

            {/* Live Preview */}
            <Card className="overflow-hidden">
              <div className="border-b border-slate-200 p-5">
                <div className="flex items-center gap-2">
                  <Sparkles
                    size={18}
                    className="text-indigo-600"
                  />

                  <h3 className="font-bold text-slate-900">
                    Job Preview
                  </h3>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Preview how candidates will see your posting.
                </p>
              </div>

              <div className="p-5">
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <BriefcaseBusiness size={22} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="break-words font-bold text-slate-900">
                      {form.title || "Your Job Title"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {company?.name || "Company Name"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin
                      size={15}
                      className="text-slate-400"
                    />

                    {form.location || "Job Location"}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <BriefcaseBusiness
                      size={15}
                      className="text-slate-400"
                    />

                    {form.jobType
                      ? form.jobType
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) =>
                            c.toUpperCase()
                          )
                      : "Full Time"}
                  </div>

                  {(form.salaryMin || form.salaryMax) && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <DollarSign
                        size={15}
                        className="text-slate-400"
                      />

                      {form.salaryMin
                        ? `₹${Number(
                            form.salaryMin
                          ).toLocaleString("en-IN")}`
                        : ""}

                      {form.salaryMin && form.salaryMax
                        ? " - "
                        : ""}

                      {form.salaryMax
                        ? `₹${Number(
                            form.salaryMax
                          ).toLocaleString("en-IN")}`
                        : ""}
                    </div>
                  )}
                </div>

                {form.skills.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Skills
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {form.skills.slice(0, 8).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 border-t border-slate-200 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Description
                  </p>

                  <p className="mt-2 line-clamp-6 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {form.description ||
                      "Your job description will appear here as you type."}
                  </p>
                </div>
              </div>
            </Card>

            {/* Posting Tips */}
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-5">
              <div className="flex gap-3">
                <div className="rounded-xl bg-white p-2.5 text-indigo-600 shadow-sm">
                  <FileText size={19} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Posting Tips
                  </h3>

                  <ul className="mt-3 space-y-2 text-sm leading-5 text-slate-600">
                    <li>• Use a clear and specific job title.</li>
                    <li>• Describe responsibilities clearly.</li>
                    <li>• Add relevant technical skills.</li>
                    <li>• Mention a realistic salary range.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={clearForm}
            disabled={saving}
            className="btn btn-outline gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <X size={17} />
            Clear
          </button>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary min-w-44 gap-2"
          >
            {saving ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Publishing...
              </>
            ) : (
              <>
                <Save size={17} />
                Publish Job
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJob;