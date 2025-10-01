#!/usr/bin/env bash
#
# SPDX-License-Identifier: GPL-3.0-or-later
#
# Docker Development Helper Script
# Manages the Matrix Academy development environment with Docker Compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Docker Compose files
COMPOSE_FILES="-f docker-compose.yml -f docker-compose.dev.yml"

# Change to project root
cd "$PROJECT_ROOT"

# Helper functions
info() {
    echo -e "${GREEN}✓${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if .env file exists
check_env() {
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        warn ".env file not found. Creating from .env.example..."
        if [ -f "$PROJECT_ROOT/apps/backend/.env.example" ]; then
            cp "$PROJECT_ROOT/apps/backend/.env.example" "$PROJECT_ROOT/.env"
            warn "Please update .env with your local configuration"
            warn "Especially ensure JWT secrets are at least 32 characters long"
        else
            error "No .env.example found. Please create .env manually."
            exit 1
        fi
    fi
}

# Show usage
usage() {
    cat << EOF
Usage: $0 [command]

Commands:
    up          Start all services in development mode
    down        Stop all services
    restart     Restart all services
    logs        Follow logs from all services
    logs-be     Follow backend logs only
    logs-db     Follow database logs only
    ps          Show running containers
    shell-be    Open a shell in the backend container
    shell-db    Open a psql shell in the database
    rebuild     Rebuild all containers
    clean       Stop and remove all containers, networks, and volumes
    help        Show this help message

Examples:
    $0 up              # Start development environment
    $0 logs-be         # Watch backend logs
    $0 shell-db        # Connect to PostgreSQL
    $0 clean           # Clean everything and start fresh

EOF
}

# Main commands
cmd_up() {
    check_env
    info "Starting development environment..."
    docker compose $COMPOSE_FILES up -d
    info "Services started. Use '$0 logs' to view logs."
    info "Backend: http://localhost:3000"
    info "Database: localhost:5432"
    info "Redis: localhost:6379"
}

cmd_down() {
    info "Stopping all services..."
    docker compose $COMPOSE_FILES down
    info "Services stopped."
}

cmd_restart() {
    info "Restarting all services..."
    docker compose $COMPOSE_FILES restart
    info "Services restarted."
}

cmd_logs() {
    docker compose $COMPOSE_FILES logs -f
}

cmd_logs_backend() {
    docker compose $COMPOSE_FILES logs -f backend
}

cmd_logs_db() {
    docker compose $COMPOSE_FILES logs -f postgres
}

cmd_ps() {
    docker compose $COMPOSE_FILES ps
}

cmd_shell_backend() {
    info "Opening shell in backend container..."
    docker compose $COMPOSE_FILES exec backend sh
}

cmd_shell_db() {
    info "Opening PostgreSQL shell..."
    docker compose $COMPOSE_FILES exec postgres psql -U matrix_user -d matrix_academy
}

cmd_rebuild() {
    info "Rebuilding all containers..."
    docker compose $COMPOSE_FILES build --no-cache
    info "Rebuild complete. Use '$0 up' to start."
}

cmd_clean() {
    warn "This will remove all containers, networks, and volumes."
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        info "Cleaning up..."
        docker compose $COMPOSE_FILES down -v
        info "Cleanup complete."
    else
        info "Cleanup cancelled."
    fi
}

# Route to command
case "${1:-}" in
    up)
        cmd_up
        ;;
    down)
        cmd_down
        ;;
    restart)
        cmd_restart
        ;;
    logs)
        cmd_logs
        ;;
    logs-be)
        cmd_logs_backend
        ;;
    logs-db)
        cmd_logs_db
        ;;
    ps)
        cmd_ps
        ;;
    shell-be)
        cmd_shell_backend
        ;;
    shell-db)
        cmd_shell_db
        ;;
    rebuild)
        cmd_rebuild
        ;;
    clean)
        cmd_clean
        ;;
    help|--help|-h)
        usage
        ;;
    *)
        error "Unknown command: ${1:-}"
        echo
        usage
        exit 1
        ;;
esac
