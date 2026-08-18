---
id: contribute
---

# Contributing

We welcome community contributions to **Fynvi Share**! You can submit issues, feature proposals, pull requests, and translations.

## Getting Started

1. Check existing issues or open a new one to discuss your proposed change.
2. Fork the repository and create a descriptive feature branch:
   ```bash
   git checkout -b feat/my-improvement
   ```

## Development Setup

### Backend
```bash
cd backend
npm install
npm run db:push
npm run db:seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Pull Request Checklist
- Follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
- Ensure code is formatted: `npm run format`.
- Verify lint checks pass: `npm run lint`.
- Make sure no credentials, secrets, or temporary files are included.
