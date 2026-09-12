import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { issueApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Navbar from "../components/Navbar.jsx";

const cards = [
  { key: "total", label: "All issues", tone: "bg-ink text-cream" },
  { key: "open", label: "Open", tone: "bg-white text-ink" },
  { key: "inProgress", label: "In progress", tone: "bg-amber-50 text-amber-900" },
  { key: "closed", label: "Closed", tone: "bg-emerald-50 text-emerald-900" },
  { key: "high", label: "Open high priority", tone: "bg-orange-50 text-terracotta" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, issues] = await Promise.all([issueApi.stats(), issueApi.list()]);
        setStats(s);
        setRecent(issues.slice(0, 5));
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-terracotta">Overview</p>
        <h1 className="mt-2 font-display text-4xl">Hello, {user?.name?.split(" ")[0]}</h1>
        <p className="mt-2 max-w-xl text-stone-600">Here's where things stand today.</p>

        {loading ? (
          <p className="mt-10 text-stone-500">Loading stats…</p>
        ) : (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {cards.map((card) => (
                <article key={card.key} className={`rounded-2xl border border-stone-200 p-5 ${card.tone}`}>
                  <p className="text-sm font-semibold opacity-80">{card.label}</p>
                  <p className="mt-2 font-display text-4xl">{stats?.[card.key] ?? 0}</p>
                </article>
              ))}
            </section>

            <section className="mt-10">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl">Recent issues</h2>
                <Link to="/issues" className="btn-primary">
                  View all
                </Link>
              </div>

              {recent.length === 0 ? (
                <div className="card mt-4 p-8 text-center text-stone-600">
                  No issues yet. Open the board and file the first one.
                </div>
              ) : (
                <ul className="mt-4 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-cream">
                  {recent.map((issue) => (
                    <li key={issue._id} className="flex items-center justify-between gap-4 px-5 py-4">
                      <div>
                        <p className="font-semibold">{issue.title}</p>
                        <p className="text-sm capitalize text-stone-500">
                          {issue.status.replace("_", " ")} · {issue.priority}
                          {issue.category ? ` · ${issue.category}` : ""}
                        </p>
                      </div>
                      <Link to="/issues" className="text-sm font-semibold text-terracotta hover:underline">
                        Open
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
