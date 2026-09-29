// Deterministic stubs for Inspiro's "AI." v2 — adds insight generation and a
// Send-to-Tasks helper. Everything is keyed on input so the demo is reproducible.

import { projects } from "./fixtures.js";

const KEYWORD_MAP = {
  typography: ["capstone"],
  minimalist: ["capstone", "studio-chen"],
  grid: ["capstone"],
  japanese: ["capstone"],
  thesis: ["capstone"],
  editorial: ["capstone"],
  texture: ["studio-chen", "capstone"],
  tactile: ["studio-chen", "capstone"],
  launch: ["studio-chen"],
  moodboard: ["studio-chen"],
  tone: ["studio-chen"],
  music: ["musical"],
  lyrics: ["musical"],
  musical: ["musical"],
  hamilton: ["musical"],
  mozart: ["musical"],
  theatre: ["musical"],
  script: ["musical"],
  hook: ["musical", "capstone"],
  opening: ["musical", "capstone"],
};

function scoreProjects(text) {
  const lower = (text || "").toLowerCase();
  const scores = {};
  Object.keys(KEYWORD_MAP).forEach((kw) => {
    if (lower.includes(kw)) {
      KEYWORD_MAP[kw].forEach((pid, idx) => {
        if (!scores[pid]) scores[pid] = { score: 0, matched: [] };
        scores[pid].score += idx === 0 ? 2 : 1;
        if (!scores[pid].matched.includes(kw)) scores[pid].matched.push(kw);
      });
    }
  });
  return Object.entries(scores)
    .map(([pid, v]) => ({
      projectId: pid,
      confidence: Math.min(96, 58 + v.score * 8 + v.matched.length * 3),
      matched: v.matched.slice(0, 3),
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
}

// ── routing ─────────────────────────────────────────────────────────────
export function routeFragment(text, { delayMs = 1200 } = {}) {
  return new Promise((resolve) => {
    let matches = scoreProjects(text);
    if (matches.length === 0) {
      matches = [{ projectId: "musical", confidence: 62, matched: ["general"] }];
    }
    setTimeout(() => resolve(matches), delayMs);
  });
}

// ── insight generation ─────────────────────────────────────────────────
// Given a scrap, return a few short, actionable insight bullets. Real scraps
// ship with insights seeded in fixtures.js; this handles newly-captured ones.
export function generateInsights(scrap) {
  if (scrap.insights?.length) return scrap.insights;
  const seed = (scrap.title || scrap.body || "").toLowerCase();
  const bank = [
    "Pull the strongest line as a cold open",
    "Contrast tone with the previous capture",
    "Test a 10-second hook for this",
    "Use as reference in the next studio review",
    "Add to moodboard — tactile column",
  ];
  return bank.filter((_, i) => ((seed.length + i) % 2) === 0).slice(0, 3);
}

// ── task framing by project type ───────────────────────────────────────
const VERB_BANK = {
  thesis: ["Analyze", "Compare", "Synthesize", "Map", "Outline"],
  freelance: ["Sketch", "Source", "Order", "Deliver", "Draft a layout from"],
  content: ["Draft", "Publish", "Schedule", "Outline a post on", "Pull a quote from"],
};

export function frameInsightAsTask(insight, projectId) {
  const project = projects.find((p) => p.id === projectId);
  const type = project?.type || "content";
  const verb = VERB_BANK[type][(insight.length || 0) % VERB_BANK[type].length];
  // If the insight already looks like a task (starts with a verb), keep it.
  const startsWithVerb =
    /^(use|try|write|draft|edit|order|sketch|compare|analyze|test|add|pull|contrast|map|outline|deliver|schedule|publish)/i.test(
      insight.trim()
    );
  const title = startsWithVerb ? insight : `${verb} — ${insight}`;
  return {
    projectId,
    category: type === "content" ? "Video" : type === "freelance" ? "Watch & Play" : "Column",
    title,
    dateGroup: "This week (Apr 12 – Apr 18)",
    status: "active",
    locked: false,
  };
}
