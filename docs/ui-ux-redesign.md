# Fynvi Share — Comprehensive UI/UX Redesign Proposal

## 1. Executive Summary & Product Vision

**Fynvi Share** is a modern, self-hosted, local-first file sharing platform.
This document outlines the complete architectural redesign of the frontend application. It establishes:
- A complete UX/UI audit of legacy flows and interfaces
- A new unified Information & Navigation Architecture
- A dedicated, high-performance Resumable Upload experience
- Complete wireframe-level specifications for all 25 page states in the inventory
- Responsive, Motion, and Accessibility compliance strategies
- Zero-breakage migration mapping for all existing backend APIs and contracts

---

## 2. Comprehensive UX Audit of Current Frontend

| Flow / Area | Current Friction & Deficiencies | Redesign Resolution |
| :--- | :--- | :--- |
| **Homepage & Hero** | Inconsistent branding; upload trigger navigates away to a separate page, breaking flow. | Embedded interactive Dropzone on Hero with immediate file staging, paste capture, and instant queue activation without page refresh. |
| **Upload Engine & Progress** | Uploading hides granular status, chunks, and ETA; pausing/resuming is difficult to monitor. | Persistent Global Upload Drawer & Hub with per-file transfer speed (`MB/s`), transferred/total bytes, ETA countdown, chunk retry buttons, and crash recovery. |
| **Navigation & Shell** | Navigation scattered between a top bar and disjointed menus; mobile navigation is cramped. | Unified `FynviShell` featuring a sleek collapsible sidebar, global storage gauge, quick upload action button, search palette, and mobile bottom bar. |
| **Share Management** | Dense lists lack search, sorting by expiration/size, and bulk operations. | Modernized data table with search filters, tag badges, instant copy link action, QR preview, and sticky multi-select bulk operations. |
| **Public Share Page** | Plain download list with poor visual distinction between file types; lacks preview for audio/code/PDF. | Rich recipient landing page with ZIP one-click download, folder breadcrumbs, in-browser previews for images/video/audio/PDF/code, and password protection gate. |
| **File Manager & Folders** | Basic folder browsing without quick move, breadcrumb jumping, or high-density grid mode. | Dual List/Grid mode with breadcrumb path traversal, drag-and-drop file organization, and bulk actions. |
| **Reverse Shares** | Minimal guidance for external uploaders; lacks clear quota or expiry warnings. | Dedicated public upload portal displaying remaining recipient quota, max file size limit, and upload progress status. |
| **Settings & Admin** | Cluttered multi-level forms lacking progressive disclosure and clear danger zones. | Tabbed modular settings with segmented controls, live theme preview toggles, API key token copiers, and explicit confirmation modals for destructive tasks. |

---

## 3. New Information Architecture & Navigation Model

### Navigation Hierarchy
```
Fynvi Application Shell
├── Global Sidebar / Header
│   ├── Brand Identity & Workspace Status
│   ├── Primary Navigation:
│   │   ├── Dashboard (Overview, Quick Actions, Activity)
│   │   ├── My Shares (Active, Expired, Password-Protected)
│   │   ├── Files & Folders (Hierarchical Storage Browser)
│   │   ├── Reverse Shares (Public Upload Invites)
│   │   └── Account & Security (Profile, MFA, API Keys)
│   ├── Storage Quota Gauge (Used / Total, Visual Progress Ring)
│   └── Admin Portal (Users, Global Shares, Storage, System Config)
├── Global Top Bar
│   ├── Breadcrumb Trail
│   ├── Global Quick Action (`+ Upload`, `+ Create Share`)
│   ├── Search & Filter Bar (`Cmd + K` Palette)
│   ├── Upload Activity Bell / Status Tracker
│   └── User Profile Popover & Theme Mode Toggle (Dark / Light)
└── Persistent Upload Tray (Collapsible floating drawer at bottom right)
```

---

## 4. Complete Page-by-Page Redesign Specifications (All 25 States)

### 1. Landing / Homepage (`/`)
- **Hero Section**: Clean headline ("Share files at the speed of your network"), ambient dynamic curve canvas reacting in real-time.
- **Dropzone Hub**: Large, prominent dropzone accepting multi-file drops, directory uploads, and `Ctrl+V` clipboard pastes.
- **Quick Share Options**: Progressive disclosure toggle for Expiration (1 hour, 1 day, 7 days, Never), Password Protection, and Download Limit.
- **Recent Activity Summary**: If logged in, displays a high-density summary card of recent shares with download counts and quick copy buttons.

### 2. Login (`/auth/signIn`)
- Clean centered container (Surface Level 1) with subtle brand lighting behind.
- Input fields for Username/Email and Password, SSO/OIDC buttons (if enabled), "Remember me", and clean error callouts.

### 3. Register (`/auth/signUp`)
- Displayed when public registration is enabled in system settings.
- Form fields with real-time password strength validation and terms acknowledgment.

### 4. Authenticated Dashboard (`/`)
- Storage quota visual bar with byte breakdown (e.g. `24.5 GB / 100 GB`).
- Quick metrics: Active Shares count, Total Downloads, Active Reverse Shares.
- Fast Upload dropzone widget.
- Recent Transfers list with real-time download alerts.

### 5. Upload Experience (`/upload`)
- Fullscreen focused drag-and-drop workspace with chunk configuration, parallel thread settings, and automatic checksum verification.
- Instant file staging preview with type icons, exact byte counts, and delete actions.

### 6. Upload Queue (`Persistent Global Drawer`)
- Minimized pill showing: `Uploading 3 files (42 MB/s - 1m 20s remaining)`.
- Expanded view: Individual file progress bars, chunk indicators, per-file [Pause], [Resume], [Cancel], and [Retry Failed Chunks] buttons.

