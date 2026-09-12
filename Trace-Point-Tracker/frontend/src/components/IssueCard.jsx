const statusStyles = {
  open: "bg-stone-200 text-stone-700",
  in_progress: "bg-amber-100 text-amber-900",
  closed: "bg-emerald-100 text-emerald-800",
};

const priorityStyles = {
  low: "text-moss",
  medium: "text-amber-700",
  high: "text-terracotta",
};

const statusLabel = {
  open: "Open",
  in_progress: "In progress",
  closed: "Closed",
};

const categoryLabel = {
  bug: "Bug",
  feature: "Feature",
  improvement: "Improvement",
  docs: "Docs",
  support: "Support",
};

export default function IssueCard({ issue, onEdit, onDelete, onStatus }) {
  const due = issue.dueDate
    ? new Date(issue.dueDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No due date";

  const blurb = issue.summary || issue.description;

  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg leading-snug">{issue.title}</h3>
          {blurb ? <p className="mt-1 text-sm leading-relaxed text-stone-600">{blurb}</p> : null}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[issue.status]}`}>
          {statusLabel[issue.status]}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-wide">
        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-stone-600">
          {categoryLabel[issue.category] || "Bug"}
        </span>
        <span className={priorityStyles[issue.priority]}>{issue.priority} priority</span>
        <span className="text-stone-500">{due}</span>
      </div>

      {issue.suggestions?.length ? (
        <ul className="mt-3 space-y-1.5 text-sm text-stone-600">
          {issue.suggestions.slice(0, 3).map((item, index) => (
            <li key={`${index}-${item.slice(0, 24)}`} className="flex gap-2">
              <span className="text-terracotta">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {issue.status !== "open" && (
          <button type="button" className="btn-ghost !py-1.5 !text-xs" onClick={() => onStatus(issue, "open")}>
            Open
          </button>
        )}
        {issue.status !== "in_progress" && (
          <button type="button" className="btn-ghost !py-1.5 !text-xs" onClick={() => onStatus(issue, "in_progress")}>
            In progress
          </button>
        )}
        {issue.status !== "closed" && (
          <button type="button" className="btn-ghost !py-1.5 !text-xs" onClick={() => onStatus(issue, "closed")}>
            Closed
          </button>
        )}
        <button type="button" className="btn-ghost !py-1.5 !text-xs" onClick={() => onEdit(issue)}>
          Edit
        </button>
        <button
          type="button"
          className="btn-ghost !py-1.5 !text-xs !text-red-700"
          onClick={() => onDelete(issue)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
