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
   - Backend: `cd backend && npm install`
   - Frontend: `cd frontend && npm install`

---

## Development Workflow

### Starting the Environment
- Run backend database setup and dev server:
  ```bash
  cd backend
  npx prisma db push
  npx prisma db seed
  npm run dev
  ```
- Run frontend dev server:
  ```bash
  cd frontend
  npm run dev
  ```

### Code Style & Formatting
- Format code using Prettier:
  ```bash
  npm run format
  ```
- Check for lint errors:
  ```bash
  npm run lint
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

## Submitting Pull Requests

Before submitting a Pull Request:
1. Verify that all lint checks and TypeScript compiles pass (`npm run lint` and `npx tsc --noEmit`).
2. Include a descriptive title and summary of changes in your PR.
3. Check that no unintentional temporary files, secrets, or debug logs are included.
