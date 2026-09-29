// Seed data for Inspiro v2. Mirrors the mockup (Wechat, Instagram, Youtube,
// Photos, Audio text) while keeping the underlying IA.

export const projects = [
  { id: "musical", name: "Musical Account", type: "content", tint: "accent" },
  { id: "capstone", name: "Capstone", type: "thesis", tint: "lilac" },
  { id: "studio-chen", name: "Studio Chen", type: "freelance", tint: "coral" },
];

// Inspiration "scraps" — each has an image/preview and AI-generated insights.
// `cardSize` drives the masonry grid on Home ("tall" = 2 rows).
// `imageUrl` (optional) points at a real photo in /public/captures. When
// present, InspirationCard renders the photo full-bleed; otherwise it falls
// back to the gradient `preview` + stylized `art` SVG.
export const scraps = [
  {
    id: "s1",
    source: "Wechat",
    date: "04/14",
    type: "image",
    projectId: "musical",
    title: "Lyrics from Romeo et Juliette",
    preview:
      "linear-gradient(160deg, #2a2620 0%, #4a3e33 40%, #1c1814 100%)",
    art: "books",
    imageUrl: "/captures/s1-romeo-books.png",
    cardSize: "tall",
    insights: [
      "Analyze the tragic nature of Romeo and Juliet’s love.",
      "Write an article to examine Shakespeare’s invention of new words in his plays introducing a 'Death' character to the story",
      "Write an article to contrast verse cadence with prose scenes",
    ],
  },
  {
    id: "s2",
    source: "Instagram",
    date: "04/14",
    type: "link",
    projectId: "musical",
    title: "Theatre Theories",
    preview: "linear-gradient(150deg, #FAFAF8 0%, #EDECE6 100%)",
    art: "typography",
    imageUrl: "/captures/s2-theatre-theories.jpg",
    cardSize: "normal",
    insights: [
      "Make a video to explore how theater layout shapes audience emotion",
      "Trace the evolution of theater design across historical periods",
    ],
  },
  {
    id: "s3",
    source: "Youtube",
    date: "04/10",
    type: "link",
    projectId: "musical",
    title: "Elizabeth Musical",
    preview: "linear-gradient(160deg, #1b1a24 0%, #4c3a5a 100%)",
    art: "portrait",
    imageUrl: "/captures/s3-elizabeth.jpg",
    cardSize: "normal",
    insights: [
      "Analyze how the meaning of “kitsch” shifts across German drama and novels",
      "Compare costume design changes across different versions of Elisabeth",
    ],
  },
  {
    // s4 intentionally has no imageUrl — renders as stylized waveform card.
    id: "s4",
    source: "Audio text",
    date: "04/06",
    type: "voice",
    projectId: "musical",
    title: "Hamilton",
    preview: "linear-gradient(150deg, #FAFAF8 0%, #F0EEE6 100%)",
    art: "waveform",
    cardSize: "normal",
    insights: [
      "Analyze the love between Alexander Hamilton and Elizabeth Hamilton",
      "Examine how rap functions in the musical Hamilton",
    ],
  },
  {
    id: "s5",
    source: "Photos",
    date: "04/01",
    type: "image",
    projectId: "musical",
    title: "Rock Mozart",
    preview: "linear-gradient(160deg, #1c1b22 0%, #3a2f3e 100%)",
    art: "portrait-bw",
    imageUrl: "/captures/s5-rock-mozart.jpg",
    cardSize: "tall",
    insights: [
      "Retouch the photo and prepare it for publishing",
      "Edit the image and send it to the actor",
    ],
  },
  {
    id: "s6",
    source: "Photos",
    date: "03/28",
    type: "image",
    projectId: "musical",
    title: "Stage light study",
    preview: "linear-gradient(150deg, #E4E4E6 0%, #9A9AA2 100%)",
    art: "grad",
    imageUrl: "/captures/s6-stage-lights.png",
    cardSize: "normal",
    insights: [
      "Analyze how lighting intensifies audience emotion",
      "Explore the principles behind effective stage lighting combinations",
    ],
  },
  {
    // s7 — YouTube link on capstone projects.
    id: "s7",
    source: "Link",
    date: "03/26",
    type: "link",
    projectId: "capstone",
    title: "What is a Capstone Project?",
    url: "https://www.youtube.com/watch?v=yBs2Vb5Hf54",
    preview: "linear-gradient(150deg, #FAFAF8 0%, #E4E2DC 100%)",
    art: "typography",
    imageUrl: "/captures/s7-what-is-capstone.png",
    cardSize: "normal",
    insights: [
      "Brainstorm for my capstone project",
    ],
  },
  {
    id: "s8",
    source: "Text",
    date: "03/22",
    type: "text",
    projectId: "capstone",
    title: "opening line idea",
    preview: "linear-gradient(160deg, #FAFAF8 0%, #EEE8DA 100%)",
    art: "quote",
    quote: "Those violent delight has violent ends",
    cardSize: "normal",
    insights: [
      "'Those violent delight has violent ends' — use as cold open",
      "Ties s1 Romeo & Juliet lyrics to the thesis arc",
      "Set against white-space — let the line breathe",
    ],
  },
  {
    id: "s9",
    source: "Photos",
    date: "03/18",
    type: "image",
    projectId: "studio-chen",
    title: "oat-linen paper stock",
    preview: "linear-gradient(150deg, #E8D5B7 0%, #C9A876 100%)",
    art: "texture",
    imageUrl: "/captures/s9-oat-linen.png",
    cardSize: "normal",
    insights: [
      "Warm substrate softens bold marks",
      "Order sample pack before Tuesday review",
    ],
  },

  // ── Capstone placeholders (s10 – s16) ───────────────────────────────────
  // Added as empty photo/text cards for the Capstone filter. Each photo card
  // carries an `imageUrl` pointing at its planned path under /public/captures.
  // Until the real file is dropped in, InspirationCard's onError handler
  // gracefully falls back to the gradient `preview` + stylized `art` SVG —
  // so the layout renders fine today and upgrades visually once the images
  // are added at the referenced paths.
  {
    // Shared: lives in both Capstone and Studio Chen filters (see `projectIds`
    // below). `projectId` is the primary project used for card styling; the
    // store's getFilteredScraps checks `projectIds` first when routing.
    id: "s10",
    source: "Photos",
    date: "04/16",
    type: "image",
    projectId: "capstone",
    projectIds: ["capstone", "studio-chen"],
    title: "Design Feeds",
    preview: "linear-gradient(150deg, #2a2b33 0%, #1f2028 100%)",
    art: "grad",
    imageUrl: "/captures/s10-design-feeds.png",
    cardSize: "normal",
    insights: [
      "Audit the strongest editorial design feeds and pick 3 to follow weekly",
      "Save top references into a shared moodboard",
      "Shortlist 5 references that match the Chen warm-neutral palette",
    ],
  },
  {
    id: "s11",
    source: "Youtube",
    date: "04/15",
    type: "link",
    projectId: "capstone",
    title: "How to Conduct Heuristic Analysis",
    url: "https://www.youtube.com/watch?v=sqi0-Lz_ZTY",
    preview: "linear-gradient(160deg, #FAFAF8 0%, #F0EEE6 100%)",
    art: "typography",
    imageUrl: "/captures/s11-heuristic-analysis.png",
    cardSize: "normal",
    insights: [
      "Apply Nielsen's 10 heuristics to the capstone artifact",
      "Draft a self-review rubric before user testing",
    ],
  },
  {
    id: "s12",
    source: "Photos",
    date: "04/13",
    type: "image",
    projectId: "capstone",
    title: "Data Visualization",
    preview: "linear-gradient(160deg, #13222f 0%, #1f3a5a 100%)",
    art: "grad",
    imageUrl: "/captures/s12-data-viz.jpg",
    cardSize: "tall",
    insights: [
      "Compare Tufte vs. Few for capstone data storytelling",
      "Prototype one chart using perceptual mapping",
      "Pick a palette that survives both print and screen",
    ],
  },
  {
    id: "s13",
    source: "Photos",
    date: "04/12",
    type: "image",
    projectId: "capstone",
    title: "Infographic Design",
    preview: "linear-gradient(150deg, #2a241b 0%, #483a27 100%)",
    art: "grad",
    imageUrl: "/captures/s13-infographic.png",
    cardSize: "normal",
    insights: [
      "Map the information hierarchy for the capstone overview poster",
    ],
  },
  {
    // Shared: lives in both Capstone and Studio Chen filters.
    id: "s14",
    source: "Photos",
    date: "04/09",
    type: "image",
    projectId: "capstone",
    projectIds: ["capstone", "studio-chen"],
    title: "Branding",
    preview: "linear-gradient(160deg, #EEE8DA 0%, #D9CEB5 100%)",
    art: "grad",
    imageUrl: "/captures/s14-branding.jpg",
    cardSize: "normal",
    insights: [
      "Sketch 3 logotype directions grounded in the studio's craft voice",
      "Lock two typefaces and a working palette",
      "Present a primary typeface pairing at the Friday review",
    ],
  },
  {
    // Shared: lives in both Capstone and Studio Chen filters.
    id: "s15",
    source: "Photos",
    date: "04/05",
    type: "image",
    projectId: "capstone",
    projectIds: ["capstone", "studio-chen"],
    title: "David Carson",
    preview: "linear-gradient(160deg, #171717 0%, #3a3a3a 100%)",
    art: "portrait-bw",
    imageUrl: "/captures/s15-david-carson.jpg",
    cardSize: "normal",
    insights: [
      "Study Carson's intuitive typography as a visual-language reference",
      "Pull 3 spreads from The End of Print as anchors",
      "Translate one layout idea into a Studio Chen poster study",
    ],
  },
  {
    id: "s16",
    source: "Photos",
    date: "04/02",
    type: "image",
    projectId: "capstone",
    title: "David Carson: Ray Gun",
    preview: "linear-gradient(150deg, #1a1414 0%, #4a2a2a 100%)",
    art: "grad",
    imageUrl: "/captures/s16-ray-gun.png",
    cardSize: "tall",
    insights: [
      "Extract a Ray Gun-era grid idea for a capstone layout study",
      "Collect issue covers that break the grid most effectively",
    ],
  },

  // ── Studio Chen-only scraps (s19, s21) ──────────────────────────────────
  // The Design Feeds, Branding, and David Carson captures that used to live
  // here (s17/s18/s20) were actually the same physical cards as s10/s14/s15.
  // Those are now cross-project via `projectIds` above and render once on the
  // "All" wall while still appearing in both the Capstone and Studio Chen
  // filtered views. What remains below are the captures that belong to
  // Studio Chen exclusively.
  {
    id: "s19",
    source: "Photos",
    date: "04/07",
    type: "image",
    projectId: "studio-chen",
    title: "Paula Scher",
    preview: "linear-gradient(160deg, #1c1b1f 0%, #4a4751 100%)",
    art: "grad",
    imageUrl: "/captures/s19-paula-scher.png",
    cardSize: "tall",
    insights: [
      "Study Paula Scher's Public Theater typography system for the Chen identity",
      "Pull the Citi and MoMA case studies as posture references",
      "Note how her extreme scale shifts force attention before meaning",
    ],
  },
  {
    id: "s21",
    source: "Photos",
    date: "03/30",
    type: "image",
    projectId: "studio-chen",
    title: "Infographic",
    preview: "linear-gradient(160deg, #F3F0EA 0%, #C9B99A 100%)",
    art: "grad",
    imageUrl: "/captures/s21-infographic.png",
    cardSize: "normal",
    insights: [
      "Draft a one-glance process map for the Chen homepage section",
    ],
  },
];

