import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import api from "../../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "JOB_SEEKER",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.name ||
      !form.email ||
      !form.password
    ) {
      setError("Please fill all required fields");
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must contain at least 6 characters"
      );
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", form);

      setSuccess(
        "Registration successful. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-content mb-4">
            <BriefcaseBusiness size={28} />
          </div>

          <h1 className="text-3xl font-bold">
            JobConnect
          </h1>

          <p className="text-base-content/60 mt-2">
            Create your account
          </p>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">

            <h2 className="card-title text-2xl mb-1">
              Get started
            </h2>

            <p className="text-base-content/60 mb-5">
              Join JobConnect today
            </p>

            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success mb-4">
                <span>{success}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* Name */}
              <div>
                <label className="label">
                  <span className="label-text">
                    Full Name
                  </span>
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>

              {/* Email */}
              <div>
                <label className="label">
                  <span className="label-text">
                    Email
                  </span>
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <label className="label">
                  <span className="label-text">
                    Password
                  </span>
                </label>

                <div className="relative">
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    className="input input-bordered w-full pr-12"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50"
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="label">
                  <span className="label-text">
                    Account Type
                  </span>
                </label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="JOB_SEEKER">
                    Job Seeker
                  </option>

                  <option value="RECRUITER">
                    Recruiter
                  </option>
                </select>
              </div>

              {/* Register */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

            </form>

            <div className="divider">
              OR
            </div>

            <p className="text-center text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-semibold hover:underline"
              >
                Login
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;