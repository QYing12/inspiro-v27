// Home — inspiration wall. Masonry-ish grid of scraps the user has captured.
// Click a card to flip and see AI-generated insights; select any of them and
// Send to Tasks to turn them into action items on the Tasks page.

import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../lib/store.js";
import AppShell from "../components/layout/AppShell.jsx";
import InspirationCard from "../components/cards/InspirationCard.jsx";
import ProjectFilter from "../components/primitives/ProjectFilter.jsx";
import StarGlyph from "../components/StarGlyph.jsx";
import AIChatPanel from "../components/chat/AIChatPanel.jsx";

// Content-type options shown under the Ask AI button. Kept as a flat list
// so the mapping from scrap → content-type (see contentTypeOf) can grow
// independently of the UI.
const CONTENT_TYPES = [
  { key: "all", label: "All Types" },
  { key: "photo", label: "Photo" },
  { key: "link", label: "Link" },
  { key: "youtube", label: "YouTube" },
  { key: "text", label: "Text" },
  { key: "audio", label: "Audio" },
];

// Classify a scrap into one of the content-type buckets. YouTube is sourced
// from scrap.source (since YT captures are stored with type: "link" +
// source: "Youtube"); all other buckets map cleanly off scrap.type. Any
// unknown type falls through as "other" so it never matches a named filter
// and stays out of filtered views unless "All Types" is selected.
function contentTypeOf(scrap) {
  if (scrap?.source === "Youtube") return "youtube";
  switch (scrap?.type) {
    case "image": return "photo";
    case "link":  return "link";
    case "text":  return "text";
    case "voice": return "audio";
    default:      return "other";
  }
}

export default function Home() {
  const scraps = useStore((s) => s.getFilteredScraps());
  const totalScraps = useStore((s) => s.scraps.length);
  const filter = useStore((s) => s.projectFilter);
  const [chatOpen, setChatOpen] = useState(false);

  // Secondary filter: content type. Local to Home — unlike projectFilter it
  // doesn't carry to Tasks, since content-type scanning is a wall-browsing
  // behavior and shouldn't shadow the shared project scope.
  const [selectedContentType, setSelectedContentType] = useState("all");

  // Chain the two filters: project is already applied by getFilteredScraps()
  // in the store, so here we only need to layer type on top. When no type is
  // selected we pass the project-filtered list through untouched.
  const filteredScraps =
    selectedContentType === "all"
      ? scraps
      : scraps.filter((s) => contentTypeOf(s) === selectedContentType);

  return (
    <AppShell wide>
      {/* ── header ──────────────────────────────────────────────── */}
      <section className="pt-8 md:pt-14 pb-6 md:pb-10">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="meta mb-3">Inspiration</div>
            <h1 className="font-display text-display-lg text-paper">
              Home
            </h1>
            <p className="mt-3 text-[15px] text-muted max-w-md">
              {totalScraps} captures, routed and waiting. Tap a card to see what
              Inspiro pulled out of it.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-sm bg-accent text-ink font-mono text-[11px] tracking-meta uppercase hover:bg-accent-deep hover:text-white transition-colors shadow-sm"
              aria-label="Open Inspiro AI assistant"
            >
              <StarGlyph variant="ink" size={14} />
              Ask AI
            </button>

            <ContentTypeFilter
              value={selectedContentType}
              onChange={setSelectedContentType}
            />
          </div>
        </div>
      </section>

      {/* ── filter bar ─────────────────────────────────────────── */}
      <div className="sticky top-0 md:top-[68px] z-30 -mx-5 md:-mx-8 px-5 md:px-8 py-3 bg-bg/85 backdrop-blur-xl border-b border-border">
        <ProjectFilter />
      </div>

      {/* ── wall ───────────────────────────────────────────────── */}
      <section className="py-6 md:py-10">
        {filteredScraps.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            className="grid gap-5 md:gap-6"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              alignItems: "start",
            }}
          >
            {filteredScraps.map((s) => (
              <InspirationCard key={s.id} scrap={s} />
            ))}
          </div>
        )}
      </section>

      {/* ── footer note ────────────────────────────────────────── */}
      <section className="py-6 md:py-10 border-t border-border">
        <div className="flex items-start gap-3 max-w-xl">
          <StarGlyph variant="gradient" size={18} />
          <p className="text-[13px] text-muted leading-relaxed">
            Every card is a starting point, not an archive. Flip it, pick an
            insight, and it becomes a task — the capture stays linked so you
            always know where the idea came from.
          </p>
        </div>
      </section>

      {/* ── AI chat drawer (fixed-positioned, overlays without unmounting Home) ── */}
      <AIChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </AppShell>
  );
}

// Secondary filter bar. Intentionally smaller + lower-contrast than the
// main ProjectFilter so it reads as a subordinate scan control, not a
// competing scope selector. Pill-style chips match the existing system;
// active chip mirrors ProjectFilter's untinted "All" active treatment.
function ContentTypeFilter({ value, onChange }) {
  return (
    <div
      className="flex items-center flex-wrap gap-1.5 justify-end"
      role="group"
      aria-label="Filter captures by content type"
    >
      {CONTENT_TYPES.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            data-active={active}
            onClick={() => onChange(t.key)}
            className={`h-7 px-2.5 rounded-sm border font-mono text-[10.5px] tracking-meta uppercase transition-colors ${
              active
                ? "text-accent-deep border-accent/40 bg-accent-soft"
                : "text-dim border-border hover:text-muted hover:border-border-strong hover:bg-surface-2"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-md text-center py-16">
      <div className="mx-auto w-14 h-14 rounded-full border border-border-strong flex items-center justify-center mb-4">
        <StarGlyph variant="gradient" size={22} />
      </div>
      <h3 className="font-display text-xl text-paper">No captures in this project yet.</h3>
      <p className="mt-2 text-sm text-muted">
        Drop a link, a screenshot, or just a thought — Inspiro will route it for you.
      </p>
      <Link
        to="/input"
        className="mt-5 inline-flex items-center gap-2 h-10 px-4 rounded-sm bg-accent text-ink font-mono text-[11px] tracking-meta uppercase hover:bg-accent-deep hover:text-white transition-colors"
      >
        Open the input
      </Link>
    </div>
  );
}
