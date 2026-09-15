# Taxiterminalen — SVG Logo Brief (Web + Desktop)

Create a professional SVG logo system for **Taxiterminalen** (The Taxi Terminal).
Deliver vector artwork that works on the public website and on desktop (browser tab, taskbar, PWA / shortcut icon).

---

## 1. Brand & niche

| Item | Value |
|---|---|
| Brand name | **taxiterminalen** (lowercase wordmark, as in the header) |
| Display name | Taxiterminalen / The Taxi Terminal |
| Market | Denmark (DKK, taxiterminalen.dk) |
| Audience | Taxi drivers and taxi businesses |
| Product | Membership + event platform that unites drivers and helps with electricity contracts, insurance, pension, and taxi legislation |
| Tone | Professional, trustworthy, modern, industry-strong — not playful yellow-cab cartoon |
| Tagline (optional lockup) | Together we create better taxi services |

**What the mark should feel like**
- A terminal / hub where drivers gather
- Mobility and reliability
- Better conditions (green / growth), not just “a car”

**Avoid**
- Generic lightning bolt (current placeholder in the header)
- Over-detailed taxi photos or 3D chrome
- Copyrighted taxi-app marks (Uber, Bolt, Free Now)
- Tiny text that dies at 16px

---

## 2. Visual language (from the app)

**Type:** Plus Jakarta Sans (already loaded in `index.html`). Wordmark should use this family or a geometric sans of similar weight (700–800).

**Palette**

| Token | Hex | Use |
|---|---|---|
| Primary blue | `#2563EB` | Trust, digital, primary |
| Primary blue dark | `#1D4ED8` | Hover / depth |
| Accent emerald | `#10B981` | Growth, better deals, “green” energy |
| Emerald bright | `#34D399` | Highlights on dark backgrounds |
| Ink | `#111827` | Wordmark on light |
| Muted | `#6B7280` | Secondary text |
| Surface | `#FFFFFF` | Light backgrounds |
| Canvas | `#F8FAFC` | Page background |
| Dark | `#030712` / `#111827` | Hero / dark mode |

**Existing motifs to evolve, not copy**
- Header: rounded square, blue → emerald gradient, white icon
- Home hero: simplified taxi (top light + wheels)
- Corners: `rounded-xl` (~12–16px)

**Concept directions (pick one, then refine)**
1. **Mark:** stylized taxi + roof light, abstracted into a “T”
2. **Mark:** circular “terminal / hub” with a simple cab silhouette
3. **Monogram:** **TT** (Taxiterminalen) with a roof-light bar as the crossbar of the T
4. **Wordmark + icon:** icon left, `taxiterminalen` right

Recommended: **icon + wordmark**. The icon must stand alone for favicon and collapsed admin sidebar.

---

## 3. SVG deliverables

All files: **pure SVG**, geometric paths, no embedded raster, no bitmap filters required for the mark to read.

### A. Web

| File | Canvas | Purpose |
|---|---|---|
| `logo-full.svg` | 320×80 (or similar 4:1) | Header + footer |
| `logo-full-dark.svg` | same | White/light wordmark on dark hero/footer |
| `logo-icon.svg` | 64×64 viewBox `0 0 64 64` | Header icon, admin sidebar |
| `logo-icon-mono.svg` | 64×64 | Single-color (`currentColor`) for CSS theming |
| `favicon.svg` | 32×32 viewBox `0 0 32 32` | Browser tab (`<link rel="icon">`) |
| `og-logo.svg` | 1200×630 safe zone | Optional social / Open Graph crop |

**Web sizes in the app**
- Public header icon: **40×40** (`w-10 h-10`)
- Admin sidebar icon: **32×32** (`w-8 h-8`); **must remain readable when the sidebar is collapsed**
- Wordmark: ~24px / 20px bold
- Favicon: 16×16 and 32×32

### B. Desktop

| File | Canvas | Purpose |
|---|---|---|
| `app-icon.svg` | 256×256 viewBox `0 0 256 256` | Master desktop / PWA icon |
| `app-icon-32.svg` | 32×32 | Taskbar / title bar |
| `app-icon-48.svg` | 48×48 | Windows shortcut |
| `app-icon-256.svg` | 256×256 | High-DPI / installer |

