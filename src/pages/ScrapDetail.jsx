// ScrapDetail — full-bleed view of a single capture.
//
// Layout:
//   left column (1.4fr on lg)  — hero media + insights
//   right column (1fr on lg)   — capture metadata panel
// Mobile stacks top→bottom.
//
// Works strictly off the existing scrap shape from fixtures.js:
//   id, source, date, type, projectId, title, preview, art,
//   imageUrl?, cardSize, insights, url?, quote?
// Any missing fields render graceful fallbacks ("—", "Not recorded", etc).

import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useStore } from "../lib/store.js";
import AppShell from "../components/layout/AppShell.jsx";
import ScrapArt from "../components/cards/ScrapArt.jsx";
import Pill from "../components/primitives/Pill.jsx";
import StarGlyph from "../components/StarGlyph.jsx";

const TINT_HEX = { accent: "#5EEAD4", lilac: "#B5A8FF", coral: "#FB8C6B" };

function cardTone(preview) {
  const light = /FAFAF8|F3F0EA|F0EEE6|EEE8DA|E4E2DC|EDF0F2|E4E4E6|E8D5B7/i;
  return light.test(preview || "") ? "light" : "dark";
}

// pretty label for the input-type field
function typeLabel(type) {
  switch (type) {
    case "image": return "Image";
    case "link":  return "Link";
    case "text":  return "Text";
    case "voice": return "Voice note";
    default:      return type || "—";
  }
}

