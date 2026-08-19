# If we aren't running as root, just exec the CMD
[ "$(id -u)" -ne 0 ] && exec "$@"

echo "Creating user and group..."

PUID=${PUID:-1000}
PGID=${PGID:-1000}

# Check if the group with PGID exists; if not, create it
if ! getent group "$PGID" > /dev/null 2>&1 && ! getent group fynvi-share-group > /dev/null 2>&1 && ! getent group pingvin-share-group > /dev/null 2>&1; then
    if command -v groupadd > /dev/null 2>&1; then
        groupadd -g "$PGID" fynvi-share-group 2>/dev/null || true
    else
        addgroup -g "$PGID" fynvi-share-group 2>/dev/null || true
    fi
fi

# Check if a user with PUID exists; if not, create it
if ! getent passwd "$PUID" > /dev/null 2>&1 && ! id -u fynvi-share > /dev/null 2>&1 && ! id -u pingvin-share > /dev/null 2>&1; then
    GROUP_NAME=$(getent group "$PGID" | cut -d: -f1)
    GROUP_NAME=${GROUP_NAME:-fynvi-share-group}
    if command -v useradd > /dev/null 2>&1; then
        useradd -u "$PUID" -g "$GROUP_NAME" -m -s /bin/sh fynvi-share > /dev/null 2>&1 || true
    else
        adduser -u "$PUID" -G "$GROUP_NAME" -D fynvi-share > /dev/null 2>&1 || true
    fi
fi

# Change ownership of the data directory
mkdir -p /opt/app/backend/data
find /opt/app/backend/data \( ! -group "${PGID}" -o ! -user "${PUID}" \) -exec chown "${PUID}:${PGID}" {} +
# Change ownership of the frontend public directory
find /opt/app/frontend/public \( ! -group "${PGID}" -o ! -user "${PUID}" \) -exec chown "${PUID}:${PGID}" {} +
# Change ownership of .prisma client directory if it exists
mkdir -p /opt/app/backend/node_modules/.prisma
find /opt/app/backend/node_modules/.prisma \( ! -group "${PGID}" -o ! -user "${PUID}" \) -exec chown "${PUID}:${PGID}" {} + 2>/dev/null || true

# Switch to the non-root user
if command -v gosu > /dev/null 2>&1; then
    exec gosu "$PUID:$PGID" "$@"
else
    exec su-exec "$PUID:$PGID" "$@"
fi