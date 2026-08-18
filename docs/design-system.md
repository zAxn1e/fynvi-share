# Fynvi Share — Design System Specification

## 1. Design Philosophy & Aesthetic Foundation

Fynvi Share is a modern, self-hosted, local-first file sharing platform. Its design identity balances **quiet technical capability**, **tactile precision**, and **soft visual warmth**.

### Core Tenets
1. **Utility & Clarity First**: File sharing is about speed, confidence, and trust. Critical data (filenames, sizes, transfer speeds, expiration dates, status badges) is presented with high contrast, crisp typography, and zero ambiguity.
2. **Selective Material Layers (Not Monolithic Glass)**: Glassmorphism is strictly a floating surface layer (headers, action floating bars, modals, drawers). Dense content areas (file listings, metadata tables, configuration forms) use solid and semi-solid surfaces with refined borders (`1px`) and soft shadows.
3. **Reactive Graphic Language (Abstract Flowing Curves)**: Dynamic, mathematical ambient curves define Fynvi's signature aesthetic. Curves react organically to application states:
   - *Idle/Home*: Gentle, calm ambient wave motion.
   - *Active Upload*: Fluid harmonic oscillation proportional to upload speed and progress.
   - *Success/Complete*: Stable, converging symmetry with ambient green/cyan glow.
   - *Paused*: Motion freezes into gentle harmonic ripples.
   - *Error/Interrupted*: Curve distorts gently or attenuates without aggressive flashing.
4. **Restrained Color & Gradient Architecture**: A strictly defined primary-to-accent gradient path (Electric Cyan `#06B6D4` → Deep Indigo/Violet `#6366F1` or Aurora Teal `#14B8A6` → Royal Blue `#2563EB`) reserved for lighting, hero accents, and brand touchpoints. Neutral surfaces remain clean, solid, and deep.

---

## 2. Color System & Design Tokens

### Token Hierarchy
Tokens follow a strict semantic hierarchy:
`Primary` → `Accent` | `Background` → `Surface` → `Elevated` → `Border` | `Text (Primary, Secondary, Muted)`

### Dark Mode (Default / "Obsidian Aurora")
- **Canvas / App Background**: `#090B0E` (Deep space neutral, avoiding harsh `#000000`)
- **Surface 0 (Base Container)**: `#0F1319` (Solid card & table background)
- **Surface 1 (Card & Group)**: `#151B24` (Distinct container background)
- **Surface 2 (Elevated & Controls)**: `#1C2430` (Input fields, hovered rows, active tabs)
- **Surface Glass (Floating Layer)**: `rgba(15, 19, 25, 0.72)` with `backdrop-filter: blur(16px)`
- **Border Subtle**: `rgba(255, 255, 255, 0.07)`
- **Border Medium**: `rgba(255, 255, 255, 0.14)`
- **Border Focus / Glow**: `rgba(59, 130, 246, 0.40)`
- **Text Primary**: `#F1F5F9` (High contrast, crisp legibility)
- **Text Secondary**: `#94A3B8` (Clear metadata, subtitles)
- **Text Muted**: `#64748B` (Tertiary captions, timestamps)
- **Brand Primary**: `#3B82F6` (Electric Blue)
- **Brand Accent**: `#8B5CF6` (Vibrant Violet) / `#06B6D4` (Cyan)
- **Brand Gradient**: `linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #8B5CF6 100%)`
- **State Tokens**:
  - Success: `#10B981` / Glow: `rgba(16, 185, 129, 0.18)`
  - Warning: `#F59E0B` / Glow: `rgba(245, 158, 11, 0.18)`
  - Danger / Error: `#EF4444` / Glow: `rgba(239, 68, 68, 0.18)`
  - Info: `#06B6D4` / Glow: `rgba(6, 182, 212, 0.18)`

### Light Mode ("Clean Atmospheric")
- **Canvas / App Background**: `#F8FAFC` (Slate Tinted White, avoiding harsh `#FFFFFF`)
- **Surface 0 (Base Container)**: `#FFFFFF`
- **Surface 1 (Card & Group)**: `#F1F5F9`
- **Surface 2 (Elevated & Controls)**: `#E2E8F0`
- **Surface Glass (Floating Layer)**: `rgba(255, 255, 255, 0.80)` with `backdrop-filter: blur(16px)`
- **Border Subtle**: `rgba(15, 23, 42, 0.08)`
- **Border Medium**: `rgba(15, 23, 42, 0.16)`
- **Border Focus / Glow**: `rgba(37, 99, 235, 0.35)`
- **Text Primary**: `#0F172A`
- **Text Secondary**: `#475569`
- **Text Muted**: `#94A3B8`
- **Brand Primary**: `#2563EB`
- **Brand Accent**: `#7C3AED` / `#0891B2`
- **Brand Gradient**: `linear-gradient(135deg, #0891B2 0%, #2563EB 50%, #7C3AED 100%)`
- **State Tokens**:
  - Success: `#059669`
  - Warning: `#D97706`
  - Danger: `#DC2626`
  - Info: `#0284C7`

---

## 3. Typography Scale & Hierarchy

