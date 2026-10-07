import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  BriefcaseBusiness,
  GraduationCap,
  Code2,
  FileText,
  Upload,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Download,
} from "lucide-react";

import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";

const Profile = () => {
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    bio: "",
    skills: [],
    education: "",
    experience: "",
  });

  const [skillInput, setSkillInput] = useState("");

  const [resume, setResume] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] =
    useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/job-seeker/profile");

      const data =
        response.data?.user ||
        response.data?.profile ||
        response.data?.data;

      if (!data) {
        throw new Error("Profile data not found.");
      }

      setProfile(data);

      setForm({
        name: data.name || "",
        phone: data.phone || "",
        bio: data.bio || "",
        skills: data.skills || [],
        education: data.education || "",
        experience: data.experience || "",
      });
    } catch (err) {
      console.error("Profile error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) return;

    const exists = form.skills.some(
      (item) =>
        item.toLowerCase() === skill.toLowerCase()
    );

    if (exists) {
      setSkillInput("");
      return;
    }

    setForm((previous) => ({
      ...previous,
      skills: [...previous.skills, skill],
    }));

    setSkillInput("");
  };

  const removeSkill = (skillToRemove) => {
    setForm((previous) => ({
      ...previous,
      skills: previous.skills.filter(
        (skill) => skill !== skillToRemove
      ),
    }));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.put(
        "/job-seeker/profile",
        form
      );

      const updated =
        response.data?.user ||
        response.data?.profile ||
        response.data?.data;

      if (updated) {
        setProfile(updated);

        setForm({
          name: updated.name || "",
          phone: updated.phone || "",
          bio: updated.bio || "",
          skills: updated.skills || [],
          education: updated.education || "",
          experience: updated.experience || "",
        });
      }

      setSuccess("Profile updated successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Update profile error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async () => {
    if (!resume) {
      setError("Please select a PDF resume first.");
      return;
    }

    if (resume.type !== "application/pdf") {
      setError("Only PDF resumes are allowed.");
      return;
    }

    if (resume.size > 5 * 1024 * 1024) {
      setError("Resume size must be less than 5 MB.");
      return;
    }

    try {
      setUploadingResume(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append("resume", resume);

      const response = await api.post(
        "/job-seeker/resume",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updated =
        response.data?.user ||
        response.data?.profile ||
        response.data?.data;

      if (updated) {
        setProfile(updated);
      }

      setResume(null);

      setSuccess("Resume uploaded successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Resume upload error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to upload resume."
      );
    } finally {
      setUploadingResume(false);
    }
  };

  const profileCompletion = (() => {
    if (!profile) return 0;

    const fields = [
      form.name,
      form.phone,
      form.bio,
      form.skills?.length > 0,
      form.education,
      form.experience,
      profile.resumeUrl,
    ];

    const completed = fields.filter(Boolean).length;

    return Math.round(
      (completed / fields.length) * 100
    );
  })();

  if (loading) {
    return (
      <div>
        <PageHeader
          title="My Profile"
          description="Manage your professional profile and resume."
        />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="h-72 animate-pulse rounded-2xl bg-white" />

          <div className="space-y-6 xl:col-span-2">
            <div className="h-96 animate-pulse rounded-2xl bg-white" />
            <div className="h-64 animate-pulse rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="My Profile"
        description="Keep your professional information updated for recruiters."
      />

      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Profile Summary */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 text-white shadow-sm">
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/15 text-3xl font-bold shadow-lg backdrop-blur">
                  {form.name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>

                <h2 className="mt-4 text-xl font-bold">
                  {form.name || "Your Name"}
                </h2>

                <p className="mt-1 text-sm text-indigo-100">
                  {profile?.email}
                </p>

                <span className="mt-4 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-100">
                  Job Seeker
                </span>
              </div>
            </div>

            <div className="border-t border-white/10 bg-black/10 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-indigo-100">
                  Profile Completion
                </span>

                <span className="font-bold">
                  {profileCompletion}%
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{
                    width: `${profileCompletion}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-xs text-indigo-200">
                Complete your profile to improve your chances
                of being noticed by recruiters.
              </p>
            </div>
          </div>

          {/* Contact */}
          <Card>
            <div className="border-b border-slate-200 p-5">
              <h3 className="font-bold text-slate-900">
                Contact Information
              </h3>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex gap-3">
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <Mail size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-400">
                    Email
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                    {profile?.email || "Not available"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <Phone size={16} />
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Phone
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {form.phone || "Not added"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
                  <MapPin size={16} />
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Location
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    Add your location in your profile
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Resume */}
          <Card>
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-50 p-2.5 text-red-500">
                  <FileText size={19} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Resume
                  </h3>

                  <p className="text-xs text-slate-500">
                    PDF only · Maximum 5 MB
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              {profile?.resumeUrl ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      size={20}
                      className="text-emerald-600"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-emerald-800">
                        Resume uploaded
                      </p>

                      <p className="text-xs text-emerald-600">
                        Your resume is available to recruiters.
                      </p>
                    </div>
                  </div>

                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm mt-4 w-full gap-2 border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-100"
                  >
                    <Download size={15} />
                    View Resume
                  </a>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="font-semibold text-amber-800">
                    No resume uploaded
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    Upload your latest resume so recruiters can
                    review your application.
                  </p>
                </div>
              )}

              <div className="mt-4">
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) =>
                    setResume(
                      e.target.files?.[0] || null
                    )
                  }
                  className="file-input file-input-bordered w-full border-slate-300 text-sm"
                />

                {resume && (
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="truncate text-xs font-medium text-slate-600">
                      {resume.name}
                    </span>

                    <button
                      type="button"
                      onClick={() => setResume(null)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleResumeUpload}
                  disabled={
                    !resume || uploadingResume
                  }
                  className="btn btn-primary mt-3 w-full gap-2"
                >
                  {uploadingResume ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload Resume
                    </>
                  )}
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Form */}
        <div className="xl:col-span-2">
          <form
            onSubmit={handleSave}
            className="space-y-6"
          >
            {/* Basic Information */}
            <Card>
              <div className="border-b border-slate-200 p-5 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                    <User size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Personal Information
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Basic information recruiters can use to
                      contact you.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-2 md:p-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="input input-bordered w-full border-slate-300 bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>

                  <input
                    value={profile?.email || ""}
                    disabled
                    className="input input-bordered w-full border-slate-200 bg-slate-50 text-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone Number
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="input input-bordered w-full border-slate-300 bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Experience
                  </label>

                  <input
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    placeholder="e.g. 1 year, Fresher"
                    className="input input-bordered w-full border-slate-300 bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Professional Bio
                  </label>

                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell recruiters briefly about yourself..."
                    className="textarea textarea-bordered w-full border-slate-300 bg-white leading-6 focus:border-indigo-500 focus:outline-none"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Keep it concise and highlight your strongest
                    skills.
                  </p>
                </div>
              </div>
            </Card>

            {/* Skills */}
            <Card>
              <div className="border-b border-slate-200 p-5 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                    <Code2 size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Skills
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Add technologies and skills you are
                      comfortable working with.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6">
                <div className="flex gap-2">
                  <input
                    value={skillInput}
                    onChange={(e) =>
                      setSkillInput(e.target.value)
                    }
                    onKeyDown={handleSkillKeyDown}
                    placeholder="e.g. React, Node.js, MongoDB"
                    className="input input-bordered flex-1 border-slate-300 bg-white focus:border-indigo-500 focus:outline-none"
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
                        className="group flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"
                      >
                        {skill}

                        <button
                          type="button"
                          onClick={() =>
                            removeSkill(skill)
                          }
                          className="rounded-full text-indigo-400 transition hover:text-red-500"
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-center">
                    <Code2
                      size={24}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 text-sm font-medium text-slate-500">
                      No skills added yet
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Education */}
            <Card>
              <div className="border-b border-slate-200 p-5 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                    <GraduationCap size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Education
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Add your academic background.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6">
                <textarea
                  name="education"
                  value={form.education}
                  onChange={handleChange}
                  rows={5}
                  placeholder="e.g. B.Tech in Artificial Intelligence and Machine Learning, TCET, 2027"
                  className="textarea textarea-bordered w-full border-slate-300 bg-white leading-6 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </Card>

            {/* Save */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary min-w-44 gap-2 shadow-lg shadow-indigo-500/20"
              >
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;