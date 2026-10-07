import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  Trash2,
} from "lucide-react";

import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";

const EditJob = () => {
  const { id } = useParams();
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [jobResponse, companyResponse] = await Promise.all([
        api.get(`/recruiter/jobs/${id}`),
        api.get("/recruiter/company"),
      ]);

      const job =
        jobResponse.data?.job ||
        jobResponse.data?.data ||
        null;

      const companyData =
        companyResponse.data?.company ||
        companyResponse.data?.data ||
        null;

      if (!job) {
        throw new Error("Job not found.");
      }

      setCompany(companyData);

      setForm({
        title: job.title || "",
        description: job.description || "",
        location: job.location || "",
        jobType: job.jobType || "FULL_TIME",
        salaryMin:
          job.salaryMin !== undefined &&
          job.salaryMin !== null
            ? job.salaryMin
            : "",
        salaryMax:
          job.salaryMax !== undefined &&
          job.salaryMax !== null
            ? job.salaryMax
            : "",
        experienceRequired:
          job.experienceRequired ?? 0,
        vacancies: job.vacancies ?? 1,
        skills: Array.isArray(job.skills)
          ? job.skills
          : [],
      });
    } catch (err) {
      console.error("Edit job fetch error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load this job."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

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

      const response = await api.put(
        `/recruiter/jobs/${id}`,
        payload
      );

      setMessage(
        response.data?.message ||
          "Job updated successfully."
      );

      setTimeout(() => {
        navigate(`/recruiter/jobs/${id}`);
      }, 700);
    } catch (err) {
      console.error("Update job error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update this job."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError("");

      await api.delete(`/recruiter/jobs/${id}`);

      navigate("/recruiter/jobs");
    } catch (err) {
      console.error("Delete job error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete this job."
      );

      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Edit Job"
          description="Update your job posting."
        />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="h-[700px] animate-pulse rounded-2xl bg-white xl:col-span-2" />
          <div className="h-[500px] animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  if (error && !form.title) {
    return (
      <div>
        <PageHeader
          title="Edit Job"
          description="Update your job posting."
        />

        <Card>
          <div className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <BriefcaseBusiness size={25} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Unable to load job
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>

            <Link
              to="/recruiter/jobs"
              className="btn btn-primary mt-5 gap-2"
            >
              <ArrowLeft size={17} />
              Back to Jobs
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit Job"
        description="Update the details of your job posting."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/recruiter/jobs/${id}`}
              className="btn btn-outline gap-2 border-slate-300 text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <ArrowLeft size={17} />
              Back
            </Link>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="btn gap-2 border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100"
            >
              <Trash2 size={17} />
              Delete
            </button>
          </div>
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
          {/* Main */}
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
                      Update the main details of this position.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">
                {/* Title */}
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
                    className="input input-bordered w-full border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Type + Location */}
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
                    className="textarea textarea-bordered w-full border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />

                  <div className="mt-1.5 text-right text-xs text-slate-400">
                    {form.description.length} characters
                  </div>
                </div>
              </div>
            </Card>

            {/* Compensation */}
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
                      Update salary, experience and vacancies.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Minimum Salary
                  </label>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-slate-400">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      name="salaryMin"
                      value={form.salaryMin}
                      onChange={handleChange}
                      className="input input-bordered w-full border-slate-300 bg-white pl-8 text-slate-900 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Maximum Salary
                  </label>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-slate-400">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      name="salaryMax"
                      value={form.salaryMax}
                      onChange={handleChange}
                      className="input input-bordered w-full border-slate-300 bg-white pl-8 text-slate-900 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

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
                      min="0"
                      name="experienceRequired"
                      value={form.experienceRequired}
                      onChange={handleChange}
                      className="input input-bordered w-full border-slate-300 bg-white pl-10 text-slate-900 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

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
                      min="1"
                      name="vacancies"
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
                      Update the skills required for this position.
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
                    placeholder="Add a skill..."
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
                          className="rounded-full p-0.5 hover:bg-indigo-200"
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-400">
                    No skills added.
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card>
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Building2 size={21} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Company
                    </p>

                    <p className="truncate font-bold text-slate-900">
                      {company?.name || "Your Company"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="border-b border-slate-200 p-5">
                <div className="flex items-center gap-2">
                  <Sparkles
                    size={18}
                    className="text-indigo-600"
                  />

                  <h3 className="font-bold text-slate-900">
                    Live Preview
                  </h3>
                </div>
              </div>

              <div className="p-5">
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <BriefcaseBusiness size={22} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="break-words font-bold text-slate-900">
                      {form.title || "Job Title"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {company?.name || "Company"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex gap-2 text-sm text-slate-600">
                    <MapPin
                      size={15}
                      className="mt-0.5 text-slate-400"
                    />
                    {form.location || "Location"}
                  </div>

                  <div className="flex gap-2 text-sm text-slate-600">
                    <BriefcaseBusiness
                      size={15}
                      className="mt-0.5 text-slate-400"
                    />
                    {form.jobType
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) =>
                        c.toUpperCase()
                      )}
                  </div>

                  {(form.salaryMin || form.salaryMax) && (
                    <div className="flex gap-2 text-sm text-slate-600">
                      <DollarSign
                        size={15}
                        className="mt-0.5 text-slate-400"
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
                      {form.skills.map((skill) => (
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

                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {form.description ||
                      "Job description preview will appear here."}
                  </p>
                </div>
              </div>
            </Card>

            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-5">
              <div className="flex gap-3">
                <div className="rounded-xl bg-white p-2.5 text-indigo-600 shadow-sm">
                  <FileText size={19} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Before Saving
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Make sure the job title, description, salary
                    and required skills are accurate before updating
                    the posting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Actions */}
        <div className="mt-6 flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:justify-end">
          <Link
            to={`/recruiter/jobs/${id}`}
            className="btn btn-outline border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary min-w-44 gap-2"
          >
            {saving ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Updating...
              </>
            ) : (
              <>
                <Save size={17} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Delete Modal */}
      {showDeleteModal && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Delete this job?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This will permanently remove the job posting.
              Make sure you no longer need this job before
              continuing.
            </p>

            <div className="modal-action">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="btn btn-outline border-slate-300 text-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="btn border-red-600 bg-red-600 text-white hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Job
                  </>
                )}
              </button>
            </div>
          </div>

          <form method="dialog" className="modal-backdrop">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
            >
              close
            </button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default EditJob;