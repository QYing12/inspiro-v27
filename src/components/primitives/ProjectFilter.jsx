// Horizontal project filter chips shared by Home + Tasks.
// Uses the global projectFilter from the store so switching on Home carries
// to Tasks (and vice versa) without a separate global filter UI.

import { useStore } from "../../lib/store.js";

// Active-state washes tuned for a light background: soft tinted fills with
// legible dark-tinted text and a slightly stronger colored border.
const TONE_CLASS = {
  accent: "data-[active=true]:bg-accent-soft data-[active=true]:text-accent-deep data-[active=true]:border-accent/50",
  lilac:  "data-[active=true]:bg-lilac/10 data-[active=true]:text-[#5C4FB8] data-[active=true]:border-lilac/50",
  coral:  "data-[active=true]:bg-coral/10 data-[active=true]:text-[#B8451E] data-[active=true]:border-coral/50",
};

const TINT_HEX = {
  accent: "#55DDD1",
  lilac: "#B5A8FF",
  coral: "#FB8C6B",
};

export default function ProjectFilter({ className = "" }) {
  const projects = useStore((s) => s.projects);
  const filter = useStore((s) => s.projectFilter);
  const setFilter = useStore((s) => s.setProjectFilter);

  const items = [{ id: "all", name: "All", tint: null }, ...projects];

  return (
    <div className={`flex items-center gap-2 overflow-x-auto no-scrollbar ${className}`}>
      {items.map((p) => {
        const active = filter === p.id;
        const toneClass = p.tint ? TONE_CLASS[p.tint] || "" : "";
        return (
          <button
            key={p.id}
            type="button"
            data-active={active}
            onClick={() => setFilter(p.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-3.5 h-9 rounded-sm border text-[13px] transition-colors ${
              active
                ? "text-paper border-border-strong bg-surface-2"
                : "text-muted border-border bg-surface hover:text-paper hover:border-border-strong hover:bg-surface-2"
            } ${toneClass}`}
          >
            {p.tint && (
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: TINT_HEX[p.tint] }}
                aria-hidden="true"
              />
            )}
            {p.name}
          </button>
        );
      })}
    </div>
  );
}
