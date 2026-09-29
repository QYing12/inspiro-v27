// Tasks page — the checklist side of Inspiro's pipeline.
// Two-pane on desktop: project/category sidebar on the left, grouped
// active/completed list on the right. Single-column on mobile with a filter
// strip at the top.

import { useMemo, useState } from "react";
import { useStore } from "../lib/store.js";
import AppShell from "../components/layout/AppShell.jsx";
import TaskItem from "../components/cards/TaskItem.jsx";
import ProjectFilter from "../components/primitives/ProjectFilter.jsx";
import StarGlyph from "../components/StarGlyph.jsx";

const CATEGORY_HEX = {
  Column: "#FB8C6B",
  Video: "#5EEAD4",
  "Watch & Play": "#F5C451",
  Research: "#B5A8FF",
  Review: "#FB8C6B",
};

export default function Tasks() {
  const [view, setView] = useState("active"); // "active" | "completed" | "all"
  const [catFilter, setCatFilter] = useState("all");
  // Only one task's inline editor open at a time. Held at the page level
  // so clicking another task auto-collapses the previous one — no extra
  // coordination needed inside TaskItem.
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const toggleExpand = (id) =>
    setExpandedTaskId((curr) => (curr === id ? null : id));

  const tasks = useStore((s) => s.getFilteredTasks());
  const projectFilter = useStore((s) => s.projectFilter);
  const projects = useStore((s) => s.projects);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (view === "active" && t.status !== "active") return false;
      if (view === "completed" && t.status !== "completed") return false;
      if (catFilter !== "all" && t.category !== catFilter) return false;
      return true;
    });
  }, [tasks, view, catFilter]);

  const groups = useMemo(() => {
    const byGroup = {};
    filtered.forEach((t) => {
      const g = t.dateGroup || "Unscheduled";
      if (!byGroup[g]) byGroup[g] = [];
      byGroup[g].push(t);
    });
    return byGroup;
  }, [filtered]);

  const counts = useMemo(() => {
    return {
      active: tasks.filter((t) => t.status === "active").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      total: tasks.length,
    };
  }, [tasks]);

  const categories = useMemo(() => {
    const set = new Set(tasks.map((t) => t.category));
    return Array.from(set);
  }, [tasks]);

  const currentProject = projectFilter === "all" ? null : projects.find((p) => p.id === projectFilter);

  return (
    <AppShell wide>
      {/* ── header ──────────────────────────────────────────────── */}
      <section className="pt-8 md:pt-14 pb-6 md:pb-8">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="meta mb-3">Action</div>
            <h1 className="font-display text-display-lg text-paper">Tasks</h1>
            <p className="mt-3 text-[15px] text-muted max-w-md">
              {counts.active} active · {counts.completed} completed
              {currentProject && <> · {currentProject.name}</>}
            </p>
          </div>
          <ViewToggle view={view} setView={setView} counts={counts} />
        </div>
      </section>

      {/* ── mobile filters (hidden on md+) ─────────────────────── */}
      <div className="md:hidden sticky top-0 z-30 -mx-5 px-5 py-3 bg-bg/85 backdrop-blur-xl border-b border-border space-y-3">
        <ProjectFilter />
        {categories.length > 0 && (
          <CategoryChips categories={categories} active={catFilter} setActive={setCatFilter} />
        )}
      </div>

      {/* ── body two-pane on desktop ──────────────────────────── */}
      <section className="py-6 md:py-10 md:grid md:grid-cols-[240px_1fr] md:gap-10">
        {/* sidebar (desktop) */}
        <aside className="hidden md:block">
          <div className="sticky top-[96px] space-y-8">
            <SidebarSection title="Project">
              <SidebarProjects />
            </SidebarSection>

            {categories.length > 0 && (
              <SidebarSection title="Category">
                <ul className="space-y-1">
                  <SidebarRow
                    active={catFilter === "all"}
                    onClick={() => setCatFilter("all")}
                    label="All"
                    count={tasks.length}
                  />
                  {categories.map((c) => (
                    <SidebarRow
                      key={c}
                      active={catFilter === c}
                      onClick={() => setCatFilter(c)}
                      label={c}
                      dot={CATEGORY_HEX[c]}
                      count={tasks.filter((t) => t.category === c).length}
                    />
                  ))}
                </ul>
              </SidebarSection>
            )}

            <SidebarSection title="Stats">
              <div className="rounded-md border border-border bg-surface shadow-sm p-4">
                <StatRow label="Active" value={counts.active} />
                <StatRow label="Completed" value={counts.completed} />
                <div className="mt-3 h-1 rounded-full bg-surface-3 overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-[width] duration-500"
                    style={{
                      width: `${counts.total ? (counts.completed / counts.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </SidebarSection>
          </div>
        </aside>

        {/* main list */}
        <div>
          {Object.keys(groups).length === 0 ? (
            <EmptyTasks view={view} />
          ) : (
            Object.entries(groups).map(([group, items]) => (
              <div key={group} className="mb-8 last:mb-0">
                <div className="flex items-baseline justify-between px-1 mb-3">
                  <h2 className="font-mono text-[11px] tracking-meta uppercase text-muted">
                    {group}
                  </h2>
                  <span className="font-mono text-[11px] tracking-meta uppercase text-dim">
                    {items.length}
                  </span>
                </div>
                <div className="rounded-md border border-border bg-surface shadow-sm overflow-hidden">
                  {items.map((t) => (
                    <TaskItem
                      key={t.id}
                      task={t}
                      showProject={projectFilter === "all"}
                      expanded={expandedTaskId === t.id}
                      onToggleExpand={toggleExpand}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
}

/* ── internals ─────────────────────────────────────────────────── */

function ViewToggle({ view, setView, counts }) {
  const items = [
    { id: "active", label: "Active", count: counts.active },
    { id: "completed", label: "Done", count: counts.completed },
    { id: "all", label: "All", count: counts.total },
  ];
  return (
    <div className="inline-flex p-1 rounded-sm border border-border bg-surface-2">
      {items.map((i) => (
        <button
          key={i.id}
          type="button"
          onClick={() => setView(i.id)}
          className={`px-3 h-8 rounded-xs font-mono text-[11px] tracking-meta uppercase transition-colors ${
            view === i.id ? "bg-surface text-paper shadow-sm" : "text-muted hover:text-paper"
          }`}
        >
          {i.label}
          <span className="ml-1.5 text-dim">{i.count}</span>
        </button>
      ))}
    </div>
  );
}

function CategoryChips({ categories, active, setActive }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
      <button
        type="button"
        onClick={() => setActive("all")}
        className={`flex-shrink-0 px-3 h-8 rounded-sm border text-[12px] transition-colors ${
          active === "all"
            ? "text-accent-deep border-accent/40 bg-accent-soft"
            : "text-muted border-border bg-surface hover:bg-surface-2"
        }`}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setActive(c)}
          className={`flex-shrink-0 flex items-center gap-2 px-3 h-8 rounded-sm border text-[12px] transition-colors ${
            active === c
              ? "text-paper border-border-strong bg-surface-3"
              : "text-muted border-border"
          }`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: CATEGORY_HEX[c] || "#A1A1AA" }}
          />
          {c}
        </button>
      ))}
    </div>
  );
}

function SidebarSection({ title, children }) {
  return (
    <div>
      <h3 className="font-mono text-[10px] tracking-meta uppercase text-dim mb-3 px-1">
        {title}
      </h3>
      {children}
    </div>
  );
}

function SidebarRow({ active, onClick, label, dot, count }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-center gap-2.5 px-2 h-8 rounded-xs text-[13px] transition-colors ${
          active ? "bg-accent-soft text-accent-deep" : "text-muted hover:text-paper hover:bg-surface-2"
        }`}
      >
        {dot && (
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: dot }}
            aria-hidden="true"
          />
        )}
        <span className="flex-1 text-left">{label}</span>
        <span className="text-dim text-[11px] font-mono">{count}</span>
      </button>
    </li>
  );
}