// Tasks get created from selected insights via Home → "Send to Tasks".
// A few are pre-seeded so the page isn't empty on first load.
export const tasks = [
  {
    id: "t1",
    projectId: "musical",
    category: "Column",
    title: "How does the layout of the theatre affect audiences' emotion?",
    dateGroup: "This week (Apr 12 – Apr 18)",
    status: "active",
    locked: false,
  },
  {
    id: "t2",
    projectId: "musical",
    category: "Video",
    title: "Determine the theme",
    dateGroup: "This week (Apr 12 – Apr 18)",
    status: "active",
    locked: false,
  },
  {
    id: "t3",
    projectId: "musical",
    category: "Video",
    title: "Write the script",
    dateGroup: "This week (Apr 12 – Apr 18)",
    status: "active",
    locked: true,
    lockReason: "waiting on: Determine the theme",
  },
  {
    id: "t4",
    projectId: "musical",
    category: "Video",
    title: "Edit the video",
    dateGroup: "Next week (Apr 19 – Apr 25)",
    status: "active",
    locked: false,
  },
  {
    id: "t5",
    projectId: "musical",
    category: "Video",
    title: "Edit the video",
    dateGroup: "Next week (Apr 19 – Apr 25)",
    status: "active",
    locked: false,
  },
  {
    id: "t6",
    projectId: "musical",
    category: "Watch & Play",
    title: "Watch the play and write a review",
    dateGroup: "Next week (Apr 19 – Apr 25)",
    status: "active",
    locked: false,
  },
];

export const categories = {
  Column: { color: "coral", label: "Column" },
  Video: { color: "accent", label: "Video" },
  "Watch & Play": { color: "amber", label: "Watch & Play" },
  Research: { color: "lilac", label: "Research" },
  Review: { color: "coral", label: "Review" },
};
