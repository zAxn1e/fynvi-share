#!/bin/sh
# Fynvi Share Docker Helper Script

ACTION=${1:-rebuild}
COMPOSE_FILE=${2:-docker-compose.local.yml}

case "$ACTION" in
  rebuild)
    echo "==> Rebuilding and restarting Fynvi Share using $COMPOSE_FILE..."
    docker compose -f "$COMPOSE_FILE" down
    docker compose -f "$COMPOSE_FILE" up -d --build
    echo "==> Fynvi Share is running at http://localhost:3000"
    docker compose -f "$COMPOSE_FILE" logs -f
    ;;
  up)
    echo "==> Starting Fynvi Share using $COMPOSE_FILE..."
    docker compose -f "$COMPOSE_FILE" up -d
    echo "==> Fynvi Share is running at http://localhost:3000"
    ;;
  build)
    echo "==> Building Fynvi Share image using $COMPOSE_FILE..."
    docker compose -f "$COMPOSE_FILE" build
    ;;
  down)
    echo "==> Stopping Fynvi Share using $COMPOSE_FILE..."
    docker compose -f "$COMPOSE_FILE" down
    ;;
  restart)
    echo "==> Restarting Fynvi Share container using $COMPOSE_FILE..."
    docker compose -f "$COMPOSE_FILE" restart
    ;;
  logs)
    docker compose -f "$COMPOSE_FILE" logs -f
    ;;
  *)
    echo "Usage: ./dev.sh [rebuild|up|build|down|restart|logs] [docker-compose.local.yml|docker-compose.yml]"
    ;;
esac
