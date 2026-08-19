---
id: localization
title: Localization & i18n
---

# Localization & Internationalization Architecture

This document details the localization (i18n) architecture, governance model, workflows, and best practices for **Fynvi Share**.

---

## 1. Overview

Fynvi Share features a dual-layer localization architecture:
- **Frontend Localization**: Built with `react-intl` (v6.6.8) and custom fallback resolution in `useTranslate()`. All 33 supported languages are compiled into static TS dictionary bundles with zero runtime latency.
- **Backend Localization**: Powered by `nestjs-i18n` (v10.8.4) with 9 namespaced JSON dictionaries, dynamically resolved per request and system default settings.

---

## 2. Directory Structure

```text
├── crowdin.yml                      # Crowdin CLI configuration with BCP-47 mappings
├── .github/workflows/
│   └── crowdin-sync.yml             # Automated Crowdin push & PR sync workflow
├── scripts/
│   └── validate-translations.ts     # Translation linter & ICU variable validator
├── frontend/
│   └── src/
│       ├── hooks/
│       │   └── useTranslate.hook.ts # Custom translation hook with fallbacks
│       └── i18n/
│           ├── locales.ts           # Locales registry (33 languages)
│           └── translations/
│               ├── en-US.ts         # Canonical English source dictionary
│               ├── th-TH.ts         # First-class Thai dictionary
│               └── [locale].ts      # Community translation files
└── backend/
    └── src/
        └── i18n/
            ├── en-US/               # Canonical English backend namespaces
            │   ├── auth.json
            │   ├── config.json
            │   ├── email.json
            │   ├── file.json
            │   ├── ldap.json
            │   ├── oauth.json
            │   ├── reverseShare.json
            │   ├── share.json
            │   └── validation.json
            ├── th-TH/               # First-class Thai backend namespaces
            └── [locale]/            # Community backend translation namespaces
```

---

## 3. Localization Governance Model

### Tier 1: Canonical Source (`en-US`)
- Managed directly by core developers in the repository.
- All new features and UI components must define keys in `en-US.ts` and corresponding backend JSON files.

### Tier 1: First-Class Locale (`th-TH`)
- Maintained directly in-tree alongside `en-US`.
- 100% translation coverage is required across all frontend keys and backend JSON namespaces.

### Tier 2: Community Locales (31 Languages)
- Synchronized with [Crowdin](https://crowdin.com/project/fynvi-share).
- Automated GitHub Actions sync source strings to Crowdin and generate PRs with updated community translations.

---

## 4. How to Add or Update Strings

### Frontend Strings

1. Add the semantic key and English string to `frontend/src/i18n/translations/en-US.ts`:
   ```typescript
   "myFeature.greeting": "Welcome to {appName}",
   ```

2. Add the Thai translation to `frontend/src/i18n/translations/th-TH.ts`:
   ```typescript
   "myFeature.greeting": "ยินดีต้อนรับสู่ {appName}",
   ```

3. In your React component, use the `useTranslate()` hook:
   ```tsx
   import useTranslate from "../hooks/useTranslate.hook";

   const MyComponent = () => {
     const t = useTranslate();
     return <h1>{t("myFeature.greeting", { appName: "Fynvi Share" })}</h1>;
   };
   ```

### Backend Strings

1. Add the key and translation to the appropriate namespace in `backend/src/i18n/en-US/[namespace].json` and `backend/src/i18n/th-TH/[namespace].json`.
2. In NestJS services/controllers:
   ```typescript
   import { I18nService } from "nestjs-i18n";

   @Injectable()
   export class MyService {
     constructor(private readonly i18n: I18nService) {}

     someMethod() {
       throw new BadRequestException(this.i18n.t("auth.invalidPassword"));
     }
   }
   ```

---

## 5. Translation Validation

Fynvi Share includes a built-in translation validation runner that checks:
- Key parity between `en-US.ts` and target language files.
- Backend JSON syntax and namespace parity.
- ICU variable interpolation consistency (`{name}`, `{count, plural, ...}`).

Run validation locally:
```bash
bun run test:i18n
```

---

## 6. Crowdin Integration

The Crowdin configuration is located in `crowdin.yml`. It uses:
- `CROWDIN_PROJECT_ID` and `CROWDIN_PERSONAL_TOKEN` environment secrets.
- Two-way mapping for all 33 locales to match BCP-47 file naming conventions.
- Automated CI workflow triggered on changes to `main` branch.
