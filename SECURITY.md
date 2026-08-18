# Security Policy

## Supported Versions

Security fixes and patches are applied to the latest development branch and released versions of Fynvi Share.

| Version | Supported |
|---|---|
| Latest / `main` | :white_check_mark: |
| < Latest | :x: |

We strongly recommend operators keep their Fynvi Share instances up to date.

---

## Reporting a Vulnerability

We take the security of Fynvi Share and user data seriously. If you discover a security vulnerability, please disclose it responsibly.

### How to Report

- **Do NOT open a public GitHub issue** to report a security vulnerability.
- Please use **[GitHub Private Vulnerability Reporting](https://github.com/zAxn1e/fynvi-share/security/advisories/new)** to submit vulnerability details confidentially.
- If private vulnerability reporting is unavailable, reach out directly to the repository maintainers through private communication channels before any public disclosure.

### What to Include in Your Report

To help us investigate and triage the issue quickly, please provide:
1. A clear description of the vulnerability and its potential impact.
2. Step-by-step reproduction instructions or a minimal Proof of Concept (PoC).
3. Any affected configuration settings or prerequisites (e.g. S3 enabled, LDAP active, reverse proxy settings).
4. Suggested remediations or mitigations, if known.

### Responsible Disclosure Timeline

- Maintainers will acknowledge receipt of your report within 3 business days.
- We will provide status updates as we validate and prepare a patch.
- We kindly request that you give maintainers reasonable time to issue a fix before disclosing any details publicly.

---

## Security Recommendations for Self-Hosters

Because Fynvi Share is a self-hosted application, system administrators and operators play an essential role in deployment security:

1. **Enforce HTTPS / TLS**: Always place Fynvi Share behind a secure reverse proxy (e.g., Caddy, Nginx, Traefik, or Cloudflare) with valid SSL/TLS certificates.
2. **Protect Environment Secrets**: Ensure `.env` files and `JWT_SECRET` values are kept confidential and not exposed in public repositories or unprotected directory listings.
3. **Restrict File & Directory Permissions**: Protect the `/data` storage volume with appropriate user/group permissions (`PUID`/`PGID`) to avoid unauthorized access by other local processes.
4. **Database & Network Isolation**: Do not expose internal SQLite files or Redis cache instances directly to the public internet.
5. **Regular Backups**: Maintain automated, regular backups of your SQLite database (`/data/fynvi-share.db` for new installations, or the retained legacy `pingvin-share.db`) and uploaded files (`/data/uploads`).
6. **Upload Safety**: Keep the application updated to receive filename validation and path-traversal protections; never expose the data volume for direct public writes.
7. **Virus Scanning**: ClamAV scanning is optional and must be explicitly configured. In high-traffic or public-facing environments, enable it to inspect inbound uploads.
