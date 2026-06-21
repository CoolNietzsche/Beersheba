# Beersheba Theming & Style Migration Guide

Beersheba (formerly Bunna Bridge) has completed its core rebranding from a dark espresso palette to a light, high-contrast linen/forest-green system. This file documents the layout, spacing, and design tokens used to achieve absolute visual cohesion.

---

## 1. Design Tokens (`src/styles/tokens.ts`)

All color values, typography definitions, border radii, shadows, and spacing scales are managed inside a single, unified export object `T`.

### Colors
- **Forest Green (`#1B4D35`)**: The core brand color, used for primary navigation elements, verified badges, action headers, and success messaging. Under no circumstances should Forest Green be substituted with secondary colors for primary CTAs.
- **Coffee Brown (`#7B4B2A`)**: Used exclusively for warm sensory accents, sensory metrics, and secondary details. Never used for general buttons or core page headers.
- **Linen (`#FBF9F4`)**: The ambient off-white background color reflecting micro-lot processing matrices and linen drying tables.
- **Stone (`#F4F1EA`)**: A slightly darker neutral used for card borders, input borders, and division markers.

### Typography
- **Display (`Playfair Display, serif`)**: Used for page titles, Q-Scores, and primary editorial headings.
- **Sans (`Inter, sans-serif`)**: The main interface font for maximum legibility of labels, filters, and standard form descriptions.
- **Mono (`JetBrains Mono, monospace`)**: Reserved for digital compliance markers, certificate numbers, lot IDs, and gate status checks.

---

## 2. Reusable Visual Components (`src/styles/components.ts`)

Common UI containers, titles, inputs, buttons, and status indicator layouts are exported through `CS`.

- **`CS.pageTitle`**: Standard heading for pages (serif, spacious margins).
- **`CS.card`**: Primary white surfaces with precise shadows (`T.shadow.sm`) and thin light boundaries (`T.color.border`).
- **`CS.input`**: Standard form entry fields styled using the warm linen backdrop.
- **`CS.btnPrimary` / `CS.btnGhost`**: Interface controls standardized with appropriate background levels and smooth transitions.

---

## 3. Legacy Migration Rulebook

When modifying future screens or reviewing legacy templates, use this simple lookup map to replace hardcoded style declarations with design tokens:

| Legacy Dark Style | New Token Mapping | Tailwind v4 Equivalent |
| :--- | :--- | :--- |
| `background: "#1E1208"` | `T.color.white` / `T.color.linen` | `bg-white` / `bg-neutral-50` |
| `background: "#2C1810"` | `T.color.linen` | `bg-stone-100` |
| `color: "#F5EDD8"` | `T.color.ink` (`#1C1C1A`) | `text-stone-900` |
| `color: "#EDE0C4"` | `T.color.textMuted` | `text-stone-600` |
| `borderColor: "rgba(201,149,42,0.2)"` | `T.color.border` | `border-stone-200` |

---

All dynamic maps and geospatial widgets (such as Leaflet tools) must inherit color parameters dynamically from `T.color` rather than injecting hardcoded hex strings into JavaScript map layers.
