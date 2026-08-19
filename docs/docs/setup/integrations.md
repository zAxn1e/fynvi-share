---
id: integrations
---

# Integrations

## ClamAV Antivirus Scanner

ClamAV scans uploaded shares for known viruses, trojans, and malicious binaries.

> [!NOTE]
> ClamAV requires dedicated memory resources (typically 2GB+ RAM for signatures).

### Docker Integration

Add a ClamAV service to your `docker-compose.yml`:

```yaml
services:
  fynvi-share:
    image: libaxnie/fynvi-share:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - CLAMAV_HOST=clamav
      - CLAMAV_PORT=3310
    depends_on:
      clamav:
        condition: service_healthy

  clamav:
    image: clamav/clamav
    restart: unless-stopped
```

When started, Fynvi Share will detect the ClamAV instance and log `ClamAV is active`.
