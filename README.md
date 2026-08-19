# Fynvi Share

**Fynvi Share** is a modern, self-hosted file sharing platform designed for reliable uploads, local-first storage, and a polished sharing experience.

Derived from Pingvin Share X 1.22.1, Fynvi Share elevates personal and team file distribution with a responsive Obsidian Aurora design system, robust chunked transfer mechanisms, folder structure preservation, and comprehensive access controls.

---

## Features

### Core Capabilities
- **Local-Storage-First**: Files stay directly on your server under your control, with optional S3-compatible object storage support.
- **Reliable Chunked Uploads**: High-speed, resumable multi-part upload pipeline with real-time transfer indicators.
- **Folder Support**: Upload entire directory hierarchies via drag-and-drop or file pickers.
- **Share Controls**:
  - Expiration dates and automatic cleanup policies.
  - Optional password protection.
  - Download count and visitor limits.
  - Human-friendly custom URLs and slugs.
- **Reverse Shares**: Create secure inbound upload links allowing external collaborators to submit files without accounts.
- **API Keys & Integrations**: Generate dedicated API tokens with built-in export presets for tools like ShareX.
- **Identity & Authentication**:
  - Native credentials with optional Two-Factor Authentication (TOTP / Authenticator app).
  - OpenID Connect (OIDC) and LDAP authentication integration.
  - Role-based administration.
- **Email Notifications**: Share recipient links, delivery alerts, and password reset workflows via SMTP.
- **Security Scans**: Optional ClamAV integration to automatically inspect uploaded payloads for viruses and malware.
- **Internationalization**: Multi-language support with user-selectable locale preferences.

---

## Architecture & Storage Philosophy

Fynvi Share operates on a **local-storage-first** philosophy. When deployed:
- Uploaded assets are saved to the persistent local directory (`/data/uploads`), avoiding third-party lock-in or recurring cloud costs.
- Database records (shares, metadata, users, API keys) are managed via Prisma with SQLite by default, keeping infrastructure footprint minimal.
- When enterprise or cloud scale is needed, S3-compatible storage (AWS S3, MinIO, Cloudflare R2, Backblaze B2) can be activated via configuration.

---

## Quickstart with Docker Compose

The fastest way to deploy Fynvi Share is using Docker Compose.

### 1. Create a `docker-compose.yml` File

```yaml
services:
  fynvi-share:
    container_name: fynvi-share
    image: libaxnie/fynvi-share:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - APP_URL=http://localhost:3000
      - TRUST_PROXY=false
    volumes:
      - "./data:/opt/app/backend/data:rw,z"
      - "./data/images:/opt/app/frontend/public/img:rw,z"
```

### 2. Start the Application

```bash
docker compose up -d
```

Fynvi Share will now be accessible at `http://localhost:3000`.

---

## Configuration

Fynvi Share can be configured through environment variables, the web UI admin settings, or an optional file-based configuration (`config.yaml`).

See [`.env.example`](./.env.example) and [`config.example.yaml`](./config.example.yaml) for full configuration reference.

Key environment variables:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Exposed application port |
| `APP_URL` | `http://localhost:3000` | Canonical public URL used for links and emails |
| `DATA_DIRECTORY` | `./data` | Directory for persistent uploads and SQLite database |
| `TRUST_PROXY` | `false` | Enable when running behind reverse proxies (Nginx, Caddy, Traefik) |
| `CONFIG_FILE` | *(unset)* | Path to optional YAML configuration override |

---

## Development & Local Setup

### Prerequisites
- Bun 1.1+ (Bun 1.3+ recommended)
- Git

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/zAxn1e/fynvi-share.git
cd fynvi-share
```

### 2. Start Backend

```bash
cd backend
bun install
bun run db:push
bun run db:seed
bun run dev
```

### 3. Start Frontend

```bash
cd frontend
bun install
bun run dev
```

The frontend development server starts on `http://localhost:3000` with API proxying to backend `http://localhost:8080`.

---

## Migration from Legacy Pingvin Share

Fynvi Share provides database reconciliation and slug generation scripts for installations migrating from legacy Pingvin Share X:

Existing installations that contain only `pingvin-share.db` continue to use that database. New installations use `fynvi-share.db`; no database files are renamed or copied automatically.

```bash
cd backend
# Dry-run audit
bun run migrate

# Apply database updates and backups
bun run migrate -- --apply
```

---

## Security

Please review [`SECURITY.md`](./SECURITY.md) for our vulnerability disclosure policy, supported versions, and operational hardening recommendations.

---

## Contributing

We welcome community contributions, bug fixes, and translations! Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) and [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) before opening a pull request.

---

## License & Attribution

Fynvi Share is licensed under the **BSD 2-Clause License**. See [`LICENSE`](./LICENSE) for the full license text.

Fynvi Share is derived from [Pingvin Share X 1.22.1](https://github.com/smp46/pingvin-share-x/tree/v1.22.1), originally developed by [Elias Schneider](https://github.com/stonith404). See [`ATTRIBUTION.md`](./ATTRIBUTION.md) for detailed technical provenance and copyright notices.
