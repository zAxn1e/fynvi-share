---
id: versioning
---

# Versioning

Fynvi Share follows [Semantic Versioning](https://semver.org/). The current `0.x` series is pre-1.0, so public APIs and behavior can still evolve between minor releases.

## Release Tags

Releases use `v`-prefixed tags such as `v0.1.0`, `v0.2.0`, and `v0.2.1`.

## Version Changes

- Minor releases add features or introduce intentional behavior changes during the pre-1.0 period.
- Patch releases contain compatible fixes, documentation changes, and operational improvements.
- `v1.0.0` will indicate a stable public API and documented compatibility commitments.

## Release Process

Use `npm run release:minor` or `npm run release:patch` from the repository root. Changes should use Conventional Commit types, including `feat`, `fix`, `docs`, `refactor`, and `chore`, so release notes remain clear.
