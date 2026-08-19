---
id: upgrading
---

# Upgrading

### Docker Upgrade

To update your container to the newest release:

```bash
docker compose pull
docker compose up -d
```

### Stand-alone Upgrade

```bash
cd fynvi-share
git pull origin main

# Update backend
cd backend
bun install
bun run db:push
bun run build
pm2 restart fynvi-share-backend

# Update frontend
cd ../frontend
bun install
bun run build
pm2 restart fynvi-share-frontend
```