### 7. Share Creation Experience
- Stepped or progressive disclosure panel:
  1. *Files & Folders Selection*
  2. *Security & Access Controls* (Password, Max downloads, Expiration timestamp, Email restrictions)
  3. *Share URL & Custom Slug / Alias*
  4. *Publish & Generate Link / QR Code*.

### 8. Share Management (`/account` / `/share/[shareId]`)
- Data table and card views with status badges (`Active`, `Expired`, `Password-Protected`).
- Columns: Title, Files count, Total Size, Created Date, Expires In, Total Downloads, Actions.
- Batch action bar for deleting, updating expiration, or exporting links.

### 9. Public Share Page (`/share/[shareId]` & `/s/[shareId]`)
- Distinctive branded header with Share Name, Description, and Expiration countdown badge.
- [Download All (.ZIP)] primary button.
- Clean file list table with individual download buttons, file size, and [Preview] eye action.
- Reverse upload dropzone if the owner enabled recipient uploads.

### 10. File Browser & 11. Folder Browser
- Hierarchical folder navigation with click-to-enter folders and breadcrumb navigation (`Root / Documents / 2026 / Invoices`).
- Multi-file selection with `Shift+Click` and rubber-band drag.
- Context menu: Download, Rename, Move to folder, Preview, Delete.

### 12. File Preview Modal
- Unified overlay supporting:
  - *Images*: PNG, JPG, WebP, GIF, SVG with zoom and pan.
  - *Video*: MP4, WebM, MKV with custom styled HTML5 player.
  - *Audio*: MP3, WAV, FLAC, OGG with playback scrubber.
  - *Documents*: In-browser PDF renderer.
  - *Code & Text*: Syntax-highlighted text viewer with line numbers and copy raw text.

### 13. Reverse Share Workflow (`/upload/[reverseShareToken]`)
- Recipient view with host banner: "Uploaded files will be delivered securely to [User]".
- Quota indicator: Displays remaining allowance.
- Clean dropzone and multi-upload progression.

### 14. Account Settings (`/account`)
- Profile details (Username, Email, Avatar).
- Storage quota breakdown and active sessions management.

### 15. Appearance Settings
- Mode switcher: Dark (Obsidian Aurora), Light (Clean Atmospheric), or System default.
- Accent color picker (Primary Blue, Electric Cyan, Emerald, Violet).
- Reduced Motion toggle for ambient curve animations.

### 16. Security Settings (`/account/security`)
- Password change form with current password validation.
- Two-Factor Authentication (TOTP 2FA) setup with QR code and backup recovery codes.

### 17. API Key Management (`/account/api-keys`)
- List of active API tokens with creation dates, expiration, and permission scopes.
- [Create API Key] modal with one-time secret display and instant clipboard copy.

### 18. Admin Dashboard (`/admin`)
- Server metrics: Total storage consumed on disk, CPU/RAM utilization, total users, active shares.
- Quick link actions to User Management and System Config.

### 19. Admin Settings (`/admin/config/[category]`)
- Categorized configuration panels: General, Sharing, Email / SMTP, S3 Storage, OAuth/OIDC, Security.
- Form inputs with clear description help text and instant test connection buttons (e.g. Test SMTP, Test S3).

### 20. Error Pages (`/error` & `500`)
- Friendly technical error layout with copyable debug error code and [Return Home] action.

### 21. Empty States
- Dedicated empty states for: No Shares, No Uploads, No Search Results, No Files in Folder.
- Includes clean minimalist icon, explanation, and primary call-to-action button.

### 22. Loading States
- Content skeleton screens with subtle shimmer animations matching the exact row/card layout to avoid layout shift (CLS).

### 23. Not Found Page (`/404`)
- Clean 404 illustration with breadcrumb reset to root.

### 24. Expired Share Page
- Informative locked state: "This share link expired on [Date] and its files have been purged according to security policy."

### 25. Password-Protected Share Gate
- Clean modal card asking for share password with instant unlock and session caching.

---

## 5. Responsive, Motion & Accessibility Strategy

### Responsive Breakpoints
- **Mobile (< 768px)**: Collapsible bottom sheet navigation, full-width touch-friendly dropzone, sticky bottom action bar.
- **Tablet (768px - 1024px)**: Compact icon sidebar, dual-column dashboard, touch-optimized file rows.
- **Desktop (1024px - 1440px)**: Full expanded sidebar with storage meter, multi-pane file browser, floating upload queue.
- **Large Desktop (> 1440px)**: Centered max-width canvas (`1400px`) preventing awkward over-stretching while maintaining high information density.

### Motion Principles
- Transitions use `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out quint) for snappy, natural UI movement.
- Tooltips, popovers, and dropdowns open with `120ms` scale transition (`scale(0.96) → scale(1)`).
- Full compliance with `@media (prefers-reduced-motion: reduce)`: all background wave canvas rendering stops animation, and modal transitions switch to direct opacity fades.

### Accessibility (WCAG 2.1 AA Compliance)
- Contrast ratio between text and surface strictly exceeds `4.5:1` for normal text and `3:1` for large text.
- Full keyboard traversal support (`Tab`, `Shift+Tab`, `Arrow keys`, `Enter`, `Escape`, `Cmd+K` palette).
- All icons paired with `aria-label` or visible typography labels.

---

## 6. Migration Strategy & Backend Compatibility Guarantee

1. **Preserve All API Calls**: All network communication continues using existing services (`shareService`, `authService`, `configService`, `userService`, `systemService`, `chunkUploadService`).
2. **Preserve i18n Localization**: All user-facing strings utilize existing React-Intl translation keys.
3. **Drop-in UI Replacement**: Upgrades component architecture without breaking any backend contract or routing semantics.
