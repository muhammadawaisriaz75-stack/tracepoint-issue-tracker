import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Register() {
  const { user, loading, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      await register(form.name, form.email, form.password);
      toast.success("Account created.");
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-12">
      <form onSubmit={handleSubmit} className="card w-full p-8">
        <h1 className="font-display text-3xl">Create an account</h1>
        <p className="mt-2 text-sm text-stone-600">You’ll use this to sign in and track issues.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="name">
              Name
            </label>
            <input id="name" name="name" className="input" value={form.name} onChange={handleChange} required minLength={2} />
          </div>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" className="input" value={form.email} onChange={handleChange} required />
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
              minLength={6}
            />
          </div>
        </div>

        <button type="submit" className="btn-accent mt-6 w-full" disabled={submitting}>
          {submitting ? "Creating…" : "Create account"}
        </button>

        <p className="mt-4 text-center text-sm text-stone-600">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-terracotta hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
