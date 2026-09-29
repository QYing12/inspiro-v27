// Responsive chrome wrapping all 4 primary tabs. Mobile gets a bottom tab bar;
// tablet+ gets a sticky top nav. The page content uses its own max-width to
// stay editorial on desktop without the mobile-frame feel.

import TopNav from "./TopNav.jsx";
import BottomNav from "./BottomNav.jsx";

export default function AppShell({ children, wide = false }) {
  return (
    <div className="min-h-screen bg-bg text-paper flex flex-col">
      <TopNav />

      <main
        className={`flex-1 w-full mx-auto px-5 md:px-8 pb-[88px] md:pb-16 ${
          wide ? "max-w-[1440px]" : "max-w-[1200px]"
        }`}
      >
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
