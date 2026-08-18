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
npm install
npm run db:push
npm run build
pm2 restart fynvi-share-backend

# Update frontend
cd ../frontend
npm install
npm run build
pm2 restart fynvi-share-frontend
```
