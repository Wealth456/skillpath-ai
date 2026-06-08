// app/onboarding/layout.tsx
// Shared layout for all onboarding steps.
// Contains the top bar with logo + 3-step progress indicator.
// Every onboarding page is passed in as {children}.

import Link from "next/link";


// We receive the current step as a search param — but since layout.tsx
// is a server component and can't read search params easily, we'll
// build the progress bar inside each page and keep this layout minimal.
// The layout just provides the white top bar + page background.

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface">
      {/* TOP BAR */}
      <div className="bg-white border-b border-border h-16 flex items-center px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm leading-none">S°</span>
          </div>
          <span className="font-black text-ink tracking-tight text-[15px]">
            SKILLPATH <span className="text-primary">AI</span>
          </span>
        </Link>
      </div>

      {/* PAGE CONTENT */}
      {children}
    </div>
  );
}