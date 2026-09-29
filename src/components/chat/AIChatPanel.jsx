// AIChatPanel — right-side sliding drawer with a mock Inspiro assistant.
//
// Behavior:
//   • Slides in from the right via CSS transform (no framer-motion dep).
//   • Homepage behind stays scrollable — the backdrop is pointer-transparent
//     so users can still interact with the page; click the backdrop on
//     mobile (where the panel covers most of the view) to close.
//   • Suggestion chips auto-fill the input and trigger a mock AI response.
//   • Canned replies for the two seeded prompts (timeline + ideas);
//     a generic "thinking then suggesting" reply for anything else.
//   • Typing animation reveals the AI message char-by-char.
//
// No routing, no store, no fixture changes — self-contained UI.

import { useEffect, useRef, useState } from "react";
import StarGlyph from "../StarGlyph.jsx";
import { useStore } from "../../lib/store.js";

/* ── mock reply generators ─────────────────────────────────────── */

const TIMELINE_REPLY = `Here's a 5-week capstone timeline based on your captures:

Week 1 — Research & inspiration review
 Audit the wall. Cluster captures by theme (Romeo, Elisabeth, stage light).

Week 2 — Define problem & scope
 Pick one thread. Write a one-sentence thesis. Lock the deliverable format.

Week 3 — Ideation & concept development
 Pull insights into 3 concept directions. Moodboard for each. Pick one.

Week 4 — Prototype & testing
 Build the rough cut / draft / mock. Share with 3 people. Capture reactions.

Week 5 — Iteration & refinement
 Tighten the strongest 60%. Cut the rest. Prepare final presentation.

Want me to turn this into tasks on your Tasks page?`;

const IDEAS_REPLY = `Three directions I'd explore, pulled from what's on your wall:

1 · AI-driven Inspiration Organizer
 Turn fragmented creative inputs into structured workflows.
 Related cards: Theatre Theories, Oat-Linen Paper Stock.

2 · Performance Emotion Analyzer
 Study how stage elements shape audience perception across musicals.
 Related cards: Stage Light Study, Elizabeth Musical.

3 · Creative Production Toolkit
 Bridge inspiration → execution for designers working solo.
 Related cards: Rock Mozart, Romeo et Juliette.

Pick one and I'll sketch a rough week-by-week.`;

// Capstone-only base presets. The original "Give me Capstone ideas based on
// my cards" chip was removed per spec — project-scoped ideas now live
// exclusively under the "Give me some ideas based on my cards" preset.
const BASE_SUGGESTIONS = [
  {
    key: "timeline",
    label: "Generate a timeline for my Capstone",
    reply: TIMELINE_REPLY,
  },
];

// Label for the contextual "summarize" preset. Exported as a constant so the
// chip label, the text auto-filled into the input, and the intent matcher in
// findReply() all agree — there's no brittle string duplication.
const SUMMARIZE_LABEL = "Help me summarize my inspirations";

