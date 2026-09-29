// Small utility pill for source / project tags. Variants switch palette.

export default function Pill({ children, tone = "muted", className = "" }) {
  // Light-theme pills: tinted washes stay soft so they read as tags,
  // not buttons. Text uses the darker/deeper end of each hue for legibility.
  const tones = {
    muted: "bg-surface-2 text-muted border-border",
    paper: "bg-surface-2 text-paper border-border-strong",
    accent: "bg-accent-soft text-accent-deep border-accent/30",
    coral: "bg-coral/[0.14] text-[#B8451E] border-coral/30",
    amber: "bg-amber/[0.18] text-[#8A6A15] border-amber/40",
    lilac: "bg-lilac/[0.16] text-[#5C4FB8] border-lilac/40",
    ink: "bg-ink text-white border-ink",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono tracking-meta uppercase rounded-xs border ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
