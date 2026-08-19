---
id: integrations
---

# Integrations

## ShareX Custom Uploader (.sxcu)

Fynvi Share includes native support for **ShareX** image and file uploading via personal API keys.

### Setting Up ShareX

1. In Fynvi Share, navigate to **My Account** > **API Keys**.
2. Click **Generate Key**, give it a name (e.g. `Desktop ShareX`), and create the key.
3. Click **Download ShareX Config** to download the `fynvi-share.sxcu` configuration file.
4. In ShareX:
   - Go to **Destinations** > **Custom uploader settings...**
   - Click **Import** > **From file...** and select `fynvi-share.sxcu`.
   - Set **Destination type** to `Image uploader`, `Text uploader`, and `File uploader`.
   - Update the `Authorization` header with your newly generated API key: `Bearer ns_live_...`.
   - Test the uploader and set Fynvi Share as your default destination.

### Direct API File Upload

You can also upload files directly via `curl` or any HTTP client using the endpoint:

```bash
curl -X POST "http://localhost:3000/api/shares/upload-api" \
  -H "Authorization: Bearer <YOUR_API_KEY>" \
  -F "file=@/path/to/my-file.png"
```

Response:
```json
{
  "shareUrl": "http://localhost:3000/share/abc123xy"
}
```

---

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