/* ── project-aware summaries ───────────────────────────────────── */
// Author-provided summaries, one per project. Kept verbatim (including em
// dashes, arrows, and bullet characters). ChatBubble uses whitespace-pre-wrap
// so line breaks and leading spaces render as-is.
const PROJECT_SUMMARIES = {
  musical: `Your inspirations consistently explore the tension between individual desire and inevitable fate, framed through emotionally intense, theatrical storytelling.

Across Romeo & Juliet, Elisabeth, and Rock Mozart, there is a clear pattern of redefining classical narratives through modern emotional lenses. Love is not portrayed as purely romantic, but as something fragile, conflicted, and often destructive. In Romeo & Juliet, both in the original lyrics and musical adaptations, love becomes a form of rebellion—intense but doomed. Elisabeth shifts the focus toward a psychological struggle for freedom, where desire is intertwined with control and mortality. Rock Mozart further amplifies this by presenting genius and creativity as both liberating and isolating forces.

Stylistically, these works share a strong fusion of historical context with contemporary expression. Traditional stories are reinterpreted using modern musical language (e.g., rock elements), creating a contrast between past narratives and present emotional intensity.

Key Themes:

• Love vs. Fate — passion constrained by inevitability
• Freedom vs. Control — characters resisting societal or existential limits
• Life vs. Death — mortality as both an end and a form of release
• Tradition vs. Modernity — classical stories reimagined through modern aesthetics`,
  capstone: `Your Capstone inspirations reflect a strong focus on translating complex information into structured, actionable user experiences.

Across your references—ranging from data visualization examples to UX research workflows and prototyping cases—there is a consistent emphasis on clarity, decision-making, and system thinking. Data is not treated as static content, but as something that needs to be interpreted, prioritized, and communicated effectively to support user understanding.

The inclusion of user research methods (such as interviews and heuristic analysis) highlights a process that is not purely visual, but evidence-driven. Insights are derived from user behavior and pain points, then translated into design decisions through structured frameworks like information architecture and interaction flows.

At the same time, your prototyping references suggest a preference for iterative and testable design, where ideas are quickly materialized and validated. This indicates a workflow that connects research → synthesis → visualization → validation, rather than treating design as a one-step output.

Key Themes:

• Complexity → Clarity — simplifying dense information into understandable visuals
• Insight → Action — turning research findings into concrete design decisions
• System Thinking — structuring information across flows, hierarchies, and interactions
• Iteration & Validation — using prototypes to continuously test and refine ideas`,
  "studio-chen": `Your branding inspirations reveal a strong direction toward expressive communication systems that balance clarity with emotional impact.

Drawing from Paula Scher's work, there is a clear emphasis on bold, typographic-driven identity, where typography itself becomes the primary visual language. Her approach demonstrates how branding can function as a navigational and informational system, not just decoration—especially in large-scale or complex environments.

At the same time, your interest in infographic design introduces a contrasting but complementary perspective: structure, hierarchy, and clarity. Information is carefully organized to guide user understanding, emphasizing legibility, logical flow, and accessibility. This reflects a system-oriented mindset where branding also needs to communicate efficiently, not just expressively.

David Carson's grunge typography brings in a third dimension—controlled chaos and emotional disruption. His work challenges traditional readability to create a more visceral, subjective experience. This suggests an exploration of how branding can move beyond clarity to evoke mood, tension, and individuality.

Together, these influences point toward a hybrid branding approach that negotiates between:

• Order and disruption
• Function and expression
• System and personality

Key Themes:

• Typography as Identity — type as the core carrier of brand voice
• Clarity vs. Expression — balancing readability with emotional impact
• Structure vs. Chaos — integrating grid systems with intentional irregularity
• Information as Design Material — treating content itself as a visual system`,
};

function summaryForProject(projectFilter) {
  return PROJECT_SUMMARIES[projectFilter] || null;
}

// Label for the generic "give me ideas" preset that appears on every project
// tab. Kept as a constant so the chip label and the intent matcher stay in
// sync (and we can auto-fill the input with the exact same text on click).
const IDEAS_GENERAL_LABEL = "Give me some ideas based on my cards";

