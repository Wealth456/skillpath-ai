import type { Config } from "tailwindcss";

const config: Config = {
  // ─── WHERE TAILWIND LOOKS FOR CLASS NAMES ────────────────────────────────
  // Tailwind only includes CSS for classes it finds in these files.
  // If you create a new folder, add it here so Tailwind doesn't strip its classes.
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      // ─── CUSTOM COLOR PALETTE ──────────────────────────────────────────
      // After adding these, you can use them as Tailwind classes:
      //   bg-primary          → background #1A3ADB
      //   text-ink-muted      → color #3D4A6B
      //   border-border       → border #E4E8F5
      //   bg-sidebar          → background #0D1B4B
      // etc.
      colors: {
        // PRIMARY BLUE — the main brand color
        gold: "#F5A623",
        primary: {
          DEFAULT: "#1A3ADB",   // bg-primary / text-primary
          dark: "#1228B0",      // bg-primary-dark  (hover state for buttons)
          light: "#E8EDFF",     // bg-primary-light (badge bg, active sidebar item)
          xlight: "#F0F3FF",    // bg-primary-xlight (very subtle highlights)
         
        },

        // INK — replaces black, used for text
        ink: {
          DEFAULT: "#0D1220",   // text-ink (headings, strong text)
          muted: "#3D4A6B",     // text-ink-muted (subtitles, labels)
          faint: "#8A97B8",     // text-ink-faint (placeholders, inactive nav)
        },

        // SURFACES — backgrounds for pages and cards
        surface: "#F7F8FC",     // bg-surface (main page background)
        card: "#FFFFFF",        // bg-card (card backgrounds)

        // BORDERS
        border: {
          DEFAULT: "#E4E8F5",   // border-border (default borders)
          strong: "#C7D0F0",    // border-border-strong (emphasized borders)
        },

        // GREYS — utility neutral shades
        grey: {
          100: "#F3F5FB",       // bg-grey-100
          200: "#E5E9F5",       // bg-grey-200 (input default border, progress track)
          300: "#9BA8C8",       // text-grey-300
        },

        // SIDEBAR — dark navy for the app sidebar
        sidebar: {
          DEFAULT: "#0D1B4B",   // bg-sidebar
          header: "#162060",    // bg-sidebar-header (logo area + bottom user strip)
        },

        // SEMANTIC COLORS — used sparingly for status indicators
        success: {
          DEFAULT: "#10B981",   // text-success / bg-success
          light: "#D1FAE5",     // bg-success-light (success badge bg)
        },
        error: {
          DEFAULT: "#EF4444",   // text-error / bg-error
          light: "#FEE2E2",     // bg-error-light (error badge bg)
        },
        fontFamily: {
  sans: ["var(--font-inter)", "system-ui", "sans-serif"] as unknown as string,
},
      },

      // ─── CUSTOM FONT SIZES ─────────────────────────────────────────────
      // Matches the typography scale from the design system.
      // Usage: text-display, text-h1, text-body-lg, etc.
      fontSize: {
        display: ["58px", { lineHeight: "1.1", fontWeight: "800" }],
        h1:      ["48px", { lineHeight: "1.15", fontWeight: "800" }],
        h2:      ["32px", { lineHeight: "1.25", fontWeight: "700" }],
        h3:      ["24px", { lineHeight: "1.35", fontWeight: "700" }],
        h4:      ["20px", { lineHeight: "1.4",  fontWeight: "700" }],
        "body-lg": ["17px", { lineHeight: "1.7", fontWeight: "400" }],
        body:    ["15px", { lineHeight: "1.7",  fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.6", fontWeight: "400" }],
        caption: ["13px", { lineHeight: "1.5",  fontWeight: "500" }],
        micro: ["12px", { lineHeight: "1.4", fontWeight: "600", letterSpacing: "0.08em" }],
                            
      },

      // ─── CUSTOM SHADOWS ────────────────────────────────────────────────
      // card-default: subtle shadow for cards at rest
      // card-hover:   deeper blue-tinted shadow on hover
      boxShadow: {
        "card-default": "0 4px 20px rgba(0, 0, 0, 0.06)",
        "card-hover":   "0 12px 40px rgba(26, 58, 219, 0.12)",
      },

      // ─── SIDEBAR WIDTH ─────────────────────────────────────────────────
      // Used as w-sidebar and ml-sidebar for the fixed sidebar + content offset
      spacing: {
        sidebar: "240px",
      },
    },
  },

  plugins: [],
};

export default config;