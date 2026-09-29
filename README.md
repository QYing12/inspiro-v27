# Inspiro

*The space between a thought and the work.*

A responsive creative-OS prototype: capture scattered thoughts (text, image,
link, voice), let Inspiro route them to the right project, flip any capture to
see AI-generated insights, and send those insights into a structured task
list. Same URL, mobile and desktop — mobile feels like an app, desktop feels
like a proper web app.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Information architecture

```
/             Landing (cinematic hero + 3-step pipeline + manifesto)
/home         Inspiration wall — flippable cards, project filter
/input        Multimodal capture (text · image · link · voice) → route → confirm
/tasks        Grouped checklist, two-pane layout on desktop
/profile      Account · projects · connected sources · pipeline prefs
```

All four app tabs share responsive chrome:

- **Mobile (<768px)** — bottom tab bar (Home / Input / Tasks / Profile)
- **Tablet + desktop (≥768px)** — sticky top nav with wordmark, tabs, quick-capture hint, avatar

## Pipeline

1. **Capture** on `/input` — any of four modalities. Inspiro runs keyword
   matching against projects and suggests 1–3 with confidence scores.
2. **Land** on `/home` — the capture appears as a card with a gradient preview
   and a minimal art cue. Click to flip.
3. **Flip** — the back shows AI-generated insights. Select any of them.
4. **Send to Tasks** — selected insights become `dateGroup`-bucketed tasks on
   `/tasks`, framed by project type (analytical verbs for thesis, applied for
   freelance, publish for content). The source capture stays linked.

## Stack

- **Vite + React 18** — `npm run dev` ships a fast local loop
- **Tailwind CSS 3.4** — tokens in `tailwind.config.js`; dark-premium palette
- **Zustand 4** — in-memory state (`src/lib/store.js`)
- **React Router 6** — `/`, `/home`, `/input`, `/tasks`, `/profile`
- **Framer Motion** — installed, used sparingly; CSS 3D does the card flip

## Typography

- **H1** — Helvetica Neue (system stack, per spec)
- **Body** — Urbanist (Google Fonts, 300–800)
- **Meta / tags / numerals** — JetBrains Mono

## File map

```
src/
├─ App.jsx                            // router: Landing + 4 app routes
├─ main.jsx                           // BrowserRouter root
├─ index.css                          // tokens, H1 Helvetica, card-flip CSS
├─ lib/
│  ├─ fixtures.js                     // 9 scraps, 3 projects, 6 seed tasks
│  ├─ fakeAI.js                       // routeFragment + generateInsights + frameInsightAsTask
│  └─ store.js                        // zustand store + sendInsightsToTasks action
├─ components/
│  ├─ StarGlyph.jsx                   // brand mark (ink / gradient / processing)
│  ├─ layout/
│  │  ├─ AppShell.jsx                 // responsive wrapper
│  │  ├─ TopNav.jsx                   // md+ sticky nav
│  │  └─ BottomNav.jsx                // mobile tab bar
│  ├─ primitives/
│  │  ├─ Pill.jsx
│  │  └─ ProjectFilter.jsx            // shared by Home + Tasks
│  └─ cards/
│     ├─ InspirationCard.jsx          // flippable capture card
│     ├─ ScrapArt.jsx                 // minimal SVG art per `art` hint
│     └─ TaskItem.jsx                 // checklist row, supports locked state
└─ pages/
   ├─ Landing.jsx                     // marketing / enter surface
   ├─ Home.jsx                        // inspiration wall (masonry)
   ├─ Input.jsx                       // capture + route + confirm stepper
   ├─ Tasks.jsx                       // two-pane desktop checklist
   └─ Profile.jsx                     // account + workspace
```

## Design tokens

Dark-premium palette, refined from the mockup into a cohesive system:

| token          | hex       | role                                   |
|---             |---        |---                                     |
| `bg`           | `#0A0A0B` | canvas                                 |
| `surface`      | `#15161B` | cards, panels                          |
| `surface-2`    | `#1F2028` | raised surfaces, inputs                |
| `paper`        | `#F5F5F4` | primary text                           |
| `muted`        | `#A1A1AA` | secondary text                         |
| `dim`          | `#71717A` | tertiary, placeholders                 |
| `accent`       | `#5EEAD4` | brand, primary CTAs, Video category    |
| `accent-deep`  | `#14B8A6` | CTA hover                              |
| `coral`        | `#FB8C6B` | studio-chen project, Column category   |
| `amber`        | `#F5C451` | Watch & Play category                  |
| `lilac`        | `#B5A8FF` | capstone project, Research category    |

Gradients: `bg-gradient-star` (accent → accent-deep), `bg-gradient-premium`
(radial mint + lilac wash on `bg`) — used on Landing.

## Notable design choices

- **Two surfaces, one codebase.** Bottom tab bar on mobile, sticky top nav on
  desktop. Same routes, same URL, no second build.
- **The card flip is the hero interaction.** Capture on the front, insights on
  the back, CTA to turn insights into tasks. CSS 3D transforms — no JS
  animation library needed for the flip itself.
- **Task framing adapts to project type.** Same insight produces a different
  task in Capstone (thesis) vs. Studio Chen (freelance) vs. Musical Account
  (content).
- **Locked tasks.** Some tasks have prerequisites (`locked: true` + a
  `lockReason`). They render dimmed with a padlock — you can't check them
  until the blocker is done.
- **Shared project filter.** Switch projects on Home and the filter carries
  over to Tasks. One mental model, two views.

## What's stubbed

- All AI is deterministic keyword matching against `fixtures.js`
- Voice recording simulates 6s and drops in a canned transcript
- Image upload stores the filename only
- No persistence — refresh resets captures and tasks
- No real auth — Profile is a static workspace view
