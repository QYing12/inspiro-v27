// Visual cue drawn on the front of an inspiration card. Picks a minimal art
// treatment based on the scrap's `art` hint (books, portrait, typography,
// waveform, grad, quote, texture). Keeps the whole app free of real imagery
// while still feeling varied enough to read as different captures.

export default function ScrapArt({ art, tone = "dark", quote }) {
  const isLight = tone === "light";
  const ink = isLight ? "#2a2620" : "#F5F5F4";
  const soft = isLight ? "rgba(15,16,18,0.55)" : "rgba(255,255,255,0.72)";
  const dim = isLight ? "rgba(15,16,18,0.25)" : "rgba(255,255,255,0.28)";

  switch (art) {
    case "books":
      return (
        <svg viewBox="0 0 200 260" className="w-full h-full" aria-hidden="true">
          {/* two stylized books stacked */}
          <g fill="none" stroke={ink} strokeWidth="1.5">
            <rect x="40" y="110" width="120" height="28" rx="2" fill={ink} opacity="0.88" />
            <rect x="46" y="138" width="108" height="28" rx="2" fill="none" stroke={ink} />
            <rect x="40" y="166" width="120" height="28" rx="2" fill={ink} opacity="0.88" />
            {/* page edges */}
            <line x1="40" y1="118" x2="160" y2="118" stroke={soft} strokeWidth="0.6" />
            <line x1="40" y1="174" x2="160" y2="174" stroke={soft} strokeWidth="0.6" />
          </g>
          <text x="100" y="82" textAnchor="middle" fill={soft} fontFamily="Helvetica Neue, Helvetica, Arial" fontSize="13" letterSpacing="0.18em">
            LIBRETTO
          </text>
        </svg>
      );
    case "portrait":
      return (
        <svg viewBox="0 0 200 260" className="w-full h-full" aria-hidden="true">
          <circle cx="100" cy="100" r="34" fill="none" stroke={ink} strokeWidth="1.5" />
          <path d="M48 200 Q100 152 152 200" fill="none" stroke={ink} strokeWidth="1.5" />
          <line x1="30" y1="220" x2="170" y2="220" stroke={soft} strokeWidth="0.75" />
          <line x1="30" y1="228" x2="120" y2="228" stroke={dim} strokeWidth="0.5" />
        </svg>
      );
    case "portrait-bw":
      return (
        <svg viewBox="0 0 200 260" className="w-full h-full" aria-hidden="true">
          <defs>
            <radialGradient id="pbw" cx="50%" cy="38%" r="55%">
              <stop offset="0%" stopColor={soft} stopOpacity="0.85" />
              <stop offset="100%" stopColor={ink} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="200" height="260" fill="url(#pbw)" />
          <ellipse cx="100" cy="112" rx="42" ry="50" fill="none" stroke={ink} strokeWidth="1.25" />
          <path d="M58 210 Q100 168 142 210" fill="none" stroke={ink} strokeWidth="1.25" />
          <circle cx="140" cy="78" r="3" fill="#FB8C6B" />
        </svg>
      );
    case "typography":
      return (
        <svg viewBox="0 0 200 260" className="w-full h-full" aria-hidden="true">
          <text x="100" y="118" textAnchor="middle" fill={ink} fontFamily="Helvetica Neue, Helvetica, Arial" fontWeight="700" fontSize="78" letterSpacing="-0.05em">
            Aa
          </text>
          <line x1="34" y1="146" x2="166" y2="146" stroke={ink} strokeWidth="0.8" />
          <text x="100" y="168" textAnchor="middle" fill={soft} fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="0.25em">
            GRID · SILENCE
          </text>
        </svg>
      );
    case "waveform":
      return (
        <svg viewBox="0 0 200 260" className="w-full h-full" aria-hidden="true">
          <g stroke={ink} strokeWidth="2" strokeLinecap="round">
            {Array.from({ length: 36 }).map((_, i) => {
              const x = 16 + i * 4.8;
              const h = 18 + Math.abs(Math.sin(i * 0.7)) * 60 + (i % 5) * 4;
              return <line key={i} x1={x} y1={130 - h / 2} x2={x} y2={130 + h / 2} />;
            })}
          </g>
          <text x="100" y="210" textAnchor="middle" fill={soft} fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="0.2em">
            02:14 · AUDIO
          </text>
        </svg>
      );
    case "grad":
      return (
        <svg viewBox="0 0 200 260" className="w-full h-full" aria-hidden="true">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#5EEAD4" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#B5A8FF" stopOpacity="0.55" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="130" r="72" fill="url(#g)" />
          <circle cx="100" cy="130" r="72" fill="none" stroke={ink} strokeWidth="0.5" opacity="0.3" />
        </svg>
      );
    case "quote":
      return (
        <svg viewBox="0 0 200 260" className="w-full h-full" aria-hidden="true">
          <text x="24" y="92" fill={ink} fontFamily="Helvetica Neue, Helvetica, Arial" fontSize="96" fontWeight="700">“</text>
          <foreignObject x="28" y="108" width="148" height="140">
            <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontFamily: "Helvetica Neue, Helvetica, Arial", color: ink, fontSize: "14px", lineHeight: "1.3", fontStyle: "italic", fontWeight: 500 }}>
              {quote || "the tax you pay for not writing things down."}
            </div>
          </foreignObject>
        </svg>
      );
    case "texture":
      return (
        <svg viewBox="0 0 200 260" className="w-full h-full" aria-hidden="true">
          <defs>
            <pattern id="wv" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M0 4 Q2 0 4 4 T8 4" fill="none" stroke={ink} strokeWidth="0.5" opacity="0.35" />
            </pattern>
          </defs>
          <rect x="20" y="30" width="160" height="200" fill="url(#wv)" />
          <rect x="20" y="30" width="160" height="200" fill="none" stroke={ink} strokeWidth="0.75" />
          <text x="100" y="248" textAnchor="middle" fill={soft} fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="0.25em">
            OAT · LINEN · 160GSM
          </text>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 200 260" className="w-full h-full" aria-hidden="true">
          <rect x="40" y="60" width="120" height="140" fill="none" stroke={ink} strokeWidth="0.75" />
          <line x1="40" y1="130" x2="160" y2="130" stroke={ink} strokeWidth="0.75" />
        </svg>
      );
  }
}
