import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BriefcaseBusiness, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);
    setError("");

    const result = await login(
      form.email,
      form.password
    );

    console.log("LOGIN RESULT:", result);
    console.log("LOGGED IN USER:", result.user);
    console.log("USER ROLE:", result.user?.role);

    if (result.user?.role === "ADMIN") {
      navigate("/admin", {
        replace: true,
      });
    } else if (
      result.user?.role === "JOB_SEEKER"
    ) {
      navigate("/job-seeker", {
        replace: true,
      });
    } else if (
      result.user?.role === "RECRUITER"
    ) {
      navigate("/recruiter", {
        replace: true,
      });
    } else {
      setError(
        `Invalid user role: ${result.user?.role || "Unknown"}`
      );
    }
  } catch (error) {
    console.error("Login error:", error);

    setError(
      error.response?.data?.message ||
        "Invalid email or password."
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">

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
            Find your next opportunity
          </p>
        </div>

        {/* Login Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">

            <h2 className="card-title text-2xl mb-1">
              Welcome back
            </h2>

            <p className="text-base-content/60 mb-5">
              Login to your JobConnect account
            </p>

            {/* Error */}
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

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
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    className="input input-bordered w-full pr-12"
                    autoComplete="current-password"
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

              {/* Login */}
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
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>

            </form>

            <div className="divider">
              OR
            </div>

            <p className="text-center text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary font-semibold hover:underline"
              >
                Create account
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;