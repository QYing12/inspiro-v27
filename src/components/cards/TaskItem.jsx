// A single row in the Tasks checklist. Supports active / completed / locked
// visual states. Category dot color comes from the `categories` map in the
// store. Click the checkbox to toggle done; click anywhere else on the row
// to inline-expand the task for editing (title + optional note).
//
// The expanded state is controlled from the parent (Tasks.jsx) so only one
// row can be open at a time. Edits persist immediately via the store — no
// draft buffer, no Save button. Matches Notion-style inline editing.

import { useStore } from "../../lib/store.js";
import Pill from "../primitives/Pill.jsx";

const CATEGORY_HEX = {
  Column: "#FB8C6B",
  Video: "#5EEAD4",
  "Watch & Play": "#F5C451",
  Research: "#B5A8FF",
  Review: "#FB8C6B",
};

const PROJECT_TONE = {
  musical: "accent",
  capstone: "lilac",
  "studio-chen": "coral",
};

export default function TaskItem({
  task,
  showProject = false,
  expanded = false,
  onToggleExpand,
}) {
  const toggle = useStore((s) => s.toggleTaskDone);
  const updateTitle = useStore((s) => s.updateTaskTitle);
  const updateNote = useStore((s) => s.updateTaskNote);
  const project = useStore((s) => s.getProject(task.projectId));
  const done = task.status === "completed";
  const locked = task.locked && !done;

  const dot = CATEGORY_HEX[task.category] || "#A1A1AA";
  const canExpand = !locked && typeof onToggleExpand === "function";

  // Row click → toggle expand. Clicks on the checkbox stop propagation so
  // this never fires when toggling done. In the expanded editor below,
  // inputs are siblings (not children) so their clicks don't bubble here.
  const onRowClick = (e) => {
    if (!canExpand) return;
    if (e.target.closest("button, input, textarea, a")) return;
    onToggleExpand(task.id);
  };

  return (
    <div
      className={`group relative border-b border-border last:border-b-0 transition-colors ${
        locked ? "opacity-55" : ""
      } ${expanded ? "bg-surface-2" : !locked ? "hover:bg-surface-2" : ""}`}
    >
      {/* row ─ always visible ─────────────────────────────────── */}
      <div
        className={`flex items-start gap-3 py-3.5 px-4 ${canExpand ? "cursor-pointer" : ""}`}
        onClick={onRowClick}
      >
        {/* checkbox */}
        <button
          type="button"
          disabled={locked}
          onClick={(e) => {
            e.stopPropagation();
            toggle(task.id);
          }}
          className={`mt-0.5 w-[18px] h-[18px] flex-shrink-0 rounded-xs border flex items-center justify-center transition-colors ${
            done
              ? "bg-accent border-accent"
              : locked
              ? "border-dim bg-surface-2 cursor-not-allowed"
              : "border-muted hover:border-paper"
          }`}
          aria-label={done ? "Mark as active" : "Mark as done"}
        >
          {done && (
            <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="#0F1012" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8.5 6.5 12 13 5" />
            </svg>
          )}
          {locked && (
            <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-dim">
              <rect x="4" y="7.5" width="8" height="5.5" rx="1" />
              <path d="M5.5 7.5V6a2.5 2.5 0 0 1 5 0v1.5" />
            </svg>
          )}
        </button>

        {/* body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: dot }}
              aria-hidden="true"
            />
            <span className="font-mono text-[10px] tracking-meta uppercase text-muted">
              {task.category}
            </span>
            {showProject && project && (
              <>
                <span className="text-dim text-[10px]">·</span>
                <Pill tone={PROJECT_TONE[project.id] || "muted"} className="!px-1.5 !py-0">
                  {project.name}
                </Pill>
              </>
            )}
            {/* Quiet indicator when a note is attached */}
            {!expanded && task.note && task.note.trim() && (
              <>
                <span className="text-dim text-[10px]">·</span>
                <span
                  className="font-mono text-[10px] tracking-meta uppercase text-dim inline-flex items-center gap-1"
                  title="This task has a note"
                >
                  <svg viewBox="0 0 16 16" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 3.5h10M3 7h10M3 10.5h6" />
                  </svg>
                  note
                </span>
              </>
            )}
          </div>

          <p
            className={`text-[14.5px] leading-snug ${
              done ? "text-dim line-through" : "text-paper"
            }`}
          >
            {task.title}
          </p>

          {locked && task.lockReason && (
            <p className="mt-1 text-[11px] text-dim italic">{task.lockReason}</p>
          )}
        </div>

        {/* date / source hint */}
        {task.sourceScrapId && (
          <span className="hidden md:flex items-center gap-1 text-[10px] font-mono tracking-meta uppercase text-dim flex-shrink-0">
            <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M8 1 9.6 5.4 14 6 10.5 9 11.5 13.5 8 11 4.5 13.5 5.5 9 2 6 6.4 5.4Z" />
            </svg>
            from capture
          </span>
        )}
      </div>

      {/* expanded editor — only rendered when open, so empty-state DOM is zero */}
      {expanded && canExpand && (
        <div className="pl-[46px] pr-4 pb-4 pt-1 space-y-3">
          {/* title */}
          <div>
            <label
              htmlFor={`task-title-${task.id}`}
              className="font-mono text-[10px] tracking-meta uppercase text-dim block mb-1.5"
            >
              Title
            </label>
            <input
              id={`task-title-${task.id}`}
              type="text"
              value={task.title}
              onChange={(e) => updateTitle(task.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") onToggleExpand(task.id);
              }}
              className="w-full bg-surface-2 border border-border rounded-sm px-3 h-9 text-[14px] text-paper focus:border-border-strong focus:bg-surface-2 focus:outline-none transition-colors"
            />
          </div>

          {/* note */}
          <div>
            <label
              htmlFor={`task-note-${task.id}`}
              className="font-mono text-[10px] tracking-meta uppercase text-dim block mb-1.5"
            >
              Note
            </label>
            <textarea
              id={`task-note-${task.id}`}
              rows={3}
              value={task.note || ""}
              onChange={(e) => updateNote(task.id, e.target.value)}
              placeholder="Add a note…"
              className="w-full bg-surface-2 border border-border rounded-sm px-3 py-2 text-[13px] text-paper placeholder:text-dim focus:border-border-strong focus:bg-surface-2 focus:outline-none transition-colors resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
