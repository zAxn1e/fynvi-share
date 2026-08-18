# Changelog

All notable changes to Fynvi Share will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

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
