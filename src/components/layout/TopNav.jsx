// Desktop/tablet top nav. Visible at md: and above. Shows wordmark, 4 primary
// nav items, and a simple user chip on the right. Sticky translucent bar.

import { NavLink, Link } from "react-router-dom";
import StarGlyph from "../StarGlyph.jsx";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/input", label: "Input" },
  { to: "/tasks", label: "Tasks" },
  { to: "/profile", label: "Profile" },
];

export default function TopNav() {
  return (
    <header
      className="hidden md:block sticky top-0 z-40 border-b border-border bg-bg/75 backdrop-blur-xl"
      aria-label="Primary"
    >
      <div className="mx-auto max-w-[1440px] px-8 h-[68px] flex items-center gap-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <StarGlyph variant="gradient" size={22} />
          <span className="font-display text-[17px] tracking-tight text-paper">
            Inspiro
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `relative px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                  isActive
                    ? "text-paper"
                    : "text-muted hover:text-paper"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && (
                    <span className="absolute left-4 right-4 -bottom-[17px] h-[2px] bg-accent rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <button
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-sm border border-border text-xs font-mono tracking-meta uppercase text-muted hover:text-paper hover:border-border-strong transition-colors"
            type="button"
          >
            <kbd className="text-[10px] text-dim">⌘</kbd>
            <span>K</span>
            <span className="text-dim">· Quick capture</span>
          </button>
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-lilac flex items-center justify-center text-ink text-[11px] font-semibold"
            aria-label="Account"
          >
            SB
          </div>
        </div>
      </div>
    </header>
  );
}