function SidebarProjects() {
  const projects = useStore((s) => s.projects);
  const filter = useStore((s) => s.projectFilter);
  const setFilter = useStore((s) => s.setProjectFilter);
  const tasks = useStore((s) => s.tasks);

  const TINT_HEX = { accent: "#5EEAD4", lilac: "#B5A8FF", coral: "#FB8C6B" };

  return (
    <ul className="space-y-1">
      <SidebarRow
        active={filter === "all"}
        onClick={() => setFilter("all")}
        label="All projects"
        count={tasks.length}
      />
      {projects.map((p) => (
        <SidebarRow
          key={p.id}
          active={filter === p.id}
          onClick={() => setFilter(p.id)}
          label={p.name}
          dot={TINT_HEX[p.tint]}
          count={tasks.filter((t) => t.projectId === p.id).length}
        />
      ))}
    </ul>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between py-1">
      <span className="font-mono text-[10px] tracking-meta uppercase text-muted">{label}</span>
      <span className="font-display text-xl text-paper tabular-nums">{value}</span>
    </div>
  );
}

function EmptyTasks({ view }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-surface p-10 text-center">
      <div className="mx-auto w-14 h-14 rounded-full border border-border-strong flex items-center justify-center mb-4">
        <StarGlyph variant="gradient" size={22} />
      </div>
      <h3 className="font-display text-xl text-paper">
        {view === "completed" ? "Nothing completed yet." : "No active tasks."}
      </h3>
      <p className="mt-2 text-sm text-muted">
        Flip an inspiration card on Home and send its insights here.
      </p>
    </div>
  );
}
