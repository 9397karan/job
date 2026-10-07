import { useEffect, useState } from "react";
import {
  Building2,
  Globe,
  MapPin,
  BriefcaseBusiness,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Pencil,
} from "lucide-react";

import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";

const CompanyProfile = () => {
  const [company, setCompany] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    industry: "",
    website: "",
    location: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchCompany = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/recruiter/company"
      );

      const data =
        response.data?.company ||
        response.data?.data ||
        null;

      if (!data) {
        throw new Error("Company profile not found.");
      }

      setCompany(data);

      setForm({
        name: data.name || "",
        description: data.description || "",
        industry: data.industry || "",
        website: data.website || "",
        location: data.location || "",
      });
    } catch (err) {
      console.error("Company profile error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load company profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Company name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.put(
        "/recruiter/company",
        form
      );

      const updated =
        response.data?.company ||
        response.data?.data ||
        null;

      if (updated) {
        setCompany(updated);

        setForm({
          name: updated.name || "",
          description: updated.description || "",
          industry: updated.industry || "",
          website: updated.website || "",
          location: updated.location || "",
        });
      }

      setSuccess(
        "Company profile updated successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Update company error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update company profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const getInitial = () => {
    return (
      form.name?.charAt(0)?.toUpperCase() || "C"
    );
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Company Profile"
          description="Manage your company information and public profile."
        />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="h-[500px] animate-pulse rounded-2xl bg-white" />

          <div className="space-y-6 xl:col-span-2">
            <div className="h-72 animate-pulse rounded-2xl bg-white" />
            <div className="h-80 animate-pulse rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Company Profile"
        description="Manage the information candidates see about your company."
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
        {/* Company Preview */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-sm">
            <div className="relative p-6">
              <div className="absolute right-5 top-5 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl" />

              <div className="relative flex flex-col items-center text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/10 text-3xl font-bold shadow-xl backdrop-blur">
                  {getInitial()}
                </div>

                <h2 className="mt-5 text-xl font-bold">
                  {form.name || "Company Name"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {form.industry ||
                    "Industry not specified"}
                </p>

                {form.location && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin size={13} />
                    {form.location}
                  </div>
                )}

                <div className="mt-5 flex items-center gap-2">
                  {company?.isApproved ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                      <CheckCircle2 size={13} />
                      Approved
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-300">
                      <AlertCircle size={13} />
                      Pending Approval
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 bg-black/10 p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck
                  size={18}
                  className={
                    company?.isApproved
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }
                />

                <div>
                  <p className="text-xs font-semibold text-white">
                    Company Status
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {company?.isActive
                      ? "Your company profile is active"
                      : "Your company profile is inactive"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Public Preview */}
          <Card>
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Candidate Preview
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    How your company information appears to
                    candidates.
                  </p>
                </div>

                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <Building2 size={17} />
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700">
                    {getInitial()}
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-slate-900">
                      {form.name || "Company Name"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {form.industry ||
                        "Industry not specified"}
                    </p>

                    {form.location && (
                      <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                        <MapPin size={12} />
                        {form.location}
                      </p>
                    )}
                  </div>
                </div>

                {form.description && (
                  <p className="mt-4 line-clamp-4 text-xs leading-5 text-slate-500">
                    {form.description}
                  </p>
                )}

                {form.website && (
                  <a
                    href={
                      form.website.startsWith("http")
                        ? form.website
                        : `https://${form.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <Globe size={13} />
                    Visit Website
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Main Form */}
        <div className="xl:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Basic Information */}
            <Card>
              <div className="border-b border-slate-200 p-5 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                    <Building2 size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Company Information
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Provide accurate information about your
                      organization.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-2 md:p-6">
                {/* Company Name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Company Name
                  </label>

                  <div className="relative">
                    <Building2
                      size={17}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Acme Technologies"
                      className="input input-bordered w-full border-slate-300 bg-white pl-10 focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Industry */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Industry
                  </label>

                  <div className="relative">
                    <BriefcaseBusiness
                      size={17}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      name="industry"
                      value={form.industry}
                      onChange={handleChange}
                      placeholder="e.g. Software & Technology"
                      className="input input-bordered w-full border-slate-300 bg-white pl-10 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Location
                  </label>

                  <div className="relative">
                    <MapPin
                      size={17}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="e.g. Mumbai, Maharashtra"
                      className="input input-bordered w-full border-slate-300 bg-white pl-10 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Website
                  </label>

                  <div className="relative">
                    <Globe
                      size={17}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      name="website"
                      value={form.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      className="input input-bordered w-full border-slate-300 bg-white pl-10 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Company Description
                  </label>

                  <div className="relative">
                    <FileText
                      size={17}
                      className="pointer-events-none absolute left-3 top-3 text-slate-400"
                    />

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={7}
                      placeholder="Tell candidates about your company, culture, products and work environment..."
                      className="textarea textarea-bordered w-full border-slate-300 bg-white pl-10 leading-6 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    A clear company description helps candidates
                    understand your organization before applying.
                  </p>
                </div>
              </div>
            </Card>

            {/* Company Status */}
            <Card>
              <div className="border-b border-slate-200 p-5 md:p-6">
                <h2 className="font-bold text-slate-900">
                  Company Status
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current status of your company profile.
                </p>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2 md:p-6">
                <div
                  className={`rounded-xl border p-4 ${
                    company?.isApproved
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <div className="flex gap-3">
                    {company?.isApproved ? (
                      <CheckCircle2
                        size={20}
                        className="text-emerald-600"
                      />
                    ) : (
                      <AlertCircle
                        size={20}
                        className="text-amber-600"
                      />
                    )}

                    <div>
                      <p
                        className={`font-semibold ${
                          company?.isApproved
                            ? "text-emerald-800"
                            : "text-amber-800"
                        }`}
                      >
                        {company?.isApproved
                          ? "Company Approved"
                          : "Approval Pending"}
                      </p>

                      <p
                        className={`mt-1 text-xs leading-5 ${
                          company?.isApproved
                            ? "text-emerald-700"
                            : "text-amber-700"
                        }`}
                      >
                        {company?.isApproved
                          ? "Your company can actively recruit candidates."
                          : "Your company profile is awaiting approval."}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-xl border p-4 ${
                    company?.isActive
                      ? "border-blue-200 bg-blue-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex gap-3">
                    <ShieldCheck
                      size={20}
                      className={
                        company?.isActive
                          ? "text-blue-600"
                          : "text-slate-500"
                      }
                    />

                    <div>
                      <p
                        className={`font-semibold ${
                          company?.isActive
                            ? "text-blue-800"
                            : "text-slate-700"
                        }`}
                      >
                        {company?.isActive
                          ? "Profile Active"
                          : "Profile Inactive"}
                      </p>

                      <p
                        className={`mt-1 text-xs leading-5 ${
                          company?.isActive
                            ? "text-blue-700"
                            : "text-slate-500"
                        }`}
                      >
                        {company?.isActive
                          ? "Your company information is currently active."
                          : "Your company profile is currently inactive."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Save */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary min-w-48 gap-2 shadow-lg shadow-indigo-500/20"
              >
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Company Profile
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

export default CompanyProfile;