/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    // scalable spacing scale — 4px base
    extend: {
      screens: {
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      colors: {
        // ─── Light notebook palette ─────────────────────────────
        // surfaces — cool light neutrals
        bg: "#F5F6F8",            // main page background
        surface: "#FFFFFF",       // primary card / raised surface (was dark)
        "surface-2": "#F8F9FA",   // secondary surface, hover fills, subtle wells
        "surface-3": "#EEF0F3",   // tertiary, sunken wells / code blocks
        border: "#E5E7EB",        // 1px hairlines
        "border-strong": "#D1D5DB",

        // ─── Content surfaces (kept for card art variants) ──────
        card: "#FFFFFF",
        "card-warm": "#FBF9F5",
        "card-cool": "#F2F5F8",
        "card-dark": "#1F2024",   // reserved: dark surface for select emphasis

        // ─── Text — dark on light ───────────────────────────────
        // Semantically "paper" was the main text colour in dark mode.
        // In light mode it flips to the primary dark text so component
        // classes (text-paper) still mean "main text" everywhere.
        ink: "#0F1012",           // strongest black, used for button text on accent
        paper: "#1F2024",         // primary body text
        muted: "#74777F",         // secondary text
        dim: "#A0A3AA",           // subtle / captions / disabled

        // ─── Brand accents ──────────────────────────────────────
        accent: "#55DDD1",        // Inspiro turquoise
        "accent-deep": "#14B8A6", // hover / pressed
        "accent-soft": "#E3FBF7", // very light cyan wash for filter chips, tags
        coral: "#FB8C6B",
        amber: "#F5C451",
        lilac: "#B5A8FF",
      },
      fontFamily: {
        display: ['"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
        sans: ['"Urbanist"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 8vw, 6rem)", { lineHeight: "0.98", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2.25rem, 5vw, 3.75rem)", { lineHeight: "1", letterSpacing: "-0.025em" }],
        "display-md": ["clamp(1.75rem, 3.5vw, 2.5rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
      },
      backgroundImage: {
        // Cyan → teal gradient preserved as brand mark (logo / important
        // typography like "the work." on Landing hero).
        "gradient-star": "linear-gradient(135deg, #55DDD1 0%, #14B8A6 100%)",
        "gradient-coral": "linear-gradient(135deg, #FB8C6B 0%, #F5C451 100%)",
        // Landing hero background — the darker premium radial is gone; we
        // paint the same slot with a soft cool wash so the floating cards
        // still feel like they're above a designed workspace, not on flat
        // paper.
        "gradient-premium":
          "radial-gradient(circle at 15% 5%, rgba(85,221,209,0.10), transparent 55%), radial-gradient(circle at 88% 92%, rgba(181,168,255,0.09), transparent 50%), #F5F6F8",
      },
      boxShadow: {
        // Restrained shadows — soft & dimensional, never glowy.
        sm:   "0 1px 2px rgba(20,25,35,0.04)",
        card: "0 1px 2px rgba(20,25,35,0.04), 0 2px 8px rgba(20,25,35,0.05)",
        md:   "0 4px 16px rgba(20,25,35,0.06)",
        lift: "0 2px 6px rgba(20,25,35,0.05), 0 12px 32px rgba(20,25,35,0.08)",
        // "inset" and "glow" are kept as tokens so existing class names
        // resolve, but reduced to near-invisible so the interface reads
        // clean rather than neon.
        inset: "inset 0 1px 0 rgba(255,255,255,0.60)",
        glow:  "0 0 0 3px rgba(85,221,209,0.18)",   // reserved for focus rings
      },
      borderRadius: {
        xs: "6px",
        sm: "10px",
        md: "14px",
        lg: "18px",
        xl: "24px",
        "2xl": "32px",
      },
      letterSpacing: {
        meta: "0.08em",
        tight: "-0.02em",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
