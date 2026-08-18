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
PORT=3333 HOSTNAME=0.0.0.0 node frontend/server.js &

# Run the backend server
cd backend
export DATABASE_URL="$(node dist/src/scripts/resolve-database-url.js)"
./node_modules/.bin/prisma migrate resolve --applied 20260818000000_fynvi_share 2>/dev/null || true
./node_modules/.bin/prisma migrate resolve --rolled-back 20260818000000_fynvi_share 2>/dev/null || true
./node_modules/.bin/prisma migrate deploy 2>/dev/null || true
./node_modules/.bin/prisma db push --accept-data-loss
node dist/prisma/seed/config.seed.js
node dist/src/main

# Wait for all processes to finish
wait -n