Fynvi uses a dual typography stack engineered for technical clarity:
- **UI / Display Font**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`
- **Technical & Metric Font**: `JetBrains Mono`, `ui-monospace`, `SFMono-Regular`, `Menlo`, `monospace` (used for file sizes, transfer rates, ETAs, hash IDs, chunk counts, API keys).

| Scale | Size | Line Height | Weight | Letter Spacing | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | 36px (2.25rem) | 1.15 | 700 / 800 | -0.03em | Landing page headline |
| **H1 / Title** | 28px (1.75rem) | 1.2 | 700 | -0.025em | Main view titles, Share page header |
| **H2 / Section** | 20px (1.25rem) | 1.3 | 600 | -0.02em | Modal headers, group titles |
| **H3 / Subsection** | 16px (1.00rem) | 1.4 | 600 | -0.01em | Card headers, table group headers |
| **Body Large** | 15px (0.9375rem)| 1.5 | 400 / 500 | 0.00em | Hero descriptions, primary dialog text |
| **Body Regular** | 13.5px (0.84rem)| 1.5 | 400 / 500 | 0.00em | Standard table rows, inputs, buttons |
| **Body Small** | 12px (0.75rem) | 1.4 | 400 / 500 | +0.01em | Metadata badges, tooltips, secondary tags |
| **Mono Metric** | 12.5px (0.78rem)| 1.4 | 500 / 600 | -0.01em | File sizes, network speeds, ETAs |

---

## 4. Radii, Spacing & Elevation System

### Radius Scale
- `radius-xs`: `4px` (Small tag indicators, micro-badges)
- `radius-sm`: `6px` (Checkboxes, input fields, dropdown items, table row hover)
- `radius-md`: `10px` (Buttons, action icons, small popovers)
- `radius-lg`: `14px` (Cards, drawers, modal panels, dropzone drop targets)
- `radius-xl`: `20px` (Hero upload container, floating action hubs)
- `radius-full`: `9999px` (Pills, user avatars, status dots)

### Elevation & Material Levels
1. **Level 0 (App Canvas)**: Flat background `#090B0E` with responsive SVG dynamic curve canvas behind content.
2. **Level 1 (Content Surfaces)**: Solid `#0F1319` with `1px solid var(--border-subtle)` and `box-shadow: 0 1px 3px rgba(0,0,0,0.2)`.
3. **Level 2 (Elevated Surfaces & Controls)**: Solid `#151B24`, `border: 1px solid var(--border-medium)`, subtle hover lift `translateY(-1px)`.
4. **Level 3 (Floating Layers & Navigation)**: Glass surface `rgba(15, 19, 25, 0.72)` + `backdrop-filter: blur(16px)` + `border: 1px solid rgba(255,255,255,0.09)` + `box-shadow: 0 12px 32px rgba(0,0,0,0.36)`.
5. **Level 4 (Modals & Command Center)**: Centered glass surface `rgba(15, 19, 25, 0.90)` + `backdrop-filter: blur(24px)` + `box-shadow: 0 24px 64px rgba(0,0,0,0.6)`.

---

## 5. Signature Visual Element: Reactive Flowing Curves

The signature graphic element is an **organic SVG wave canvas** (`<FynviWaveCanvas />`) placed subtly in the background behind content layers. It renders bezier curves computed with trigonometric harmonics.

### Curve Behavior Matrix
| Application State | Harmonic Frequency | Amplitude | Velocity | Color Blend |
| :--- | :--- | :--- | :--- | :--- |
| **Idle / Home** | Low (0.001) | Subtle (15px) | 0.2x (Calm) | Electric Cyan `#06B6D4` (12% opacity) |
| **Active Uploading** | Variable (0.004) | Reactive (35px, tracks MB/s) | 1.0x (Fluid) | Gradient Cyan → Violet (25% opacity) |
| **Upload Complete** | Converging (0.001)| Stabilized (10px) | 0.1x (Gentle) | Emerald Green `#10B981` (18% opacity) |
| **Paused Upload** | Fixed Static | Fixed (8px) | 0.0x (Frozen) | Amber `#F59E0B` (14% opacity) |
| **Error / Fault** | Interrupted Phase | Asymmetric (20px) | 0.1x (Settled) | Crimson `#EF4444` (14% opacity) |

*Accessibility Guarantee*: When `prefers-reduced-motion: reduce` is enabled, wave velocity drops to `0`, rendering a static, subtle ambient glow without animation.

---

## 6. Core Reusable Component Library

The Fynvi Component System provides unified, accessible primitives:

1. **`FynviButton`**:
   - *Variants*: `primary` (accent gradient with subtle glow), `secondary` (subtle border, elevated surface), `ghost` (clean hover), `danger` (red-tinted), `glass` (floating backdrop).
   - *States*: Default, Hover, Active, Disabled, Loading (with smooth spinner and preserved dimensions).
2. **`FynviCard`**: Solid Level 1 container with optional header action slots and clean border delimiters.
3. **`FynviBadge`**: Compact status pills with status dots (`idle`, `active`, `paused`, `success`, `error`, `reverse-share`).
4. **`FynviInput` / `FynviSelect` / `FynviSwitch`**: Unified input system with high-contrast text, clear focus rings, integrated icon slots, and inline validation errors.
5. **`FynviDropzone`**: Central multi-mode file reception area supporting direct drag-and-drop, directory uploads, clipboard image paste, and batch selection.
6. **`FynviUploadItem` & `FynviUploadQueue`**: Complete chunk-aware upload row rendering:
   - Chunk progression bar
   - Byte count transferred / total
   - Instantaneous speed (`MB/s`)
   - Time remaining (ETA)
   - Action controls: [Pause], [Resume], [Retry], [Cancel].
7. **`FynviFileRow` & `FynviFileGrid`**: High-density file browser presentation with multi-selection checkboxes, type badges, file extensions, and contextual action menus.
8. **`FynviBreadcrumbs`**: Deep folder navigation trail with instant path clicking and folder creation.
9. **`FynviFilePreview`**: Unified preview modal for Images, Videos, Audio waveforms, PDF documents, and Code/Text files with syntax coloring.
10. **`FynviModal` & `FynviDrawer`**: Fluid overlay containers with keyboard accessibility (Escape, tab focus trapping), backdrop blur, and smooth spring exit transitions.
11. **`FynviEmptyState`**: Minimalist empty illustrations with clear call-to-actions and zero clutter.