/* ── project-aware "ideas" replies ─────────────────────────────── */
// Author-provided copy, one per project. Replaces the original single
// IDEAS_REPLY whenever a specific project tab is selected — so the existing
// "Give me Capstone ideas…" preset AND the new "Give me some ideas…" preset
// both resolve to the correct, project-scoped response.
const PROJECT_IDEAS = {
  musical: `Here are a few directions you could explore based on your inspirations:

1. Exploring Fate and Inevitability in Musical Narratives
Investigate how fate shapes emotional intensity in musical storytelling. You could analyze how love and destiny intertwine and lead to inevitable tragedy, highlighting tension between choice and inevitability.

Related cards: Lyrics from Romeo et Juliette, Elizabeth Musical

2. Stage Emotion & Lighting Analysis (Video Project)
Create a short video analyzing how stage lighting and visual composition amplify emotional expression in musicals. Focus on how lighting guides audience attention and intensifies dramatic moments.

Related cards: Rock Mozart, Stage Light Study

3. Reinterpreting Classical Stories Through Modern Expression
Explore how traditional narratives are transformed through modern music styles (e.g., rock elements). You could examine how contemporary aesthetics reshape audience perception of historical stories.

Related cards: Rock Mozart, Theatre Theories`,
  capstone: `Here are a few directions you could explore based on your work:

1. Design a Data Visualization Series
Develop a cohesive set of visualizations that transform complex information into clear, engaging narratives. Focus on hierarchy, readability, and storytelling through data.

Related cards: Data Visualization, Infographic Design

2. Branding System for Data-Driven Products
Create a branding concept that integrates data aesthetics into identity design. Explore how visual systems, typography, and color can communicate analytical depth and clarity.

Related cards: Design Feeds, Branding`,
  "studio-chen": `Here are a few directions you could explore based on your visual inspirations:

1. Applying Texture to Existing Projects
Experiment with incorporating material textures into your current designs to add depth and tactility. This can elevate otherwise flat digital work into something more expressive.

Related cards: Oat Linen Paper Stock

2. Polaroid-Themed Infographic Series
Design a series of infographics using a Polaroid-inspired visual language. Explore framing, layering, and storytelling through nostalgic visual structures.

Related cards: Polaroid

3. David Carson-Inspired Experimental Logo
Create a logo that embraces distortion, irregular typography, and expressive composition. Push the boundary between readability and emotional impact.

Related cards: David Carson`,
};

function ideasForProject(projectFilter) {
  return PROJECT_IDEAS[projectFilter] || null;
}

function genericReply(userText) {
  const trimmed = (userText || "").trim();
  if (!trimmed) return "Ask me about any capture on your wall and I'll help turn it into a direction.";
  return `I'd start by looking at your captures tagged to this thought: "${trimmed.length > 80 ? trimmed.slice(0, 80) + "…" : trimmed}". A few angles to consider — narrow the scope to one concrete deliverable, identify which existing capture anchors the idea, and draft a one-sentence thesis before you build anything. Want me to route related insights into tasks?`;
}

// `projectFilter` is the currently selected tab from the store ("all" or a
// specific project id). When the user's text looks like a summarize intent
// AND a concrete project is selected, we return that project's mock summary.
// Otherwise we fall through to the existing timeline / ideas / generic replies
// so the two original presets keep working exactly as before.
function findReply(text, projectFilter) {
  const lower = (text || "").toLowerCase();
  const isSummarize =
    lower.includes("summarize my inspirations") ||
    lower.includes("summarise my inspirations") ||
    (lower.includes("summar") && lower.includes("inspirat"));
  if (isSummarize) {
    const summary = summaryForProject(projectFilter);
    if (summary) return summary;
    // User asked to summarize while in "All" — nudge them toward picking a
    // project rather than synthesizing across unrelated threads.
    return "Pick a specific project tab (Musical Account, Capstone, or Studio Chen) and ask again — I'll pull a focused summary from just those captures.";
  }
  if (lower.includes("timeline")) return TIMELINE_REPLY;
  // "Ideas" intent — covers both the original "Give me Capstone ideas…"
  // preset (key: ideas) and the new "Give me some ideas based on my cards"
  // preset (key: ideas-general). When a specific project tab is selected we
  // return that project's hardcoded response — this is what fixes the
  // previously incorrect Capstone "ideas" reply. In the "All" tab we fall
  // back to the generic IDEAS_REPLY so free-typed queries still resolve.
  if (lower.includes("idea")) {
    const projectIdeas = ideasForProject(projectFilter);
    if (projectIdeas) return projectIdeas;
    return IDEAS_REPLY;
  }
  return genericReply(text);
}

/* ── typing animation hook ─────────────────────────────────────── */

function useTypedReveal(fullText, active, speed = 14) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    if (!active) return;
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [fullText, active, speed]);
  return shown;
}

/* ── panel component ───────────────────────────────────────────── */

