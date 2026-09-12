import { useEffect, useState } from "react";
import { issueApi } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

const emptyForm = {
  title: "",
  description: "",
  summary: "",
  category: "bug",
  suggestions: [],
  status: "open",
  priority: "medium",
  dueDate: "",
};

const categoryLabel = {
  bug: "Bug",
  feature: "Feature",
  improvement: "Improvement",
  docs: "Docs",
  support: "Support",
};

export default function IssueModal({ open, issue, onClose, onSave, saving }) {
  const toast = useToast();
  const [form, setForm] = useState(emptyForm);
  const [assisting, setAssisting] = useState(false);
  const [aiNote, setAiNote] = useState("");

  useEffect(() => {
    if (!open) return;

    setAiNote("");
    if (issue) {
      setForm({
        title: issue.title || "",
        description: issue.description || "",
        summary: issue.summary || "",
        category: issue.category || "bug",
        suggestions: Array.isArray(issue.suggestions) ? issue.suggestions : [],
        status: issue.status || "open",
        priority: issue.priority || "medium",
        dueDate: issue.dueDate ? issue.dueDate.slice(0, 10) : "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, issue]);

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleAssist = async () => {
    if (!form.title.trim() && !form.description.trim()) {
      toast.error("Add a title or description first.");
      return;
    }

    setAssisting(true);
    try {
      const suggestion = await issueApi.assist({
        title: form.title,
        description: form.description,
      });
      setForm((current) => ({
        ...current,
        summary: suggestion.summary || current.summary,
        priority: suggestion.priority || current.priority,
        category: suggestion.category || current.category,
        suggestions: Array.isArray(suggestion.suggestions) ? suggestion.suggestions : [],
      }));
      setAiNote(
        `AI filled ${suggestion.priority} priority, ${categoryLabel[suggestion.category] || suggestion.category}, and ${suggestion.suggestions?.length || 0} suggestions.`
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      setAssisting(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-cream p-6 shadow-card"
      >
        <h2 className="font-display text-2xl">
          {issue ? "Edit issue" : "New issue"}
        </h2>

        <div className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              name="title"
              className="input"
              value={form.title}
              onChange={handleChange}
              required
              maxLength={120}
            />
          </div>

          <div>
            <label className="label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="input min-h-[6rem] resize-y"
              value={form.description}
              onChange={handleChange}
              maxLength={2000}
            />
          </div>

          <button
            type="button"
            className="btn-ghost w-full"
            onClick={handleAssist}
            disabled={assisting}
          >
            {assisting ? "Asking AI…" : "Ask AI"}
          </button>

          {aiNote ? (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{aiNote}</p>
          ) : null}

          <div>
            <label className="label" htmlFor="summary">
              Summary
            </label>
            <textarea
              id="summary"
              name="summary"
              className="input min-h-[4.5rem] resize-y"
              value={form.summary}
              onChange={handleChange}
              maxLength={280}
            />
          </div>

          {form.suggestions.length > 0 ? (
            <div className="rounded-xl border border-stone-200 bg-white/80 p-3">
              <p className="text-sm font-semibold text-stone-700">AI suggestions</p>
              <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-stone-600">
                {form.suggestions.map((item, index) => (
                  <li key={`${index}-${item.slice(0, 24)}`} className="flex gap-2">
                    <span className="font-semibold text-terracotta">{index + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="status">
                Status
              </label>
              <select id="status" name="status" className="input" value={form.status} onChange={handleChange}>
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="priority">
                Priority
              </label>
              <select id="priority" name="priority" className="input" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="category">
                Category
              </label>
              <select id="category" name="category" className="input" value={form.category} onChange={handleChange}>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="improvement">Improvement</option>
                <option value="docs">Docs</option>
                <option value="support">Support</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="dueDate">
                Due date
              </label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                className="input"
                value={form.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-accent" disabled={saving}>
            {saving ? "Saving…" : "Save issue"}
          </button>
        </div>
      </form>
    </div>
  );
}
