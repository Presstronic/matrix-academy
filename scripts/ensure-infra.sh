#!/usr/bin/env bash
#
# SPDX-License-Identifier: GPL-3.0-or-later
#
# Ensure Infrastructure Services Script
# Ensures Redis and PostgreSQL are running before starting local development

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT"

# Helper functions
info() {
    echo -e "${GREEN}✓${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if a container is running
is_container_running() {
    local container_name=$1
    docker ps --format '{{.Names}}' | grep -q "^${container_name}$"
}

# Check if a container is healthy
is_container_healthy() {
    local container_name=$1
    local health=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "none")
    [ "$health" = "healthy" ]
}

# Wait for container to be healthy
wait_for_health() {
    local container_name=$1
    local max_wait=30
    local waited=0

    echo -n "Waiting for $container_name to be healthy..."
    while ! is_container_healthy "$container_name"; do
        if [ $waited -ge $max_wait ]; then
            echo " timeout!"
            warn "$container_name did not become healthy in time"
            return 1
        fi
        echo -n "."
        sleep 1
        waited=$((waited + 1))
    done
    echo " ready!"
    return 0
}

# Main logic
info "Checking infrastructure services..."

# Check if PostgreSQL is running
if is_container_running "matrix-academy-postgres"; then
    info "PostgreSQL is already running"
else
    info "Starting PostgreSQL..."
    docker compose up -d postgres
    wait_for_health "matrix-academy-postgres"
fi

# Check if Redis is running
if is_container_running "matrix-academy-redis"; then
    info "Redis is already running"
else
    info "Starting Redis..."
    docker compose up -d redis
    wait_for_health "matrix-academy-redis"
fi

info "Infrastructure services are ready!"
info "PostgreSQL: localhost:5432"
info "Redis: localhost:6379"
