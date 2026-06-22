// Beersheba Design Tokens — single source of truth
// Never hardcode colors in components. Always import from here.

export const T = {
  color: {
    // Primary
    forest:       "var(--color-forest)",
    forestDark:   "var(--color-forest-dark)",
    forestLight:  "var(--color-forest-light)",
    // Accent
    coffee:       "var(--color-coffee)",
    coffeeLight:  "var(--color-coffee-light)",
    sage:         "var(--color-sage)",
    mint:         "var(--color-mint)",
    // Neutrals
    linen:        "var(--color-linen)",
    stone:        "var(--color-stone)",
    white:        "var(--color-white)",
    ink:          "var(--color-ink)",
    slate:        "var(--color-slate)",
    // Status
    red:          "var(--color-red)",
    redLight:     "var(--color-red-light)",
    errorBorder:  "var(--color-error-border)",
    gold:         "var(--color-gold)",
    goldLight:    "var(--color-gold-light)",
    forestHover:  "var(--color-forest-hover)",
    // Borders
    border:       "var(--color-border)",
    borderStrong: "var(--color-border-strong)",
    borderHover:  "var(--color-border-hover)",
    // Text opacity helpers
    textMuted:    "var(--color-text-muted)",
    textFaint:    "var(--color-text-faint)",
    textGhost:    "var(--color-text-ghost)",
    // Sidebar (dark surface — only place dark is allowed)
    sidebarBg:    "#1B4D35",
    sidebarText:  "rgba(255,255,255,0.6)",
    sidebarMuted: "rgba(255,255,255,0.25)",
    sidebarActive:"rgba(255,255,255,0.13)",
  },
  font: {
    display: '"Cormorant Garamond", Georgia, serif',
    mono:    '"DM Mono", monospace',
    sans:    '"Instrument Sans", sans-serif',
    mark:    '"Playfair Display", serif',
  },
  radius: {
    sm:   "3px",
    md:   "4px",
    lg:   "6px",
    xl:   "8px",
    pill: "20px",
  },
  shadow: {
    card:  "0 1px 3px rgba(28,28,26,0.06)",
    hover: "0 4px 12px rgba(28,28,26,0.1)",
    modal: "0 8px 32px rgba(28,28,26,0.15)",
    sm:    "0 1px 3px rgba(28,28,26,0.06)",
    md:    "0 4px 12px rgba(28,28,26,0.1)",
  },
  spacing: {
    cardPad:  "20px",
    pagePad:  "clamp(16px, 4vw, 24px)",
  },
} as const;

export default T;
