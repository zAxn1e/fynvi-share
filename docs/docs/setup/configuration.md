---
id: configuration
---

# Configuration

## General Configuration

Fynvi Share offers customizable runtime configuration through multiple approaches:

### Web UI
Administrators can modify system configurations interactively in the web console (`/admin/config`).

### YAML File
You can provide a declarative `config.yaml` file mounted into the container at `/opt/app/config.yaml` (or placed in the project root).
When a YAML configuration is active, UI configuration changes are disabled to ensure configuration integrity.

Refer to [`config.example.yaml`](file:///config.example.yaml) for a complete template of all configurable options.

---

### Environment Variables

Environment variables are used for infrastructure-level configuration:

#### Backend

| Variable | Default Value | Description |
|---|---|---|
| `BACKEND_PORT` | `8080` | Port on which the backend server listens |
| `DATABASE_URL` | `file:../data/fynvi-share.db?connection_limit=1` | SQLite database connection URL. Existing installations with only `pingvin-share.db` keep using the legacy file. |
| `DATA_DIRECTORY` | `./data` | Directory for persistent uploads and database files |
| `CONFIG_FILE` | *(unset)* | Path to optional YAML configuration file |
| `CLAMAV_HOST` | `127.0.0.1` (or `clamav` in Docker) | Host address of the ClamAV scanning daemon |
| `CLAMAV_PORT` | `3310` | Port for the ClamAV scanning daemon |
| `FS_LOG_LEVEL` | `log` | Backend log level. The legacy `PV_LOG_LEVEL` remains a fallback when `FS_LOG_LEVEL` is unset. |

#### Frontend

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `3000` | Port on which the frontend application listens |
| `API_URL` | `http://localhost:8080` | URL used by the frontend to proxy backend requests |

#### Docker Specific

| Variable | Default Value | Description |
|---|---|---|
| `TRUST_PROXY` | `false` | Enables trusting reverse proxy headers (`X-Forwarded-For`, etc.) |
| `CADDY_DISABLED` | `false` | When set to `true`, built-in Caddy proxy is disabled |
| `PUID` and `PGID` | `1000` | User and group ID mapped for persistent volume permissions |

#### Compatibility Notes

The Redis cache namespace remains `pingvin` for compatibility with existing Pingvin Share X deployments. Do not change it during an upgrade unless the cache is intentionally cleared.
