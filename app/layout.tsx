// app/layout.tsx
//
// This is the ROOT LAYOUT — Next.js wraps every page with this file.
// It runs on the SERVER (no "use client" needed here).
// Its job: load the font, set the <html> and <body> tags,
// and export metadata (page title, description for SEO).

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// ─── INTER FONT SETUP ────────────────────────────────────────────────────────
// next/font/google downloads Inter at BUILD TIME and self-hosts it.
// This means: NO external font request at runtime — it works offline
// and there's zero layout shift (no FOUT — Flash Of Unstyled Text).
//
// subsets: ["latin"] — only load latin characters (keeps bundle small).
// variable: "--font-inter" — creates a CSS custom property we can reference
//   in Tailwind via the `font-sans` utility class.
// display: "swap" — show fallback text immediately, swap to Inter when ready.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  // All weights we use across the design system:
  weight: ["400", "500", "600", "700", "800"],
});

// ─── SEO METADATA ────────────────────────────────────────────────────────────
// Next.js reads this object and injects the right <meta> tags automatically.
// Appears in browser tab and Google search results.
export const metadata: Metadata = {
  title: "SkillPath AI — Learn Tech Your Way",
  description:
    "AI-powered e-learning for tech learners in Africa. Get a personalised roadmap, take courses, and grow your skills — at your own pace.",
};

// ─── ROOT LAYOUT COMPONENT ───────────────────────────────────────────────────
// Every page in your app is passed in as `children`.
// This function returns the full HTML shell (<html> + <body>).
export default function RootLayout({
  children,
}: {
  children: React.ReactNode; // anything React can render: a page, a layout, etc.
}) {
  return (
    // lang="en" — tells browsers and screen readers the language
    <html lang="en">
      <body
        className={`
          ${inter.variable}
          font-sans
          antialiased
          bg-surface
          text-ink
        `}
        // What each class does:
        // inter.variable  → injects --font-inter CSS variable into the DOM
        // font-sans       → Tailwind maps `font-sans` to var(--font-inter)
        //                   (you'll configure this in tailwind.config.ts if needed,
        //                    or Next.js handles it via the variable binding)
        // antialiased     → smoother font rendering on Mac/retina screens
        // bg-surface      → sets page background to #F7F8FC (our surface color)
        // text-ink        → sets default text color to #0D1220
      >
        {children}
      </body>
    </html>
  );
}