// Input — multimodal capture. Four modes (text / image / link / voice) flow
// through a single stepper: compose → route (fake AI) → confirm. On desktop
// the composer sits on the left and a live "routing preview" pane sits on
// the right. On mobile they collapse into a single column.

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store.js";
import { routeFragment } from "../lib/fakeAI.js";
import { parseLinkPreview, gradientForPreview } from "../lib/linkPreview.js";
import AppShell from "../components/layout/AppShell.jsx";
import StarGlyph from "../components/StarGlyph.jsx";
import Pill from "../components/primitives/Pill.jsx";

const MODES = [
  { id: "text", label: "Text", hint: "A thought, a quote, a half-formed line.", icon: IconText },
  { id: "link", label: "Link", hint: "Paste a URL and we'll pull a title.", icon: IconLink },
  { id: "image", label: "Image", hint: "Drop a screenshot or a reference.", icon: IconImage },
  { id: "voice", label: "Voice", hint: "Record 60s. We'll transcribe.", icon: IconVoice },
];

const TINT_HEX = { accent: "#5EEAD4", lilac: "#B5A8FF", coral: "#FB8C6B" };

export default function Input() {
  const navigate = useNavigate();
  const addScrap = useStore((s) => s.addScrap);
  const projects = useStore((s) => s.projects);

  const [mode, setMode] = useState("text");
  const [draft, setDraft] = useState("");
  const [step, setStep] = useState("compose"); // compose | routing | done
  const [matches, setMatches] = useState([]);
  const [chosenProject, setChosenProject] = useState(null);
  const [createdScrap, setCreatedScrap] = useState(null);
  // Local preview URL for uploaded images. We use URL.createObjectURL so the
  // file stays referenceable through the routing flow and ends up on the
  // homepage card as scrap.imageUrl. The previous URL is revoked when the
  // user picks a different image.
  const [imageUrl, setImageUrl] = useState(null);
  const [imageName, setImageName] = useState("");
  // Voice capture state. `audioUrl` is a blob: URL created by MediaRecorder
  // (or left null if the user only used the mock path). `audioDuration` is
  // in seconds. Keeping both on the parent means confirm() can attach them
  // to the scrap and ScrapDetail can render a playable <audio> element.
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);

  // Optional multimodal addendum for image captures. Users can attach a
  // short note and/or a voice memo to an uploaded image before routing.
  // Both are optional and cleared whenever the image is swapped or the
  // capture flow resets. Voice follows the same blob-URL + duration shape
  // as the main voice mode so ScrapDetail can render it the same way.
  const [noteText, setNoteText] = useState("");
  const [noteAudioUrl, setNoteAudioUrl] = useState(null);
  const [noteAudioDuration, setNoteAudioDuration] = useState(0);

  const currentMode = MODES.find((m) => m.id === mode);
  const canSubmit = draft.trim().length > 0;

  // Derive a mock rich-link preview in link mode. Returns null when the
  // draft isn't a URL yet — callers fall back to the plain preview.
  const linkPreview = useMemo(
    () => (mode === "link" ? parseLinkPreview(draft) : null),
    [mode, draft]
  );

  const route = async () => {
    if (!canSubmit) return;
    setStep("routing");
    const res = await routeFragment(draft, { delayMs: 1100 });
    setMatches(res);
    setChosenProject(res[0]?.projectId || projects[0].id);
  };

  // Handle a picked image file: revoke any previous blob URL, generate a new
  // one, and stash the filename for display. The blob URL stays alive through
  // the routing flow and is what ends up on the homepage card.
  const handleImageFile = (file) => {
    if (!file) return;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setImageName(file.name);
    setDraft(file.name);
    // Swapping the image clears any context the user had attached to the
    // previous one — text + voice memo — so the addendum always reflects
    // the currently-attached image.
    if (noteAudioUrl) {
      try { URL.revokeObjectURL(noteAudioUrl); } catch { /* ignore */ }
    }
    setNoteText("");
    setNoteAudioUrl(null);
    setNoteAudioDuration(0);
  };

  const confirm = () => {
    // For link mode, prefer the parsed preview's title/source when we have
    // one — it feels smarter than echoing the raw URL back at the user.
    const title =
      mode === "link" && linkPreview
        ? linkPreview.pageTitle
        : mode === "text" || mode === "voice"
        ? draft.split("\n")[0].slice(0, 60) || "Untitled capture"
        : draft.slice(0, 60);

    const preview =
      mode === "image"
        ? "linear-gradient(160deg, #1c1814 0%, #4a3e33 100%)"
        : mode === "link"
        ? gradientForPreview(linkPreview)
        : mode === "voice"
        ? "linear-gradient(150deg, #FAFAF8 0%, #F0EEE6 100%)"
        : "linear-gradient(160deg, #FAFAF8 0%, #EEE8DA 100%)";
    const art =
      mode === "image" ? "portrait" : mode === "voice" ? "waveform" : mode === "link" ? "typography" : "quote";

    const scrap = {
      source:
        mode === "link" && linkPreview
          ? linkPreview.sourceName
          : mode === "text"
          ? "Text"
          : mode === "link"
          ? "Link"
          : mode === "image"
          ? "Photos"
          : "Audio text",
      type: mode,
      projectId: chosenProject,
      title,
      body: draft,
      preview,
      art,
      insights: [],
      // Extra fields for link mode — safe to include for other modes since
      // renderers treat them as optional.
      ...(mode === "link" && linkPreview
        ? { url: linkPreview.url, linkPreview }
        : {}),
      // Image mode: attach the blob URL as scrap.imageUrl so the homepage
      // photo branch and ScrapDetail img both pick it up.
      ...(mode === "image" && imageUrl ? { imageUrl } : {}),
      // Voice mode: attach the recording's blob URL + duration when we
      // actually captured audio (the mock path leaves audioUrl null, and
      // ScrapDetail falls back to the stylized waveform hero).
      ...(mode === "voice" && audioUrl ? { audioUrl, audioDuration } : {}),
      // Image mode optional addendum — text note and/or voice memo the
      // user attached to the uploaded image. Both are fully optional and
      // only emitted when present, so downstream renderers can treat them
      // as schema-level optional fields.
      ...(mode === "image" && noteText.trim()
        ? { noteText: noteText.trim() }
        : {}),
      ...(mode === "image" && noteAudioUrl
        ? { noteAudioUrl, noteAudioDuration }
        : mode === "image" && noteAudioDuration > 0
        ? { noteAudioDuration }
        : {}),
    };
    addScrap(scrap);
    setCreatedScrap(scrap);
    setStep("done");
  };

  const reset = () => {
    setStep("compose");
    setDraft("");
    setMatches([]);
    setChosenProject(null);
    setCreatedScrap(null);
    // Clear the local image refs but DON'T revoke the blob — the captured
    // scrap on the homepage is still pointing at it.
    setImageUrl(null);
    setImageName("");
    // Same for voice: drop the local refs, keep the blob alive for the scrap.
    setAudioUrl(null);
    setAudioDuration(0);
    // Reopening the capture flow should present a clean slate — any
    // image-note addendum (text + voice) from the previous capture is
    // scoped to that capture only and should not leak into the next one.
    setNoteText("");
    setNoteAudioUrl(null);
    setNoteAudioDuration(0);
  };

  return (
    <AppShell>
      {/* ── header ──────────────────────────────────────────────── */}
      <section className="pt-8 md:pt-14 pb-4 md:pb-6">
        <div className="meta mb-3">Capture</div>
        <h1 className="font-display text-display-lg text-paper">Input</h1>
        <p className="mt-3 text-[15px] text-muted max-w-md">
          Drop anything — Inspiro figures out where it belongs.
        </p>
      </section>

      {/* ── stepper ─────────────────────────────────────────────── */}
      <Stepper step={step} />

      {/* ── body ───────────────────────────────────────────────── */}
      {step === "compose" && (
        <div className="py-4 md:py-6 lg:grid lg:grid-cols-[1fr_360px] lg:gap-10 items-start">
          <div>
            <ModePicker mode={mode} setMode={setMode} />
            <Composer
              mode={currentMode}
              draft={draft}
              setDraft={setDraft}
              imageUrl={imageUrl}
              imageName={imageName}
              onPickImage={handleImageFile}
              audioUrl={audioUrl}
              audioDuration={audioDuration}
              setAudio={(url, dur) => {
                setAudioUrl(url);
                setAudioDuration(dur);
              }}
              noteText={noteText}
              setNoteText={setNoteText}
              noteAudioUrl={noteAudioUrl}
              noteAudioDuration={noteAudioDuration}
              setNoteAudio={(url, dur) => {
                setNoteAudioUrl(url);
                setNoteAudioDuration(dur);
              }}
            />
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={route}
                disabled={!canSubmit}
                className={`h-11 px-5 rounded-sm font-mono text-[11px] tracking-meta uppercase transition-colors flex items-center gap-2 ${
                  canSubmit
                    ? "bg-accent text-ink hover:bg-accent-deep hover:text-white shadow-sm"
                    : "bg-surface-2 text-dim border border-border cursor-not-allowed"
                }`}
              >
                <StarGlyph variant={canSubmit ? "ink" : "ink"} size={14} />
                Route with Inspiro
              </button>
              <span className="text-[11px] text-dim">
                {draft.length > 0 ? `${draft.length} chars` : "or paste to start"}
              </span>
            </div>
          </div>

          {/* live preview pane (desktop only) */}
          <aside className="hidden lg:block">
            <div className="sticky top-[96px]">
              {mode === "link" && linkPreview ? (
                <LinkPreviewPane preview={linkPreview} />
              ) : mode === "image" && imageUrl ? (
                <div className="rounded-md border border-border bg-surface overflow-hidden">
                  <div className="bg-surface-3">
                    <img
                      src={imageUrl}
                      alt={imageName || "Uploaded image"}
                      className="block w-full max-h-[260px] object-contain"
                      draggable={false}
                    />
                  </div>
                  <div className="p-5">
                    <div className="meta mb-2">Live preview</div>
                    <h3 className="font-display text-lg text-paper leading-tight truncate">
                      {imageName || "Uploaded image"}
                    </h3>
                    <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
                      <Pill tone="muted">Image</Pill>
                      <Pill tone="accent">Ready to route</Pill>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border border-border bg-surface p-5">
                  <div className="meta mb-3">Live preview</div>
                  <h3 className="font-display text-lg text-paper leading-tight">
                    {draft.split("\n")[0].slice(0, 60) || "Your capture will appear here"}
                  </h3>
                  <p className="mt-2 text-[13px] text-muted line-clamp-5">
                    {draft.slice(0, 280) ||
                      (mode === "link"
                        ? "Paste a URL — we'll infer the source and build a richer preview."
                        : mode === "image"
                        ? "Drop an image — we'll show the preview here."
                        : "Start typing — we'll match it to a project and pull insights once you hit route.")}
                  </p>
                  <div className="mt-5 pt-5 border-t border-border flex items-center gap-2">
                    <Pill tone="muted">{currentMode.label}</Pill>
                    {draft.length > 0 && <Pill tone="accent">Ready to route</Pill>}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {step === "routing" && (
        <Routing
          draft={draft}
          matches={matches}
          projects={projects}
          chosenProject={chosenProject}
          setChosenProject={setChosenProject}
          onBack={() => setStep("compose")}
          onConfirm={confirm}
        />
      )}

      {step === "done" && (
        <Confirmation
          scrap={createdScrap}
          project={projects.find((p) => p.id === createdScrap?.projectId)}
          onReset={reset}
          onGoHome={() => navigate("/home")}
        />
      )}
    </AppShell>
  );
}

/* ── subcomponents ─────────────────────────────────────────────── */

// Rich link-preview card for the Input aside. Mirrors the homepage link card
// so what the user sees here closely matches what gets saved.
function LinkPreviewPane({ preview }) {
  const gradient = gradientForPreview(preview);
  return (
    <div className="rounded-md border border-border overflow-hidden bg-surface">
      {/* branded hero strip */}
      <div
        className="relative h-28 border-b border-border"
        style={{ background: gradient }}
      >
        <div className="absolute inset-0 flex items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: preview.accent || "#A1A1AA" }}
              aria-hidden="true"
            />
            <span className="font-mono text-[10px] tracking-meta uppercase text-paper/80">
              {preview.sourceName}
            </span>
          </div>
          <span className="font-mono text-[10px] tracking-meta uppercase text-paper/60">
            {preview.contentType}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="meta mb-2">Live preview</div>
        <h3 className="font-display text-lg text-paper leading-tight">
          {preview.pageTitle}
        </h3>
        <p className="mt-2 text-[13px] text-muted line-clamp-3">
          {preview.description}
        </p>
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] tracking-meta uppercase text-dim truncate">
            {preview.domain}
          </span>
          <Pill tone="accent">Ready to route</Pill>
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }) {
  const steps = [
    { id: "compose", label: "Compose" },
    { id: "routing", label: "Route" },
    { id: "done", label: "Confirm" },
  ];
  const activeIdx = steps.findIndex((s) => s.id === step);
  return (
    <div className="flex items-center gap-2 md:gap-3 py-2">
      {steps.map((s, i) => {
        const isActive = i === activeIdx;
        const isPast = i < activeIdx;
        return (
          <div key={s.id} className="flex items-center gap-2 md:gap-3">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                isActive
                  ? "bg-accent text-ink"
                  : isPast
                  ? "bg-accent/20 text-accent"
                  : "bg-surface-3 text-dim"
              }`}
            >
              {isPast ? (
                <svg viewBox="0 0 16 16" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8.5 6.5 12 13 5" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`font-mono text-[10px] tracking-meta uppercase ${
                isActive ? "text-paper" : isPast ? "text-muted" : "text-dim"
              }`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <span className="w-6 md:w-10 h-px bg-border mx-1" aria-hidden="true" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ModePicker({ mode, setMode }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-5">
      {MODES.map((m) => {
        const Icon = m.icon;
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`group flex items-center gap-3 p-3 md:p-3.5 rounded-sm border transition-colors text-left ${
              active
                ? "border-accent/40 bg-accent-soft shadow-sm"
                : "border-border hover:border-border-strong bg-surface hover:bg-surface-2"
            }`}
          >
            <span
              className={`w-8 h-8 rounded-xs flex items-center justify-center flex-shrink-0 ${
                active ? "bg-accent text-ink" : "bg-surface-3 text-muted"
              }`}
            >
              <Icon />
            </span>
            <span className="min-w-0">
              <span className={`block text-[13px] font-medium ${active ? "text-paper" : "text-muted"}`}>
                {m.label}
              </span>
              <span className="hidden md:block text-[11px] text-dim line-clamp-1">{m.hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Composer({
  mode,
  draft,
  setDraft,
  imageUrl,
  imageName,
  onPickImage,
  audioUrl,
  audioDuration,
  setAudio,
  noteText,
  setNoteText,
  noteAudioUrl,
  noteAudioDuration,
  setNoteAudio,
}) {
  if (mode.id === "text" || mode.id === "link") {
    return (
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={
          mode.id === "link"
            ? "https://… paste anything you're reading"
            : "What's the thought? A line, a feeling, a hook."
        }
        className="w-full min-h-[220px] md:min-h-[260px] p-5 rounded-md bg-surface border border-border focus:border-border-strong focus:outline-none text-paper text-[15px] leading-relaxed resize-none placeholder:text-dim"
      />
    );
  }
  if (mode.id === "image") {
    // Once an image is picked we show a real thumbnail in-place. Clicking the
    // label still re-opens the picker, so users can swap the attachment.
    const hasImage = !!imageUrl;
    return (
      <div className="relative">
        <label
          className={`block w-full min-h-[220px] md:min-h-[260px] rounded-md overflow-hidden transition-colors cursor-pointer ${
            hasImage
              ? "border border-border hover:border-border-strong"
              : "border-2 border-dashed border-border bg-surface hover:border-border-strong hover:bg-surface"
          }`}
        >
          {hasImage ? (
            <div className="relative w-full min-h-[220px] md:min-h-[260px] bg-surface-3">
              <img
                src={imageUrl}
                alt={imageName || "Uploaded image"}
                className="block w-full h-full max-h-[420px] object-contain"
                draggable={false}
              />
              <div className="absolute top-3 right-3">
                <Pill tone="accent">Change image</Pill>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center mb-3">
                <IconImage />
              </div>
              <p className="text-[14px] text-paper">Drop an image, or click to pick</p>
              <p className="mt-1 text-[12px] text-dim">PNG, JPG, HEIC — up to 10MB</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => onPickImage?.(e.target.files?.[0])}
          />
        </label>
        {hasImage && (
          <div className="mt-3 flex items-center gap-2">
            <Pill tone="accent">Attached</Pill>
            <span className="text-[13px] text-muted truncate">
              {imageName || draft || "Uploaded image"}
            </span>
          </div>
        )}
        {/* Optional multimodal addendum — sits directly under the image
            preview and above the parent's "Route with Inspiro" button.
            Stays collapsed until the user opts in so the flow still feels
            one-step when they don't need extra context. */}
        {hasImage && (
          <NoteAddendum
            noteText={noteText}
            setNoteText={setNoteText}
            noteAudioUrl={noteAudioUrl}
            noteAudioDuration={noteAudioDuration}
            setNoteAudio={setNoteAudio}
          />
        )}
      </div>
    );
  }
  if (mode.id === "voice") {
    return (
      <VoiceComposer
        draft={draft}
        setDraft={setDraft}
        audioUrl={audioUrl}
        audioDuration={audioDuration}
        setAudio={setAudio}
      />
    );
  }
  return null;
}

// Voice composer.
//
// Prototype-safe strategy:
//   1. If the browser exposes navigator.mediaDevices.getUserMedia AND
//      MediaRecorder, we attempt a real recording. On stop, the recorded
//      Blob becomes an object URL we lift to the parent as `audioUrl`.
//   2. If permission is denied, the API is missing, or anything throws,
//      we fall back to the existing 6-second mock path: the button still
//      appears to record, we auto-stop at 6s, and we drop a placeholder
//      transcript into the draft so the flow continues unblocked.
//
// Either way the UI and data shape are identical:
//   - `audioUrl`      (blob URL, optional)
//   - `audioDuration` (seconds, number)
//   - `draft`         (transcript text shown on the card / detail)
// So when real speech-to-text is wired up later, only this component needs
// to change — the scrap schema and renderers already support it.
const MOCK_TRANSCRIPT =
  "Voice note · stage lighting cue, the way the ballad bridge dips — cool to warm.";

function VoiceComposer({ draft, setDraft, audioUrl, audioDuration, setAudio }) {
  const [recording, setRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [mode, setMode] = useState("idle"); // idle | real | mock
  const [error, setError] = useState("");

  // Refs for the live MediaRecorder path.
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const startedAtRef = useRef(0);
  const timerRef = useRef(null);

  // Defensive cleanup: if the user navigates away or swaps modes while we're
  // still holding a mic stream, release it.
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      try {
        if (recorderRef.current && recorderRef.current.state === "recording") {
          recorderRef.current.stop();
        }
      } catch {
        /* ignore */
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const supportsRealRecording = () =>
    typeof window !== "undefined" &&
    typeof window.MediaRecorder !== "undefined" &&
    !!navigator?.mediaDevices?.getUserMedia;

  // Kick off a "clock" that updates the displayed seconds while recording.
  const startTimer = () => {
    startedAtRef.current = Date.now();
    setTime(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTime((Date.now() - startedAtRef.current) / 1000);
    }, 100);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  // ── Mock path ─────────────────────────────────────────────────
  // Used when MediaRecorder is unavailable OR the user denied mic access.
  // Identical ergonomics to the real path so the rest of the flow is stable.
  const startMock = () => {
    setMode("mock");
    setRecording(true);
    startTimer();
    const stopAt = setTimeout(() => {
      finishMock();
    }, 6000);
    recorderRef.current = { __mockTimeout: stopAt };
  };

  const finishMock = () => {
    if (recorderRef.current?.__mockTimeout) {
      clearTimeout(recorderRef.current.__mockTimeout);
    }
    const elapsed = (Date.now() - startedAtRef.current) / 1000;
    stopTimer();
    setRecording(false);
    setTime(elapsed);
    setDraft((d) => d || MOCK_TRANSCRIPT);
    // Mock path: no real audio blob. Keep audioUrl null; duration still
    // lifts up so the UI can show how long the "recording" was.
    setAudio?.(null, Number(elapsed.toFixed(1)));
  };

  // ── Real path ─────────────────────────────────────────────────
  const startReal = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Pick a MIME type the browser actually supports. Left to default
      // when none of these work — MediaRecorder will choose something valid.
      const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
      const mimeType = candidates.find(
        (c) => window.MediaRecorder?.isTypeSupported?.(c)
      );
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const elapsed = (Date.now() - startedAtRef.current) / 1000;
        stopTimer();
        setRecording(false);
        setTime(elapsed);

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        // Revoke any previous recording to avoid leaking object URLs.
        if (audioUrl) {
          try {
            URL.revokeObjectURL(audioUrl);
          } catch {
            /* ignore */
          }
        }
        const url = URL.createObjectURL(blob);
        setAudio?.(url, Number(elapsed.toFixed(1)));
        setDraft((d) => d || MOCK_TRANSCRIPT);

        // Release the mic.
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };

      setMode("real");
      setRecording(true);
      startTimer();
      recorder.start();
    } catch (err) {
      // Permission denied, device busy, or API exploded — fall back cleanly.
      setError(
        err?.name === "NotAllowedError"
          ? "Mic access was blocked — using simulated capture."
          : "Mic unavailable — using simulated capture."
      );
      startMock();
    }
  };

  const stopReal = () => {
    try {
      if (recorderRef.current && recorderRef.current.state === "recording") {
        recorderRef.current.stop();
      }
    } catch {
      /* ignore */
    }
  };

  const clearRecording = () => {
    if (audioUrl) {
      try {
        URL.revokeObjectURL(audioUrl);
      } catch {
        /* ignore */
      }
    }
    setAudio?.(null, 0);
    setDraft("");
    setTime(0);
    setMode("idle");
    setError("");
  };

  const toggle = () => {
    if (recording) {
      if (mode === "real") stopReal();
      else finishMock();
      return;
    }
    // Starting fresh: prefer real recording when we can.
    if (supportsRealRecording()) {
      startReal();
    } else {
      setError("Recording not supported here — using simulated capture.");
      startMock();
    }
  };

  const hasCapture = !!(draft || audioUrl);

  return (
    <div className="w-full min-h-[260px] rounded-md bg-surface border border-border p-6 flex flex-col items-center justify-center">
      <button
        type="button"
        onClick={toggle}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
          recording ? "bg-coral" : "bg-accent hover:bg-accent-deep"
        }`}
        aria-label={recording ? "Stop recording" : "Start recording"}
      >
        {recording && <span className="absolute inset-0 rounded-full bg-coral/40 animate-ping" />}
        <span className={`relative ${recording ? "w-6 h-6 rounded-xs bg-ink" : "w-5 h-5 rounded-full bg-ink"}`} />
      </button>
      <div className="mt-5 font-mono text-[11px] tracking-meta uppercase text-muted">
        {recording
          ? `Recording · ${time.toFixed(1)}s${mode === "mock" ? " · simulated" : ""}`
          : hasCapture
          ? `Captured · ${Math.max(audioDuration || time, 0).toFixed(1)}s${
              audioUrl ? "" : " · simulated"
            }`
          : "Tap to record"}
      </div>

      {error && !recording && (
        <p className="mt-3 text-[11px] text-dim max-w-xs text-center">{error}</p>
      )}

      {audioUrl && !recording && (
        <audio
          src={audioUrl}
          controls
          className="mt-4 w-full max-w-sm"
          preload="metadata"
        />
      )}

      {draft && !recording && (
        <p className="mt-4 max-w-md text-center text-[14px] text-paper/90 italic">
          &ldquo;{draft}&rdquo;
        </p>
      )}

      {hasCapture && !recording && (
        <button
          type="button"
          onClick={clearRecording}
          className="mt-4 h-8 px-3 rounded-sm border border-border text-dim font-mono text-[10px] tracking-meta uppercase hover:border-border-strong hover:text-muted transition-colors"
        >
          Discard &amp; re-record
        </button>
      )}
    </div>
  );
}

// NoteAddendum — optional context attached to an image capture. Collapsed
// by default so image captures still feel like a single-step flow; expands
// on tap into a short textarea + compact voice memo. Both fields are
// optional; the user can leave either or both empty. Voice reuses the
// same MediaRecorder-with-mock-fallback strategy as VoiceComposer so
// behavior is consistent across the app, but the UI is deliberately small.
const NOTE_MAX_SECS = 60;

function NoteAddendum({
  noteText,
  setNoteText,
  noteAudioUrl,
  noteAudioDuration,
  setNoteAudio,
}) {
  const [open, setOpen] = useState(false);
  const hasNote = !!(
    (noteText && noteText.trim()) ||
    noteAudioUrl ||
    noteAudioDuration > 0
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`mt-3 inline-flex items-center gap-2 h-8 px-3 rounded-sm border border-dashed font-mono text-[10.5px] tracking-meta uppercase transition-colors ${
          hasNote
            ? "border-accent/40 text-accent hover:border-accent/60"
            : "border-border text-dim hover:border-border-strong hover:text-muted"
        }`}
      >
        <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {hasNote ? <path d="M3 8.5 6.5 12 13 5" /> : <path d="M8 3v10M3 8h10" />}
        </svg>
        {hasNote ? "Context added · edit" : "Add more context (optional)"}
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-md border border-border bg-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="meta">Context (optional)</div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-6 w-6 rounded-sm text-dim hover:text-muted hover:bg-surface-2 flex items-center justify-center transition-colors"
          aria-label="Hide context"
        >
          <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4l8 8M12 4 4 12" />
          </svg>
        </button>
      </div>

      <textarea
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        placeholder="Add a note (optional)…"
        className="w-full min-h-[72px] p-3 rounded-sm bg-ink/30 border border-border focus:border-border-strong focus:outline-none text-paper text-[13.5px] leading-relaxed resize-none placeholder:text-dim"
      />

      <NoteVoice
        noteAudioUrl={noteAudioUrl}
        noteAudioDuration={noteAudioDuration}
        setNoteAudio={setNoteAudio}
      />
    </div>
  );
}

// Compact voice memo used inside NoteAddendum. Mirrors VoiceComposer's
// real-then-mock recording strategy but renders in a single row so it
// sits comfortably under a multi-line textarea without taking over the
// layout. Enforces a 60s cap in both the real and mock paths.
function NoteVoice({ noteAudioUrl, noteAudioDuration, setNoteAudio }) {
  const [recording, setRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [mode, setMode] = useState("idle"); // idle | real | mock
  const [error, setError] = useState("");

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const startedAtRef = useRef(0);
  const timerRef = useRef(null);
  const autoStopRef = useRef(null);

  // Defensive cleanup on unmount.
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(autoStopRef.current);
      try {
        if (recorderRef.current && recorderRef.current.state === "recording") {
          recorderRef.current.stop();
        }
      } catch {
        /* ignore */
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const supportsRealRecording = () =>
    typeof window !== "undefined" &&
    typeof window.MediaRecorder !== "undefined" &&
    !!navigator?.mediaDevices?.getUserMedia;

  const startTimer = () => {
    startedAtRef.current = Date.now();
    setTime(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTime((Date.now() - startedAtRef.current) / 1000);
    }, 100);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  // ── Mock path ──────────────────────────────────────────────────
  const finishMock = () => {
    clearTimeout(autoStopRef.current);
    autoStopRef.current = null;
    const elapsed = (Date.now() - startedAtRef.current) / 1000;
    stopTimer();
    setRecording(false);
    setTime(elapsed);
    setNoteAudio?.(null, Number(Math.min(elapsed, NOTE_MAX_SECS).toFixed(1)));
  };

  const startMock = () => {
    setMode("mock");
    setRecording(true);
    startTimer();
    autoStopRef.current = setTimeout(() => {
      finishMock();
    }, NOTE_MAX_SECS * 1000);
  };

  // ── Real path ──────────────────────────────────────────────────
  const startReal = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
      const mimeType = candidates.find(
        (c) => window.MediaRecorder?.isTypeSupported?.(c)
      );
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        clearTimeout(autoStopRef.current);
        autoStopRef.current = null;
        const elapsed = (Date.now() - startedAtRef.current) / 1000;
        stopTimer();
        setRecording(false);
        setTime(elapsed);

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        if (noteAudioUrl) {
          try { URL.revokeObjectURL(noteAudioUrl); } catch { /* ignore */ }
        }
        const url = URL.createObjectURL(blob);
        setNoteAudio?.(url, Number(Math.min(elapsed, NOTE_MAX_SECS).toFixed(1)));

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };

      setMode("real");
      setRecording(true);
      startTimer();
      recorder.start();
      // Enforce the 60s cap in the real path too — the recorder's own
      // stop handler will pick up the blob + elapsed time as usual.
      autoStopRef.current = setTimeout(() => {
        try {
          if (recorder.state === "recording") recorder.stop();
        } catch {
          /* ignore */
        }
      }, NOTE_MAX_SECS * 1000);
    } catch (err) {
      setError(
        err?.name === "NotAllowedError"
          ? "Mic access was blocked — using simulated capture."
          : "Mic unavailable — using simulated capture."
      );
      startMock();
    }
  };

  const stopReal = () => {
    try {
      if (recorderRef.current && recorderRef.current.state === "recording") {
        recorderRef.current.stop();
      }
    } catch {
      /* ignore */
    }
  };

  const toggle = () => {
    if (recording) {
      if (mode === "real") stopReal();
      else finishMock();
      return;
    }
    if (supportsRealRecording()) {
      startReal();
    } else {
      setError("Recording not supported here — using simulated capture.");
      startMock();
    }
  };

  const clearRecording = () => {
    if (noteAudioUrl) {
      try { URL.revokeObjectURL(noteAudioUrl); } catch { /* ignore */ }
    }
    setNoteAudio?.(null, 0);
    setTime(0);
    setMode("idle");
    setError("");
  };

  const hasAudio = !!noteAudioUrl || noteAudioDuration > 0;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={toggle}
          className={`relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
            recording ? "bg-coral" : "bg-surface-3 hover:bg-surface-3 text-muted"
          }`}
          aria-label={recording ? "Stop recording" : "Start voice memo"}
        >
          {recording && <span className="absolute inset-0 rounded-full bg-coral/40 animate-ping" />}
          {recording ? (
            <span className="relative w-3 h-3 rounded-xs bg-ink" />
          ) : (
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="8" y="2.5" width="4" height="10" rx="2" />
              <path d="M5 10a5 5 0 0 0 10 0M10 15v2.5" />
            </svg>
          )}
        </button>

        <span className="font-mono text-[10.5px] tracking-meta uppercase text-muted tabular-nums">
          {recording
            ? `Recording · ${time.toFixed(1)}s${mode === "mock" ? " · sim" : ""}`
            : hasAudio
            ? `Voice added · ${Math.max(noteAudioDuration || time, 0).toFixed(1)}s${
                noteAudioUrl ? "" : " · sim"
              }`
            : "Tap mic to add a voice memo (optional)"}
        </span>

        {hasAudio && !recording && (
          <button
            type="button"
            onClick={clearRecording}
            className="ml-auto h-7 px-2 rounded-sm border border-border text-dim font-mono text-[10px] tracking-meta uppercase hover:border-border-strong hover:text-muted transition-colors"
          >
            Discard
          </button>
        )}
      </div>

      {error && !recording && (
        <p className="mt-2 text-[11px] text-dim">{error}</p>
      )}

      {noteAudioUrl && !recording && (
        <audio
          src={noteAudioUrl}
          controls
          className="mt-3 w-full"
          preload="metadata"
        />
      )}
    </div>
  );
}

function Routing({ draft, matches, projects, chosenProject, setChosenProject, onBack, onConfirm }) {
  const chosen = matches.find((m) => m.projectId === chosenProject);
  return (
    <div className="py-6 md:py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-5">
        <StarGlyph variant="processing" size={22} />
        <div>
          <h2 className="font-display text-xl text-paper leading-tight">Routing your capture</h2>
          <p className="text-[13px] text-muted">
            Matched on{" "}
            {chosen?.matched?.length ? chosen.matched.map((m) => `"${m}"`).join(", ") : "general signal"}.
            Pick the right home.
          </p>
        </div>
      </div>

      <blockquote className="border-l-2 border-accent pl-4 mb-6 text-[14px] text-paper/80 italic max-w-xl">
        {draft.slice(0, 180)}
        {draft.length > 180 && "…"}
      </blockquote>

      <ul className="space-y-2">
        {matches.map((m) => {
          const project = projects.find((p) => p.id === m.projectId);
          const active = chosenProject === m.projectId;
          return (
            <li key={m.projectId}>
              <button
                type="button"
                onClick={() => setChosenProject(m.projectId)}
                className={`w-full flex items-center gap-4 p-4 rounded-sm border transition-colors text-left ${
                  active
                    ? "border-accent/60 bg-accent/[0.08]"
                    : "border-border hover:border-border-strong bg-surface-2"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: TINT_HEX[project?.tint] || "#A1A1AA" }}
                />
                <span className="flex-1 min-w-0">
                  <div className="font-display text-[16px] text-paper">{project?.name}</div>
                  <div className="text-[12px] text-muted mt-0.5 truncate">
                    {m.matched.map((mm) => `#${mm}`).join(" · ")}
                  </div>
                </span>
                <span className="font-mono text-[11px] tracking-meta uppercase text-accent tabular-nums">
                  {m.confidence}%
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="h-11 px-5 rounded-sm border border-border text-paper font-mono text-[11px] tracking-meta uppercase hover:border-border-strong transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="h-11 px-5 rounded-sm bg-accent text-ink font-mono text-[11px] tracking-meta uppercase hover:bg-accent-deep hover:text-white transition-colors"
        >
          Send to {projects.find((p) => p.id === chosenProject)?.name}
        </button>
      </div>
    </div>
  );
}

function Confirmation({ scrap, project, onReset, onGoHome }) {
  return (
    <div className="py-8 md:py-12 max-w-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-accent/15 border border-accent/40 flex items-center justify-center">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="#5EEAD4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8.5 6.5 12 13 5" />
          </svg>
        </div>
        <h2 className="font-display text-2xl text-paper">Captured.</h2>
      </div>
      <p className="text-[14px] text-muted">
        Added to <span className="text-paper">{project?.name}</span>. Insights will be ready on Home.
      </p>

      <div className="mt-6 rounded-md border border-border bg-surface p-5">
        <div className="meta mb-2">Saved as</div>
        <div className="font-display text-lg text-paper">{scrap?.title}</div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onGoHome}
          className="h-11 px-5 rounded-sm bg-accent text-ink font-mono text-[11px] tracking-meta uppercase hover:bg-accent-deep hover:text-white transition-colors"
        >
          See it on Home
        </button>
        <button
          type="button"
          onClick={onReset}
          className="h-11 px-5 rounded-sm border border-border text-paper font-mono text-[11px] tracking-meta uppercase hover:border-border-strong transition-colors"
        >
          Capture another
        </button>
      </div>
    </div>
  );
}

/* ── icons ─────────────────────────────────────────────────────── */
function IconText() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h12M4 10h12M4 14h8" />
    </svg>
  );
}
function IconLink() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 12a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5l-1 1" />
      <path d="M12 8a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5l1-1" />
    </svg>
  );
}
function IconImage() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="14" height="12" rx="2" />
      <circle cx="8" cy="9" r="1.25" />
      <path d="m3 14 4-4 4 3 3-2 3 3" />
    </svg>
  );
}
function IconVoice() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2.5" width="4" height="10" rx="2" />
      <path d="M5 10a5 5 0 0 0 10 0M10 15v2.5" />
    </svg>
  );
}
