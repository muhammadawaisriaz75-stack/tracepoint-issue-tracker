import { useCallback, useEffect, useState } from "react";
import { issueApi } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import Navbar from "../components/Navbar.jsx";
import IssueCard from "../components/IssueCard.jsx";
import IssueModal from "../components/IssueModal.jsx";

export default function Issues() {
  const toast = useToast();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ search: "", status: "", priority: "", category: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadIssues = useCallback(async () => {
    try {
      const data = await issueApi.list(filters);
      setIssues(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    setLoading(true);
    loadIssues();
  }, [loadIssues]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (issue) => {
    setEditing(issue);
    setModalOpen(true);
  };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        await issueApi.update(editing._id, form);
        toast.success("Issue updated.");
      } else {
        await issueApi.create(form);
        toast.success("Issue created.");
      }
      setModalOpen(false);
      await loadIssues();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (issue) => {
    const confirmed = window.confirm(`Delete “${issue.title}”? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await issueApi.remove(issue._id);
      toast.success("Issue deleted.");
      await loadIssues();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleStatus = async (issue, status) => {
    try {
      await issueApi.update(issue._id, { status });
      await loadIssues();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-terracotta">Board</p>
            <h1 className="mt-2 font-display text-4xl">Issues</h1>
          </div>
          <button type="button" className="btn-accent" onClick={openCreate}>
            New issue
          </button>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            className="input"
            placeholder="Search title or description"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          />
          <select
            className="input"
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="closed">Closed</option>
          </select>
          <select
            className="input"
            value={filters.priority}
            onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select
            className="input"
            value={filters.category}
            onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
          >
            <option value="">All categories</option>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="improvement">Improvement</option>
            <option value="docs">Docs</option>
            <option value="support">Support</option>
          </select>
        </div>

        {loading ? (
          <p className="mt-10 text-stone-500">Loading issues…</p>
        ) : issues.length === 0 ? (
          <div className="card mt-10 p-10 text-center">
            <h2 className="font-display text-2xl">No issues yet</h2>
            <p className="mt-2 text-stone-600">File an issue or clear the filters.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {issues.map((issue) => (
              <IssueCard
                key={issue._id}
                issue={issue}
                onEdit={openEdit}
                onDelete={handleDelete}
                onStatus={handleStatus}
              />
            ))}
          </div>
        )}
      </main>

      <IssueModal
        open={modalOpen}
        issue={editing}
        saving={saving}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