**Desktop rules**
- Square, **safe padding ~12–16%** so the mark is not clipped by OS rounding (Windows 11, macOS)
- Slightly **bolder strokes** than web favicon
- Solid or simple gradient fill; no hairline details
- Works on light and dark taskbars (or provide light + dark variants)
- Optional: round-rect background matching the app (`#2563EB` → `#10B981`) so the icon has a “tile” at small sizes

**Suggested Windows ICO export (from the 256 SVG)**  
16, 24, 32, 48, 64, 128, 256

**Suggested macOS / PWA**  
180 (Apple touch), 192, 512

---

## 4. Composition rules

```
WEB HEADER (light)
[ 40px icon ]  8px gap  taxiterminalen
     ^ rounded-xl gradient tile              Plus Jakarta Sans ExtraBold

ADMIN COLLAPSED
[ 32px icon only ]

FAVICON / TASKBAR
[ icon only, no wordmark ]
```

- Icon: **optically centered** in a square
- Wordmark: **taxiterminalen** lowercase, tracking slightly tight
- Do not put the wordmark inside the favicon
- Minimum icon size: **16px** — test at 16, 24, 32, 40, 64, 256
- Clear space around the lockup: at least **0.25× icon width**

**Light background:** ink wordmark + color icon  
**Dark background:** white wordmark + color or white icon  
**Mono:** one fill, `fill="currentColor"` so Angular/CSS can tint it

---

## 5. SVG technical requirements

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-labelledby="title">
  <title id="title">Taxiterminalen</title>
  <!-- paths only -->
</svg>
```

- Use `viewBox`; **do not hardcode width/height** except in desktop export notes
- Prefer `fill` shapes over tiny strokes; if strokes, `stroke-linejoin="round"`
- Convert text to outlines in the final SVG (or keep live text only in a source file)
- Gradients: simple linear `from #2563EB to #10B981` (matches header)
- No external fonts in the production SVG
- Keep file small; flatten groups
- Valid, accessible: `role="img"` + `<title>`

**currentColor icon pattern (web)**

```xml
<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <!-- simplified taxi / TT mark -->
</svg>
```

---

## 6. Where it will be used

| Surface | Asset |
|---|---|
| `src/index.html` title / favicon | `favicon.svg` |
| Public header (`public-layout.html`) | `logo-icon.svg` + wordmark |
| Public footer | `logo-full-dark.svg` |
| Admin sidebar (`admin-layout.html`) | `logo-icon.svg` (replaces the “M” tile) |
| Home hero graphic | Larger `logo-icon` or taxi mark (optional) |
| PWA / desktop shortcut | `app-icon.svg` |

---

## 7. Acceptance checklist

- [ ] Reads as a **taxi association / hub**, not a generic SaaS bolt
- [ ] Distinct at **16×16** (favicon) and **32×32** (sidebar / taskbar)
- [ ] Full lockup works in the **80px-tall sticky header**
- [ ] Light, dark, and mono variants
- [ ] Colors match `#2563EB` and `#10B981`
- [ ] SVG only; no PNG required for web (PNG/ICO may be exported from SVG for desktop)
- [ ] Wordmark spelling: **taxiterminalen**
- [ ] Looks native next to Plus Jakarta Sans UI

---

## 8. Prompt for an image/SVG generator (copy-paste)

Create a modern SVG logo for “taxiterminalen”, a Danish taxi drivers’ association and membership platform. Geometric, professional, not cartoon. Primary colors #2563EB and #10B981 on #111827 or white. Mark: abstract taxi roof-light forming a T, or a simplified cab in a rounded square. Plus Jakarta Sans ExtraBold lowercase wordmark “taxiterminalen”. Deliver: (1) 64×64 app icon, (2) horizontal lockup, (3) 32×32 favicon, (4) 256×256 desktop icon with 12% padding. Flat vector, rounded-xl corners, no photorealism, no lightning bolt.
