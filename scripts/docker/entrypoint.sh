#!/bin/sh

# Copy default logo to the frontend public folder if it doesn't exist
cp -rn /tmp/img/* /opt/app/frontend/public/img

if [ "$CADDY_DISABLED" != "true" ]; then
  # Start Caddy
  echo "Starting Caddy..."
  if [ "$TRUST_PROXY" = "true" ]; then
    caddy start --adapter caddyfile --config /opt/app/reverse-proxy/Caddyfile.trust-proxy &
  else
    caddy start --adapter caddyfile --config /opt/app/reverse-proxy/Caddyfile &
  fi
else
  echo "Caddy is disabled. Skipping..."
fi

# Run the frontend server
PORT=3333 HOSTNAME=0.0.0.0 bun frontend/server.js &

# Run the backend server
cd backend
export NODE_PATH=/opt/app/backend/dist:/opt/app/backend:$NODE_PATH
export DATABASE_URL="$(bun dist/src/scripts/resolve-database-url.js)"
bunx prisma migrate resolve --applied 20260818000000_fynvi_share 2>/dev/null || true
bunx prisma migrate resolve --rolled-back 20260818000000_fynvi_share 2>/dev/null || true
bunx prisma db push --accept-data-loss --skip-generate
bun dist/prisma/seed/config.seed.js || bun prisma/seed/config.seed.ts
bun dist/src/main.js

# Wait for all processes to finish
wait
