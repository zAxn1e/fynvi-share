# Changelog

All notable changes to Fynvi Share will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.1.1] - 2026-08-20

### Performance & Docker
- **Multi-Stage Optimization**: Implemented a dedicated `backend-prod-dependencies` stage via `bun install --production --frozen-lockfile`, eliminating build-only dependencies (`@angular-devkit`, `webpack`, `typescript`, `eslint`, `prettier`) from the runtime image and shrinking `backend/node_modules` from 478 MB to 294 MB.
- **Static FFmpeg Engine**: Integrated `mwader/static-ffmpeg:7.1` in place of Debian's APT package, stripping out desktop GPU drivers and the LLVM compiler stack (`/usr/lib/x86_64-linux-gnu` reduced from 451 MB to 55 MB).
- **Image Size Reduction**: Slashed final Docker content size from ~401 MB to **257 MB** (-36%) and disk footprint from 1.72 GB to 1.07 GB.
- **BuildKit Layer Cache & Caching**: Enabled `COPY --link` across all stages, mounted Next.js webpack build cache (`.next/cache`), and suppressed build telemetry.
- **Overhauled `.dockerignore`**: Excluded `docs/`, `backend/test/`, local build caches, and extraneous package manifests from the build context.

### Fixed & Reliability
- **Offline Startup Guarantee**: Pre-bundled the `prisma` CLI and schema engine in production dependencies, ensuring `bunx prisma db push` executes reliably in airgapped/offline deployments with zero startup network dependency.
- **Frontend Dependencies**: Removed redundant `sharp` dependency from `frontend/package.json` since `images.unoptimized = true` is configured in Next.js.
- **Documentation Polish**: Updated contributing and setup guides to use consistent `bun` CLI commands.

---

## [0.1.0] - 2026-08-19

### Added
- **Project Identity**: Rebranded and restructured repository for Fynvi Share with official open-source compliance.
- **Obsidian Aurora Design System**: Complete UI/UX redesign featuring dark/light atmospheric tokens, tactile components, responsive navigation shell, and ambient wave indicators.
- **Resumable Chunked Upload Engine**: Session-based multi-part upload pipeline with real-time transfer telemetry and pause/resume capability.
- **Folder Hierarchy Support**: Full drag-and-drop folder upload and directory tree preservation in shares.
- **Human-Friendly Slugs**: Optional custom slug generation and vanity share URLs.
- **API Key Management**: Dedicated token issuance for authenticated API consumption and ShareX integration export.
- **Migration Tooling**: CLI script (`scripts/migrate-pingvin.ts`) for data reconciliation and slug backfilling from upstream installations.
- **Community Standards**: Comprehensive `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, and `ATTRIBUTION.md`.

### Changed
- Refactored layout components into unified `AppShell`, `Sidebar`, `Topbar`, and `MobileNav`.
- Upgraded configuration seeding to Fynvi Share default parameters and localized email templates.
- Modernized Docker and Docker Compose definitions for `fynvi-share`.

---

## Provenance Note

Fynvi Share was initialized from [Pingvin Share X 1.22.1](https://github.com/smp46/pingvin-share-x), originally developed by Elias Schneider under the BSD 2-Clause License. See [`ATTRIBUTION.md`](./ATTRIBUTION.md) for details on upstream lineage.
