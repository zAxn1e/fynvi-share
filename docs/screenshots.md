# Fynvi Share Product Demo Screenshots & Video Generation System

This document outlines the Playwright-based screenshot and interactive video demo capture system for **Fynvi Share**.

---

## Overview & Architecture

The screenshot generation engine produces high-resolution, deterministic, retina-quality product screenshots and video demonstrations without requiring a live backend, database connection, or external dependencies.

```
┌─────────────────────────────────────────────────────────────┐
│                   Playwright Test Runner                    │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
    ┌──────────────────────┐        ┌──────────────────────┐
    │  In-Process Mock API │        │ Browser Route Inter- │
    │ Server (Port: 8080)  │        │   ceptor (Page/API)  │
    └──────────┬───────────┘        └──────────┬───────────┘
               │                               │
               │ (Handles Next.js SSR          │ (Handles Client-side
               │  & Middleware requests)       │  Hydration & Fetches)
               ▼                               ▼
    ┌─────────────────────────────────────────────────────────┐
    │               Next.js Application Server                │
    │         (Retina Viewports, Fixed UTC Clock,             │
    │          Reduced Motion, Frozen Scrollbars)             │
    └──────────────────────────┬──────────────────────────────┘
                               │
                               ▼
    ┌─────────────────────────────────────────────────────────┐
    │               Deterministic Output Assets               │
    │  - screenshots/desktop/{dark,light}/                    │
    │  - screenshots/mobile/{dark,light}/                     │
    │  - screenshots/videos/product-demo-desktop.webm         │
    └─────────────────────────────────────────────────────────┘
```

---

## Generated Assets Directory Structure

```
screenshots/
├── desktop/
│   ├── dark/
│   │   ├── 01-landing.png          # Public Hero & Dropzone
│   │   ├── 02-dashboard.png        # Bento Metric Cards & Recent Shares
│   │   ├── 03-upload.png           # Multi-file Upload Queue & Progress
│   │   ├── 04-share-view.png       # Showcase with 4K Video Sample
│   │   ├── 05-admin-overview.png   # Administration Center & Health
│   │   └── 06-admin-theme.png      # Appearance & Theme Customizer
│   └── light/
│       ├── 01-landing.png
│       ├── 02-dashboard.png
│       ├── 03-upload.png
│       ├── 04-share-view.png
│       ├── 05-admin-overview.png
│       └── 06-admin-theme.png
├── mobile/
│   ├── dark/
│   │   ├── 01-landing.png
│   │   ├── 02-dashboard.png
│   │   ├── 03-upload.png
│   │   ├── 04-share-view.png
│   │   └── 05-admin-overview.png
│   └── light/
│       ├── 01-landing.png
│       ├── 02-dashboard.png
│       ├── 03-upload.png
│       ├── 04-share-view.png
│       └── 05-admin-overview.png
└── videos/
    └── product-demo-desktop.webm   # Interactive Full Walkthrough Video
```

---

## Technical Specifications

| Parameter | Desktop Viewport | Mobile Viewport | Video Recording |
| :--- | :--- | :--- | :--- |
| **Dimensions** | `1440 × 900` | `390 × 844` (iPhone / Pixel) | `1440 × 900` |
| **Scale Factor** | `2x` (Retina High-DPI) | `2x` (Retina High-DPI) | `1x` (Standard 60fps) |
| **Color Schemes**| Dark Mode & Light Mode | Dark Mode & Light Mode | Dark Mode |
| **Clock/Time** | Fixed UTC `2026-08-20T12:00:00Z` | Fixed UTC `2026-08-20T12:00:00Z` | Fixed UTC `2026-08-20T12:00:00Z` |
| **Animations** | Disabled via CSS `@media (prefers-reduced-motion)` | Disabled via CSS `@media (prefers-reduced-motion)` | Smooth transitions enabled |

---

## Available Commands

Execute commands from the repository root:

```bash
# Run all desktop screenshots (Dark & Light)
bun run screenshot:desktop

# Run all mobile screenshots (Dark & Light)
bun run screenshot:mobile

# Record the interactive video demo walkthrough
bun run screenshot:video

# Run the complete test suite (Desktop, Mobile, Video)
bun run screenshot:all
```

Or from the `frontend/` directory:

```bash
cd frontend

# Generate desktop screenshots
bun run screenshot:desktop

# Generate mobile screenshots
bun run screenshot:mobile

# Generate video demo
bun run screenshot:video
```

---

## Deterministic Mock Fixtures

The fixtures in `frontend/e2e/fixtures/demo-data.ts` supply realistic, production-grade showcase data:
- **Admin User**: Alex Rivera (`alex.rivera@fynvi.io`) with 128 GB quota.
- **Storage Metrics**: 42.8 GB used / 128 GB total capacity (33% disk quota).
- **Active User Shares**: 6 diverse shares with active status badges, password protection flags, and clean countdown timers.
- **Share Showcase (`demo-share-showcase`)**:
  - `4K_Cinematic_Showreel.mp4` (1.4 GB video sample with play overlay)
  - `Production_Still_01.jpg` (18.5 MB photo)
  - `Original_Soundtrack.mp3` (42.1 MB lossless audio)
  - `Project_Metadata_Archive.zip` (360.5 MB compressed archive)

---

## CI / Automated Pipeline Integration

Add the following step to your GitHub Actions workflow for automatic screenshot regeneration on release:

```yaml
name: Generate Product Screenshots

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  screenshots:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - name: Install Dependencies
        run: bun install
      - name: Install Playwright Chromium
        run: cd frontend && bunx playwright install chromium
      - name: Generate Screenshots & Video
        run: bun run screenshot:all
      - name: Upload Screenshots Artifact
        uses: actions/upload-artifact@v4
        with:
          name: product-screenshots
          path: screenshots/
```
