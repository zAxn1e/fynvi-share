# Contributing to Fynvi Share

Thank you for your interest in contributing to **Fynvi Share**! We welcome bug reports, feature suggestions, documentation enhancements, code contributions, and translations.

---

## Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](file:///CODE_OF_CONDUCT.md). Please be respectful and constructive in all interactions.

---

## Getting Started

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/zAxn1e/fynvi-share.git
   cd fynvi-share
   ```
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feat/my-new-feature
   ```
3. **Install Dependencies**:
   - Backend: `cd backend && bun install`
   - Frontend: `cd frontend && bun install`

---

## Development Workflow

### Starting the Environment
- Run backend database setup and dev server:
  ```bash
  cd backend
  bun run db:push
  bun run db:seed
  bun run dev
  ```
- Run frontend dev server:
  ```bash
  cd frontend
  bun run dev
  ```

### Code Style & Formatting
- Format code using Prettier:
  ```bash
  bun run format
  ```
- Check for lint errors:
  ```bash
  bun run lint
  ```

---

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) for concise and descriptive commit messages:

```text
<type>(<scope>): <short description>
```

Common types:
- `feat`: A new feature or capability
- `fix`: A bug fix
- `docs`: Documentation updates
- `style`: Formatting, whitespace, or style corrections
- `refactor`: Code restructuring without functional changes
- `test`: Adding or correcting tests
- `chore`: Maintenance, dependencies, or tooling adjustments

---

## Translations & Localization

Fynvi Share supports internationalization across both frontend and backend.
- Community translations are managed via [Crowdin](https://crowdin.com/project/fynvi-share).
- Source strings are located in `frontend/src/i18n/translations/en-US.ts` and `backend/src/i18n/en-US/*.json`.
- Thai (`th-TH`) is maintained as a core tier-1 supported locale alongside English (`en-US`).
- To validate translation dictionaries and syntax, run:
  ```bash
  bun run test:i18n
  ```
- For comprehensive documentation on the i18n architecture and workflows, see [`docs/localization.md`](file:///docs/localization.md).

---

## Submitting Pull Requests

Before submitting a Pull Request:
1. Verify that translation parity, lint checks, and TypeScript compiles pass:
   ```bash
   bun run test:i18n
   cd frontend && bunx tsc --noEmit && bun run lint
   cd ../backend && bunx tsc --noEmit && bun run lint
   ```
2. Include a descriptive title and summary of changes in your PR.
3. Check that no unintentional temporary files, secrets, or debug logs are included.
