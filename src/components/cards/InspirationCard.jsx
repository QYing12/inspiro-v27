// Flippable inspiration card — the "hero" interaction of Home.
//
// Front: gradient preview + source/date meta + title. Click-to-flip.
// Back:  AI-generated insights with multi-select + Send-to-Tasks CTA.
//
// The flip uses CSS 3D transforms defined in index.css (.flip-perspective /
// .flip-surface / .flip-face / .flip-back).

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../../lib/store.js";
import { generateInsights } from "../../lib/fakeAI.js";
import ScrapArt from "./ScrapArt.jsx";
import Pill from "../primitives/Pill.jsx";
import StarGlyph from "../StarGlyph.jsx";

const PROJECT_TONE = {
  musical: "accent",
  capstone: "lilac",
  "studio-chen": "coral",
};

// Heuristic: card-warm (cream), card-cool (paper), or dark — determines text color.
function cardTone(preview) {
  const light = /FAFAF8|F3F0EA|F0EEE6|EEE8DA|E4E2DC|EDF0F2|E4E4E6|E8D5B7/i;
  return light.test(preview || "") ? "light" : "dark";
}

export default function InspirationCard({ scrap }) {
  const [flipped, setFlipped] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [sent, setSent] = useState(false);
  const [imgError, setImgError] = useState(false);

  const project = useStore((s) => s.getProject(scrap.projectId));
  const sendInsightsToTasks = useStore((s) => s.sendInsightsToTasks);
  const insights = useMemo(() => generateInsights(scrap), [scrap]);

  const tone = cardTone(scrap.preview);
  const isLight = tone === "light";
  // On a dark-preview card the text must stay light regardless of app
  // theme (the preview gradient itself is dark). "text-paper" is dark in
  // the light theme, so we use explicit white here for readability.
  const textPrimary = isLight ? "text-ink" : "text-white";
  const textSecondary = isLight ? "text-ink/60" : "text-white/80";
  const textMeta = isLight ? "text-ink/50" : "text-white/70";

  const cardHeight = scrap.cardSize === "tall" ? 380 : 260;

  const toggle = (idx) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const sendToTasks = () => {
    const chosen = insights.filter((_, i) => selected.has(i));
    if (chosen.length === 0) return;
    sendInsightsToTasks(scrap.id, chosen);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setFlipped(false);
      setSelected(new Set());
    }, 1400);
  };

  return (
    <div
      className="flip-perspective"
      style={{ height: cardHeight }}
    >
      <div className={`relative w-full h-full flip-surface ${flipped ? "is-flipped" : ""}`}>
        {/* ── FRONT ─────────────────────────────────────────────── */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setFlipped(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setFlipped(true);
            }
          }}
          className="flip-face w-full h-full text-left rounded-lg overflow-hidden border border-border group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          style={{ background: scrap.preview }}
          aria-label={`Open insights for ${scrap.title}`}
        >
          {scrap.imageUrl && !imgError ? (
            /* ── photo variant — full-bleed image with gradient overlays ──── */
            <div className="relative w-full h-full">
              <img
                src={scrap.imageUrl}
                alt={scrap.title}
                onError={() => setImgError(true)}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                loading="lazy"
                draggable={false}
              />
              {/* top scrim for pill legibility */}
              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />
              {/* bottom scrim for title */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

              <div className="relative w-full h-full p-4 flex flex-col text-white">
                <div className="flex items-center justify-between">
                  <Pill tone="ink">{scrap.source}</Pill>
                  <span className="font-mono text-[10px] tracking-meta uppercase text-white/80">
                    {scrap.date}
                  </span>
                </div>
                <div className="flex-1" />
                <div>
                  <h3 className="font-display text-[17px] leading-[1.15] tracking-tight text-white drop-shadow-sm">
                    {scrap.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-white/80">
                      {insights.length} insight{insights.length === 1 ? "" : "s"}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-mono tracking-meta uppercase text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                      Flip
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" />
                        <path d="M18 2v5h-5M6 22v-5h5" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : scrap.type === "link" && scrap.linkPreview ? (
            /* ── link-preview variant — branded gradient with parsed metadata ─ */
            <LinkPreviewFace
              scrap={scrap}
              insights={insights}
            />
          ) : scrap.type === "text" ? (
            /* ── text variant — user's thought is the hero ─────────────────── */
            <TextFace
              scrap={scrap}
              insights={insights}
              isLight={isLight}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMeta={textMeta}
            />
          ) : (
            /* ── stylized variant — gradient preview + SVG art ────────────── */
            <div className="relative w-full h-full p-4 flex flex-col">
              <div className="flex items-center justify-between">
                <Pill tone={isLight ? "muted" : "ink"}>{scrap.source}</Pill>
                <span className={`font-mono text-[10px] tracking-meta uppercase ${textMeta}`}>
                  {scrap.date}
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center my-3 min-h-0">
                <div className="w-full h-full max-h-[180px]">
                  <ScrapArt art={scrap.art} tone={tone} quote={scrap.quote} />
                </div>
              </div>

              <div>
                <h3 className={`font-display text-[17px] leading-[1.15] tracking-tight ${textPrimary}`}>
                  {scrap.title}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-[11px] ${textSecondary}`}>
                    {insights.length} insight{insights.length === 1 ? "" : "s"}
                  </span>
                  <span
                    className={`flex items-center gap-1 text-[10px] font-mono tracking-meta uppercase ${textMeta} opacity-0 group-hover:opacity-100 transition-opacity`}
                  >
                    Flip
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" />
                      <path d="M18 2v5h-5M6 22v-5h5" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── bottom-right: jump to detail page ─────────────────── */}
          <DetailArrow scrapId={scrap.id} isLight={isLight} hasPhoto={!!(scrap.imageUrl && !imgError)} />
        </div>

        {/* ── BACK ──────────────────────────────────────────────── */}
        <div className="flip-face flip-back w-full h-full rounded-lg overflow-hidden bg-surface border border-border flex flex-col">
          <div className="p-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <StarGlyph variant="gradient" size={16} />
              <span className="font-mono text-[10px] tracking-meta uppercase text-muted">
                AI insights
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFlipped(false)}
              className="text-muted hover:text-paper text-[10px] font-mono tracking-meta uppercase"
              aria-label="Flip back"
            >
              Close
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto no-scrollbar">
            <p className="text-[11px] text-dim mb-3">
              From <span className="text-paper">{scrap.title}</span> · routed to{" "}
              <span className="text-accent-deep font-medium">{project?.name}</span>
            </p>

            <ul className="space-y-2">
              {insights.map((text, i) => {
                const isOn = selected.has(i);
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => toggle(i)}
                      className={`w-full text-left p-2.5 rounded-sm border transition-colors flex items-start gap-2.5 ${
                        isOn
                          ? "border-accent/60 bg-accent/[0.08]"
                          : "border-border hover:border-border-strong bg-surface-2"
                      }`}
                    >
                      <span
                        className={`mt-0.5 w-4 h-4 flex-shrink-0 rounded-xs border flex items-center justify-center ${
                          isOn ? "bg-accent border-accent" : "border-dim"
                        }`}
                        aria-hidden="true"
                      >
                        {isOn && (
                          <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="#0F1012" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 8.5 6.5 12 13 5" />
                          </svg>
                        )}
                      </span>
                      <span className={`text-[13px] leading-snug ${isOn ? "text-paper" : "text-muted"}`}>
                        {text}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="p-3 border-t border-border">
            <button
              type="button"
              onClick={sendToTasks}
              disabled={selected.size === 0 || sent}
              className={`w-full h-10 rounded-sm font-mono text-[11px] tracking-meta uppercase transition-colors flex items-center justify-center gap-2 ${
                sent
                  ? "bg-accent-soft text-accent-deep border border-accent/40"
                  : selected.size === 0
                  ? "bg-surface-2 text-dim border border-border cursor-not-allowed"
                  : "bg-accent text-ink hover:bg-accent-deep hover:text-white shadow-sm"
              }`}
            >
              {sent ? (
                <>
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8.5 6.5 12 13 5" />
                  </svg>
                  Sent to Tasks
                </>
              ) : (
                <>
                  Send to Tasks
                  {selected.size > 0 && <span className="text-ink/70">· {selected.size}</span>}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// convenience: map a projectId to its tone key (exported for callers that
// need to tint a chip or indicator next to the card)
export function projectTone(projectId) {
  return PROJECT_TONE[projectId] || "muted";
}

/* ── text face ───────────────────────────────────────────────────
   Rendered on the front of a text-type card. The user's thought
   becomes the hero; the bottom carries a fixed "Some Idea" label
   + insight count. Reads the body safely via scrap.body ?? scrap.quote
   ?? scrap.title — nothing in the data schema has to change. */
function TextFace({ scrap, insights, isLight, textPrimary, textSecondary, textMeta }) {
  const content = (scrap.body || scrap.quote || scrap.title || "").trim();
  // Tall cards have more vertical room — let more lines through before clamping.
  const lineClamp = scrap.cardSize === "tall" ? "line-clamp-6" : "line-clamp-4";
  return (
    <div className="relative w-full h-full p-4 flex flex-col" style={{ background: scrap.preview }}>
      <div className="flex items-center justify-between">
        <Pill tone={isLight ? "muted" : "ink"}>{scrap.source}</Pill>
        <span className={`font-mono text-[10px] tracking-meta uppercase ${textMeta}`}>
          {scrap.date}
        </span>
      </div>

      <div className="flex-1 flex items-center min-h-0 my-3">
        <p
          className={`font-display text-[18px] md:text-[19px] leading-[1.38] tracking-tight ${textPrimary} ${lineClamp}`}
        >
          {content || "—"}
        </p>
      </div>

      <div>
        <div className={`font-mono text-[10px] tracking-meta uppercase ${textMeta}`}>
          Some Idea
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className={`text-[11px] ${textSecondary}`}>
            {insights.length} insight{insights.length === 1 ? "" : "s"}
          </span>
          <span
            className={`flex items-center gap-1 text-[10px] font-mono tracking-meta uppercase ${textMeta} opacity-0 group-hover:opacity-100 transition-opacity`}
          >
            Flip
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" />
              <path d="M18 2v5h-5M6 22v-5h5" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── link-preview face ───────────────────────────────────────────
   Rendered on the front of a link card when scrap.linkPreview is
   present and there's no imageUrl. Shows source + domain chip, a
   large title, and a short description — styled to match the rest
   of the inspiration wall while reading as a link reference. */
function LinkPreviewFace({ scrap, insights }) {
  const lp = scrap.linkPreview || {};
  const accent = lp.accent || "#5EEAD4";
  return (
    <div className="relative w-full h-full" style={{ background: scrap.preview }}>
      {/* accent wash — subtle glow tied to the platform tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(120% 70% at 0% 0%, ${accent}22, transparent 60%)`,
        }}
        aria-hidden="true"
      />
      <div className="relative w-full h-full p-4 flex flex-col text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: accent }}
              aria-hidden="true"
            />
            <Pill tone="ink">{lp.sourceName || scrap.source}</Pill>
          </div>
          <span className="font-mono text-[10px] tracking-meta uppercase text-white/80">
            {scrap.date}
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-end min-h-0">
          <div className="mb-2 font-mono text-[10px] tracking-meta uppercase text-white/70">
            {lp.contentType || "Reference"}
          </div>
          <h3 className="font-display text-[17px] leading-[1.15] tracking-tight text-paper line-clamp-2">
            {lp.pageTitle || scrap.title}
          </h3>
          {lp.description && (
            <p className="mt-2 text-[12px] text-white/80 leading-snug line-clamp-2">
              {lp.description}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] tracking-meta uppercase text-white/70 truncate">
              {lp.domain}
            </span>
            <span className="text-[11px] text-white/80">
              {insights.length} insight{insights.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── bottom-right arrow overlay ──────────────────────────────────
   Sits on the card's FRONT face only. Clicking it navigates to the
   full capture page at /scrap/:id without triggering the card flip.
   stopPropagation is critical since the front face has its own
   onClick handler that flips the card. */
function DetailArrow({ scrapId, isLight, hasPhoto }) {
  const base =
    "absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 z-10";
  // photo cards keep the dark scrim chip (white text stays legible over
  // any image). Stylized light cards use an ink chip with white text;
  // stylized dark-preview cards use a white chip with ink text.
  const tone = hasPhoto
    ? "bg-black/55 text-white hover:bg-black/75 backdrop-blur-sm"
    : isLight
    ? "bg-ink/90 text-white hover:bg-ink"
    : "bg-white/95 text-ink hover:bg-white";
  return (
    <Link
      to={`/scrap/${scrapId}`}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      aria-label="Open capture detail page"
      className={`${base} ${tone} opacity-80 hover:opacity-100 hover:scale-105 shadow-sm`}
    >
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 8h10M9 4l4 4-4 4" />
      </svg>
    </Link>
  );
}