export default function AIChatPanel({ open, onClose }) {
  // messages: { id, role: "user" | "ai", text, typing?: boolean }
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const scrollRef = useRef(null);

  // Project context drives the third preset and the summarize response.
  // Reading lazily from the store keeps the panel decoupled from its parent
  // (Home doesn't need to pass anything new down).
  const projectFilter = useStore((s) => s.projectFilter);
  const currentProject = useStore((s) =>
    s.projects.find((p) => p.id === s.projectFilter)
  );
  // The two original presets ("Generate a timeline…", "Give me Capstone
  // ideas…") are Capstone-specific by nature, so they only appear on the
  // Capstone tab. Everywhere else (All, Musical Account, Studio Chen) they
  // stay hidden — users won't see Capstone framing when they're thinking
  // about a different project.
  const showCapstonePresets = projectFilter === "capstone";
  // The new generic "Give me some ideas based on my cards" preset appears on
  // every project tab (Musical, Capstone, Studio Chen) but NOT on "All" —
  // the response needs a specific project to pull ideas from.
  const showIdeasGeneral =
    projectFilter !== "all" && !!ideasForProject(projectFilter);
  // Summarize preset shows whenever a concrete project is selected AND we
  // have a mock summary keyed for it. In "All", it stays hidden.
  const showSummarize =
    projectFilter !== "all" && !!summaryForProject(projectFilter);
  const suggestions = [
    ...(showCapstonePresets ? BASE_SUGGESTIONS : []),
    ...(showIdeasGeneral
      ? [
          {
            key: "ideas-general",
            label: IDEAS_GENERAL_LABEL,
            // Reply is resolved at click time from PROJECT_IDEAS.
            reply: null,
          },
        ]
      : []),
    ...(showSummarize
      ? [
          {
            key: "summarize",
            label: SUMMARIZE_LABEL,
            // Reply is resolved at click time against the latest project filter.
            reply: null,
          },
        ]
      : []),
  ];

  // Close with Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Fresh-session reset. The panel is mounted for the entire lifetime of
  // Home and only toggles its CSS transform on close, so local useState
  // values survive close → reopen unless we clear them explicitly. Resetting
  // on every open (rather than on close) keeps the conversation visible
  // during the slide-out animation, and still guarantees the next open shows
  // the default preset screen. Only touches drawer-local UI state — no store
  // writes, no card/project side effects.
  useEffect(() => {
    if (!open) return;
    setMessages([]);
    setDraft("");
    setIsThinking(false);
    setInputFocused(false);
  }, [open]);

  // Scroll to bottom when new messages land.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isThinking]);

  const sendUserMessage = (text) => {
    const userText = (text || "").trim();
    if (!userText) return;
    const userMsg = { id: `u-${Date.now()}`, role: "user", text: userText };
    setMessages((m) => [...m, userMsg]);
    setDraft("");
    setIsThinking(true);
    // Fake latency so the reveal feels natural.
    window.setTimeout(() => {
      const aiText = findReply(userText, projectFilter);
      const aiMsg = { id: `a-${Date.now()}`, role: "ai", text: aiText, typing: true };
      setIsThinking(false);
      setMessages((m) => [...m, aiMsg]);
    }, 550);
  };

  const handleSuggestion = (s) => {
    // Per spec: contextual presets (summarize, ideas-general) first auto-fill
    // the input with their exact label, then send. We briefly show the text
    // in the input before send() clears it, matching the "auto-fill + submit"
    // interaction described. The two original Capstone presets keep their
    // existing behavior of sending directly.
    if (s.key === "summarize" || s.key === "ideas-general") {
      setDraft(s.label);
    }
    sendUserMessage(s.label);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendUserMessage(draft);
  };

  // Backdrop click-to-close (mobile) — desktop also fine since click
  // falls through pointer-events-none on the backdrop outside the panel.
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
      {/* ── backdrop (only catches clicks when open, dimmer on mobile) ── */}
      <div
        onClick={handleBackdropClick}
        aria-hidden={!open}
        className={`fixed inset-0 z-40 md:bg-transparent bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ── panel ─────────────────────────────────────────────────── */}
      <aside
        role="dialog"
        aria-modal="false"
        aria-label="Inspiro AI assistant"
        className={`fixed top-0 right-0 z-50 h-[100dvh] w-full md:w-[380px] border-l border-border bg-surface/95 backdrop-blur-xl shadow-lift flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* header */}
        <header className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-start gap-3 min-w-0">
            <span className="mt-0.5 flex-shrink-0">
              <StarGlyph variant="gradient" size={20} />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-[17px] leading-tight text-paper">
                Inspiro AI
              </h2>
              <p className="mt-0.5 text-[12px] text-muted leading-tight">
                Turn inspiration into action
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI assistant"
            className="flex-shrink-0 w-8 h-8 -mr-1 rounded-full flex items-center justify-center text-muted hover:text-paper hover:bg-surface-3 transition-colors"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </header>

        {/* scroll region (suggestions + messages) */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {/* suggestion chips only show when conversation is empty */}
          {messages.length === 0 && (
            <div>
              {suggestions.length > 0 && (
                <>
                  <div className="meta mb-3">
                    {currentProject
                      ? `Try one of these · ${currentProject.name}`
                      : "Try one of these"}
                  </div>
                  <div className="flex flex-col gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => handleSuggestion(s)}
                        className="text-left px-3.5 py-3 rounded-md border border-border hover:border-accent/60 hover:bg-accent/[0.06] transition-colors group"
                      >
                        <span className="flex items-start gap-2.5">
                          <span className="mt-0.5 text-accent flex-shrink-0">
                            <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true">
                              <path d="M8 1l1.8 4.4L14 7.2l-4.2 1.8L8 13.4 6.2 9 2 7.2l4.2-1.8L8 1z" />
                            </svg>
                          </span>
                          <span className="text-[13px] text-paper/90 leading-snug group-hover:text-paper">
                            {s.label}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* tiny hint — always visible so the panel never looks empty */}
              <p
                className={`${
                  suggestions.length > 0 ? "mt-5" : ""
                } text-[11.5px] text-dim leading-relaxed`}
              >
                Inspiro AI reads across your captures and helps shape them into
                a plan. Responses here are mocked — the real thing stays on brand.
              </p>
            </div>
          )}

          {/* messages */}
          {messages.map((m) => (
            <ChatBubble key={m.id} message={m} />
          ))}

          {/* thinking indicator */}
          {isThinking && <ThinkingDots />}
        </div>

        {/* input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-border px-4 py-3 flex items-center gap-2 bg-surface/80"
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            // Placeholder flips to the friendlier "Tell me what you wanna do"
            // the moment the user focuses the field, so the input greets them
            // with an actionable prompt instead of a restating of its purpose.
            placeholder={
              inputFocused
                ? "Tell me what you wanna do"
                : "Ask anything about your inspirations…"
            }
            className="flex-1 h-10 px-3 rounded-sm bg-surface-2 border border-border text-[13px] text-paper placeholder-dim focus:outline-none focus:border-accent/60 focus:bg-surface-3 transition-colors"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Send message"
            className={`h-10 w-10 rounded-sm flex items-center justify-center transition-colors ${
              draft.trim()
                ? "bg-accent text-ink hover:bg-accent-deep hover:text-white shadow-sm"
                : "bg-surface-2 text-dim cursor-not-allowed"
            }`}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 8h11M9 4l4 4-4 4" />
            </svg>
          </button>
        </form>
      </aside>
    </>
  );
}

/* ── sub-components ────────────────────────────────────────────── */

function ChatBubble({ message }) {
  const isUser = message.role === "user";
  const typedText = useTypedReveal(message.text, !isUser && message.typing);
  const shown = isUser ? message.text : (message.typing ? typedText : message.text);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] px-3.5 py-2.5 rounded-md text-[13px] leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-accent text-ink rounded-br-xs"
            : "bg-surface-2 border border-border text-paper/90 rounded-bl-xs"
        }`}
      >
        {shown}
        {!isUser && message.typing && shown.length < message.text.length && (
          <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-accent align-[-2px] animate-pulse" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex justify-start">
      <div className="px-3.5 py-3 rounded-md bg-surface-2 border border-border flex items-center gap-1.5">
        <Dot delay="0s" />
        <Dot delay="0.15s" />
        <Dot delay="0.3s" />
      </div>
    </div>
  );
}

function Dot({ delay }) {
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full bg-muted animate-pulse"
      style={{ animationDelay: delay }}
      aria-hidden="true"
    />
  );
}
