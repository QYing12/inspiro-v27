// Inspiro brand mark — paths extracted from the user's Artboard 7.svg lockup.
// The full wordmark + tagline lockup lives at /public/inspiro-logo.svg and is
// rendered by components/LogoLockup.jsx for hero placements.
//
// Three variants:
//   "ink"         — monochrome via currentColor (picks up text color class)
//   "gradient"    — original brand colors (blue + teal flare)
//   "processing"  — gradient + rotation animation for routing / loading states

const MARK_PATHS = [
  { color: "primary", d: "M47.93,148.06c1.77.67,3.45,1.5,5.05,2.42,8.92-5.99,17.46-12.93,27.33-16.96-4.29-6.54-6.33-14.18-7.07-21.66-.02-.19-.12-.33-.25-.44-.15-.15-.37-.23-.61-.22-.24,0-.46.07-.61.22-.13.11-.23.25-.25.44-1.11,11.13-5.06,22.64-15.1,30.32-2.53,1.94-5.39,3.53-8.5,4.71-.31.12-.42.32-.41.53,0,.02,0,.03,0,.05,0,.02,0,.03,0,.05,0,.21.1.42.41.53Z" },
  { color: "accent",  d: "M64.74,161.88c4.64-8.75,9.57-17.32,15.86-24.94-8.87,3.8-16.67,9.94-24.7,15.46.17.13.36.24.53.37,3.45,2.64,6.17,5.74,8.31,9.11Z" },
  { color: "primary", d: "M97.24,147.43c0-.21-.1-.42-.41-.53-3.11-1.18-5.97-2.77-8.5-4.71-1.66-1.27-3.13-2.64-4.47-4.1-6.98,8.18-12.25,17.57-17.24,27.12,2.83,5.62,4.29,11.81,4.9,17.89.02.19.12.33.25.44.15.15.37.23.61.22.24,0,.46-.07.61-.22.13-.11.23-.25.25-.44,1.11-11.13,5.06-22.64,15.1-30.32,2.53-1.94,5.39-3.53,8.5-4.71.31-.12.42-.32.41-.53,0-.02,0-.03,0-.05,0-.02,0-.03,0-.05Z" },
];

// Brand colors — preserved from the source logo file.
const BRAND_PRIMARY = "#0093C8"; // deep blue (main mark)
const BRAND_ACCENT = "#00C8B1";  // teal flare (secondary)

export default function StarGlyph({ variant = "ink", size = 28, className = "" }) {
  const primary =
    variant === "ink" ? "currentColor" : BRAND_PRIMARY;
  const accent =
    variant === "ink" ? "currentColor" : BRAND_ACCENT;

  return (
    <svg
      viewBox="42 105 58 90"
      width={size}
      height={(size * 90) / 58}
      className={`${variant === "processing" ? "star-processing" : ""} ${className}`}
      aria-hidden="true"
    >
      {/* rotation pivot uses the mark's approximate center */}
      <g className="rays" style={{ transformOrigin: "71px 150px" }}>
        {MARK_PATHS.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill={p.color === "accent" ? accent : primary}
          />
        ))}
      </g>
    </svg>
  );
}
