// Profile — lightweight account + workspace page. Shows the three active
// projects, a small stat grid, and the pipeline settings. Everything is
// read-only in this prototype; the structure is here so the user can picture
// where preferences/integrations would live.

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../lib/store.js";
import AppShell from "../components/layout/AppShell.jsx";
import StarGlyph from "../components/StarGlyph.jsx";
import Pill from "../components/primitives/Pill.jsx";

const TINT_HEX = { accent: "#5EEAD4", lilac: "#B5A8FF", coral: "#FB8C6B" };

const SOURCES = [
  { name: "Wechat", status: "Connected", icon: "W" },
  { name: "Instagram", status: "Connected", icon: "IG" },
  { name: "Youtube", status: "Connected", icon: "YT" },
  { name: "Photos", status: "Connected", icon: "PH" },
  { name: "Audio text", status: "Connected", icon: "AU" },
  { name: "Chrome ext.", status: "Invite-only", icon: "EX" },
];

export default function Profile() {
  const projects = useStore((s) => s.projects);
  const scraps = useStore((s) => s.scraps);
  const tasks = useStore((s) => s.tasks);

  const stats = useMemo(
    () => ({
      scraps: scraps.length,
      tasks: tasks.length,
      completed: tasks.filter((t) => t.status === "completed").length,
      projects: projects.length,
    }),
    [scraps, tasks, projects]
  );

  return (
    <AppShell>
      {/* ── header ──────────────────────────────────────────────── */}
      <section className="pt-8 md:pt-14 pb-8 flex items-start gap-5">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-accent to-lilac flex items-center justify-center text-ink font-semibold text-xl flex-shrink-0">
          SB
        </div>
        <div className="min-w-0">
          <div className="meta mb-2">Account</div>
          <h1 className="font-display text-display-md text-paper">Strawberry Bear</h1>
          <p className="mt-2 text-[14px] text-muted">qyholly@umich.edu · Personal workspace</p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <Pill tone="accent">Research preview</Pill>
            <Pill tone="muted">Solo plan</Pill>
          </div>
        </div>
      </section>

      {/* ── stat grid ──────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <Stat label="Captures" value={stats.scraps} />
        <Stat label="Tasks" value={stats.tasks} />
        <Stat label="Completed" value={stats.completed} />
        <Stat label="Projects" value={stats.projects} />
      </section>

      {/* ── body two-col on lg ─────────────────────────────────── */}
      <section className="lg:grid lg:grid-cols-2 lg:gap-10">
        {/* projects */}
        <div className="mb-10 lg:mb-0">
          <SectionHeader title="Projects" action="Manage" />
          <ul className="space-y-2">
            {projects.map((p) => {
              const pScraps = scraps.filter((s) => s.projectId === p.id).length;
              const pTasks = tasks.filter((t) => t.projectId === p.id).length;
              return (
                <li key={p.id}>
                  <div className="flex items-center gap-4 p-4 rounded-sm border border-border bg-surface hover:border-border-strong transition-colors">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: TINT_HEX[p.tint] }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-[16px] text-paper">{p.name}</div>
                      <div className="mt-0.5 text-[12px] text-muted">
                        {p.type} · {pScraps} captures · {pTasks} tasks
                      </div>
                    </div>
                    <span className="font-mono text-[10px] tracking-meta uppercase text-dim">→</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* connected sources */}
        <div>
          <SectionHeader title="Connected sources" action="Add source" />
          <ul className="grid grid-cols-2 gap-2">
            {SOURCES.map((s) => (
              <li key={s.name}>
                <div className="flex items-center gap-3 p-3 rounded-sm border border-border bg-surface">
                  <div className="w-8 h-8 rounded-xs bg-surface-3 flex items-center justify-center font-mono text-[10px] tracking-meta text-paper">
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-paper truncate">{s.name}</div>
                    <div
                      className={`text-[10.5px] font-mono tracking-meta uppercase ${
                        s.status === "Connected" ? "text-accent" : "text-dim"
                      }`}
                    >
                      {s.status}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── pipeline preferences ───────────────────────────────── */}
      <section className="mt-10 pt-10 border-t border-border">
        <SectionHeader title="Pipeline" />
        <div className="rounded-md border border-border bg-surface divide-y divide-border">
          <PrefRow
            label="Auto-route captures"
            hint="Inspiro picks the most likely project on capture."
            value="On"
          />
          <PrefRow
            label="Insight generation"
            hint="Generate 2–3 framings per capture."
            value="On"
          />
          <PrefRow
            label="Locked task dependencies"
            hint="Block tasks until their prerequisite is done."
            value="On"
          />
          <PrefRow label="Weekly digest" hint="Friday summary of what you moved forward." value="Off" />
        </div>
      </section>

      {/* ── footer ─────────────────────────────────────────────── */}
      <section className="mt-10 py-6 border-t border-border flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-[12px] text-dim">
          <StarGlyph variant="gradient" size={16} />
          Inspiro · From Scrap to Success · v0.2
        </div>
        <Link to="/" className="text-[12px] text-muted hover:text-paper transition-colors">
          Sign out
        </Link>
      </section>
    </AppShell>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-sm border border-border bg-surface p-4">
      <div className="meta mb-2">{label}</div>
      <div className="font-display text-2xl md:text-3xl text-paper tabular-nums">{value}</div>
    </div>
  );
}

function SectionHeader({ title, action }) {
  return (
    <div className="flex items-baseline justify-between mb-4">
      <h2 className="font-display text-lg text-paper">{title}</h2>
      {action && (
        <button
          type="button"
          className="font-mono text-[10px] tracking-meta uppercase text-muted hover:text-paper transition-colors"
        >
          {action}
        </button>
      )}
    </div>
  );
}

function PrefRow({ label, hint, value }) {
  const on = value === "On";
  return (
    <div className="flex items-center justify-between p-4 gap-4">
      <div className="min-w-0">
        <div className="text-[14px] text-paper">{label}</div>
        <div className="text-[12px] text-dim mt-0.5">{hint}</div>
      </div>
      <span
        className={`font-mono text-[10.5px] tracking-meta uppercase px-2.5 py-1 rounded-xs border flex-shrink-0 ${
          on ? "text-accent border-accent/40 bg-accent/[0.08]" : "text-dim border-border"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