export default function ScrapDetail() {
  const { id } = useParams();
  const scrap = useStore((s) => s.getScrap(id));
  const project = useStore((s) => s.getProject(scrap?.projectId));
  const sendInsightsToTasks = useStore((s) => s.sendInsightsToTasks);

  const [imgError, setImgError] = useState(false);
  const [sent, setSent] = useState(false);

  if (!scrap) return <Navigate to="/home" replace />;

  const isPhoto = scrap.imageUrl && !imgError;
  const tone = cardTone(scrap.preview);
  const isVoice = scrap.type === "voice";
  const isText = scrap.type === "text";
  // For text captures, show the actual user content — body (new captures) or
  // quote (seeded scraps) — with a safe fallback.
  const textContent = isText ? (scrap.body || scrap.quote || scrap.title || "").trim() : "";

  const handleSendAll = () => {
    if (!scrap.insights?.length) return;
    sendInsightsToTasks(scrap.id, scrap.insights);
    setSent(true);
    setTimeout(() => setSent(false), 1800);
  };

  return (
    <AppShell>
      {/* ── back link ───────────────────────────────────────────── */}
      <div className="pt-6 md:pt-10">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 font-mono text-[11px] tracking-meta uppercase text-muted hover:text-paper transition-colors"
        >
          <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 4 6 8l4 4" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* ── header ──────────────────────────────────────────────── */}
      <section className="pt-4 md:pt-6 pb-8 md:pb-10">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <Pill tone="muted">{scrap.source}</Pill>
          <span className="font-mono text-[10.5px] tracking-meta uppercase text-dim">
            {scrap.date}
          </span>
          {project && (
            <span className="flex items-center gap-1.5 font-mono text-[10.5px] tracking-meta uppercase text-muted">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: TINT_HEX[project.tint] }}
              />
              {project.name}
            </span>
          )}
        </div>
        <h1 className="font-display text-display-md md:text-display-lg text-paper">
          {isText ? "Text" : scrap.title}
        </h1>
      </section>

      {/* ── two-col body ────────────────────────────────────────── */}
      <section className="lg:grid lg:grid-cols-[1.4fr_1fr] lg:gap-12">
        {/* ── LEFT: media + insights ─────────────────────────── */}
        <div className="mb-10 lg:mb-0 min-w-0">
          {/* hero — text captures get a dedicated presentation block; all
              other types keep the original media hero. */}
          {isText ? (
            <div className="rounded-lg border border-border bg-surface p-6 md:p-9">
              <div className="meta mb-4">Captured text</div>
              <p className="font-display text-[22px] md:text-[26px] text-paper leading-[1.55] tracking-tight whitespace-pre-wrap max-w-[58ch]">
                {textContent || "—"}
              </p>
            </div>
          ) : (
            <div
              className="relative rounded-lg overflow-hidden border border-border shadow-card"
              style={{ background: scrap.preview, aspectRatio: "4 / 3" }}
            >
              {isPhoto ? (
                <img
                  src={scrap.imageUrl}
                  alt={scrap.title}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="absolute inset-0 p-8 flex items-center justify-center">
                  <div className="w-full h-full max-w-md">
                    <ScrapArt art={scrap.art} tone={tone} quote={scrap.quote} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Optional image-capture addendum: users can attach a short note
              and/or a voice memo to an uploaded image at capture time. Both
              fields are optional, so we only render the block when at least
              one is present. Sits directly under the hero so it reads as
              contextual metadata, not primary content. */}
          {scrap.type === "image" &&
            (scrap.noteText ||
              scrap.noteAudioUrl ||
              scrap.noteAudioDuration > 0) && (
              <div className="mt-5 rounded-md border border-border bg-surface p-4 md:p-5">
                <div className="meta mb-3">Context added at capture</div>
                {scrap.noteText && (
                  <p className="text-[14px] md:text-[15px] text-paper/90 leading-relaxed whitespace-pre-wrap max-w-[58ch]">
                    {scrap.noteText}
                  </p>
                )}
                {scrap.noteAudioUrl && (
                  <audio
                    src={scrap.noteAudioUrl}
                    controls
                    className={`w-full ${scrap.noteText ? "mt-4" : ""}`}
                    preload="metadata"
                  />
                )}
                {!scrap.noteAudioUrl && scrap.noteAudioDuration > 0 && (
                  <div
                    className={`font-mono text-[10.5px] tracking-meta uppercase text-dim tabular-nums ${
                      scrap.noteText ? "mt-3" : ""
                    }`}
                  >
                    Voice memo · {Number(scrap.noteAudioDuration).toFixed(1)}s · simulated
                  </div>
                )}
              </div>
            )}

          {/* voice playback — only for voice captures with a real audio blob.
              Sits just under the waveform hero; the stylized art stays as
              the visual anchor when we don't have a blob. */}
          {isVoice && scrap.audioUrl && (
            <div className="mt-5 rounded-md border border-border bg-surface p-4 md:p-5">
              <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                <div className="meta">Recording</div>
                {scrap.audioDuration ? (
                  <span className="font-mono text-[10.5px] tracking-meta uppercase text-dim tabular-nums">
                    {Number(scrap.audioDuration).toFixed(1)}s
                  </span>
                ) : null}
              </div>
              <audio
                src={scrap.audioUrl}
                controls
                className="w-full"
                preload="metadata"
              />
            </div>
          )}

          {/* external link — only rendered if scrap.url exists (e.g. s7) */}
          {scrap.url && (
            <a
              href={scrap.url}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-5 inline-flex items-center gap-2 h-10 px-4 rounded-sm border border-border-strong text-paper font-mono text-[11px] tracking-meta uppercase hover:border-accent hover:text-accent transition-colors"
            >
              Open original
              <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3h7v7M13 3 6 10M11 9v4H3V5h4" />
              </svg>
            </a>
          )}

          {/* pulled quote — only when scrap.quote exists AND we haven't already
              shown it in the text hero above. */}
          {scrap.quote && !isText && (
            <div className="mt-8 md:mt-10">
              <div className="meta mb-3">Captured text</div>
              <blockquote className="text-[18px] md:text-[20px] text-paper/90 leading-relaxed italic font-display max-w-[55ch] border-l-2 border-accent/60 pl-5">
                "{scrap.quote}"
              </blockquote>
            </div>
          )}

          {/* insights */}
          {scrap.insights?.length > 0 && (
            <div className="mt-10 md:mt-12">
              <div className="flex items-end justify-between mb-4 gap-4 flex-wrap">
                <div>
                  <div className="meta mb-2">Insights</div>
                  <h2 className="font-display text-2xl text-paper">
                    What Inspiro pulled out
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleSendAll}
                  disabled={sent}
                  className={`h-10 px-4 rounded-sm font-mono text-[11px] tracking-meta uppercase transition-colors flex items-center gap-2 ${
                    sent
                      ? "bg-accent/20 text-accent border border-accent/40"
                      : "bg-accent text-ink hover:bg-accent-deep hover:text-white shadow-sm"
                  }`}
                >
                  {sent ? (
                    <>
                      <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 8.5 6.5 12 13 5" />
                      </svg>
                      Sent
                    </>
                  ) : (
                    "Send all to Tasks"
                  )}
                </button>
              </div>
              <ul className="space-y-2">
                {scrap.insights.map((t, i) => (
                  <li
                    key={i}
                    className="p-4 rounded-sm border border-border bg-surface flex items-start gap-3"
                  >
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                    <span className="text-[14px] md:text-[15px] text-paper/90 leading-relaxed">
                      {t}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── RIGHT: capture record ──────────────────────────── */}
        <aside className="min-w-0">
          <div className="lg:sticky lg:top-24 space-y-5">
            <div className="rounded-md border border-border bg-surface p-5 md:p-6">
              <div className="flex items-center gap-2 mb-5">
                <StarGlyph variant="gradient" size={14} />
                <div className="meta">Capture record</div>
              </div>

              <dl className="divide-y divide-border">
                <MetaRow label="Project">
                  {project ? (
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: TINT_HEX[project.tint] }}
                      />
                      <span className="text-paper">{project.name}</span>
                    </span>
                  ) : (
                    "—"
                  )}
                </MetaRow>
                <MetaRow label="Source">{scrap.source}</MetaRow>
                <MetaRow label="Input type">{typeLabel(scrap.type)}</MetaRow>
                <MetaRow label="Captured">{scrap.date}</MetaRow>
                <MetaRow label="Voice input">
                  {isVoice ? (
                    <span className="inline-flex items-center gap-2 text-accent">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      {scrap.audioUrl
                        ? `Recorded${
                            scrap.audioDuration
                              ? ` · ${Number(scrap.audioDuration).toFixed(1)}s`
                              : ""
                          }`
                        : "Simulated"}
                    </span>
                  ) : (
                    <span className="text-dim">Not recorded</span>
                  )}
                </MetaRow>
                <MetaRow label="Insights">
                  {scrap.insights?.length
                    ? `${scrap.insights.length} pulled`
                    : <span className="text-dim">None yet</span>}
                </MetaRow>
              </dl>
            </div>

            {/* flip-style nudge */}
            <Link
              to="/home"
              className="block rounded-md border border-border bg-surface/20 p-5 hover:border-border-strong transition-colors"
            >
              <div className="meta mb-2">On the wall</div>
              <p className="text-[13px] text-muted leading-relaxed">
                Flip this capture on Home to pick specific insights and route
                them into tasks.
              </p>
              <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-mono tracking-meta uppercase text-paper">
                Go to Home
                <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </div>
            </Link>
          </div>
        </aside>
      </section>

      {/* breathing room at the bottom of the scroll */}
      <div className="h-20" aria-hidden="true" />
    </AppShell>
  );
}

/* ── row helper ───────────────────────────────────────────────── */

function MetaRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="font-mono text-[10.5px] tracking-meta uppercase text-dim pt-0.5 flex-shrink-0">
        {label}
      </dt>
      <dd className="text-[13px] text-paper/80 text-right min-w-0">{children}</dd>
    </div>
  );
}
