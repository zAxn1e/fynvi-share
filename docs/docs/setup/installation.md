---
id: installation
---

# Installation

### Installation with Docker (recommended)

1. Create a `docker-compose.yml` file:

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

2. Run `docker compose up -d`

The website will be available on `http://localhost:3000`.

### Installation with Portainer

1. In the **Stacks** menu, click the **Add stack** button.
2. Give your stack a name (e.g. `fynvi-share`).
3. In the web editor, paste the contents of `docker-compose.yml`.
4. Adjust external ports or environment variables if needed.
5. Click **Deploy the stack**.

Your container will be listening on `http://localhost:<port>`.

### Stand-alone Installation

Prerequisites:
- [Bun](https://bun.sh/) >= 1.3 (recommended) or [Node.js](https://nodejs.org/) >= 20
- [Git](https://git-scm.com/downloads)
- [pm2](https://pm2.keymetrics.io/) (optional, for background service management)

```bash
git clone https://github.com/zAxn1e/fynvi-share.git
cd fynvi-share

# Start the backend
cd backend
bun install
bun run db:push
bun run db:seed
bun run build
pm2 start bun --name="fynvi-share-backend" -- run prod

# Start the frontend
cd ../frontend
bun install
bun run build
API_URL=http://localhost:8080 pm2 start bun --name "fynvi-share-frontend" -- run start
```
