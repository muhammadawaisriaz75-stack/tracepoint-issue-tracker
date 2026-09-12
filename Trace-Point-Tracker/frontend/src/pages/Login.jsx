import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Login() {
  const { user, loading, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back.");
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12">
      <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <h1 className="mt-3 font-display text-5xl leading-tight">
            Trace<span className="text-terracotta">Point</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-stone-600">
            Trace issues from first report to resolution.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8">
          <h2 className="font-display text-2xl">Log in</h2>
          <p className="mt-1 text-sm text-stone-600">Enter your email and password.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="input"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="input"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary mt-6 w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          <p className="mt-4 text-center text-sm text-stone-600">
            No account yet?{" "}
            <Link to="/register" className="font-semibold text-terracotta hover:underline">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
