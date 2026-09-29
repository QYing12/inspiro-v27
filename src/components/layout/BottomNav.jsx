// Mobile bottom tab bar. 4 tabs: Home, Input, Tasks, Profile.
// Hidden at md: breakpoint and up (TopNav takes over there).

import { NavLink } from "react-router-dom";

const Icon = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9v11a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9" />
    </svg>
  ),
  input: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
  tasks: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 12h16M4 18h10" />
      <circle cx="20" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4.5 20c1.5-3.5 4.5-5.5 7.5-5.5s6 2 7.5 5.5" />
    </svg>
  ),
};

const TABS = [
  { to: "/", label: "Home", icon: Icon.home, end: true },
  { to: "/input", label: "Input", icon: Icon.input },
  { to: "/tasks", label: "Tasks", icon: Icon.tasks },
  { to: "/profile", label: "Profile", icon: Icon.profile },
];

export default function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-bg/95 backdrop-blur-xl"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
      aria-label="Primary"
    >
      <ul className="grid grid-cols-4 h-[64px]">
        {TABS.map((t) => (
          <li key={t.to} className="flex">
            <NavLink
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-1 text-[10px] tracking-meta uppercase transition-colors ${
                  isActive ? "text-accent" : "text-dim hover:text-paper"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`w-6 h-6 ${isActive ? "opacity-100" : "opacity-80"}`}>
                    {t.icon}
                  </span>
                  <span className="font-mono">{t.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
