#!/bin/bash
set -e

echo "============================================================"
echo "Power Plant Operations Management System Docker Development"
echo "============================================================"

# Function to display help
function display_help() {
  echo "Usage: ./scripts/run-docker-dev.sh [command]"
  echo ""
  echo "Commands:"
  echo "  start        Start Docker development environment"
  echo "  stop         Stop Docker development environment"
  echo "  restart      Restart Docker development environment"
  echo "  build        Rebuild Docker development images"
  echo "  logs         Show logs from Docker services"
  echo "  status       Check status of Docker services"
  echo "  psql         Open PostgreSQL shell"
  echo "  backup       Create database backup"
  echo "  restore      Restore database from backup"
  echo "  help         Display this help message"
  echo ""
  echo "Example: ./scripts/run-docker-dev.sh start"
}

# Function to check if Docker is installed
function check_docker() {
  if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not in PATH"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
  fi
  
  if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose is not installed or not in PATH"
    echo "Please install docker-compose from https://docs.docker.com/compose/install/"
    exit 1
  fi
}

# Start Docker services
function start_services() {
  echo "Starting Docker development environment..."
  docker-compose -f docker-compose.dev.yml up -d
  
  echo "Waiting for services to initialize..."
  sleep 5
  
  echo "Development environment is running!"
  echo "Access the application at: http://localhost:5000"
  echo ""
  echo "Use './scripts/run-docker-dev.sh logs' to see logs"
}

# Stop Docker services
function stop_services() {
  echo "Stopping Docker development environment..."
  docker-compose -f docker-compose.dev.yml down
  echo "Development environment stopped."
}

# Restart Docker services
function restart_services() {
  echo "Restarting Docker development environment..."
  docker-compose -f docker-compose.dev.yml restart
  echo "Development environment restarted."
}

# Rebuild Docker images
function build_images() {
  echo "Building Docker development images..."
  docker-compose -f docker-compose.dev.yml build
  echo "Docker images rebuilt."
}

# Show logs
function show_logs() {
  echo "Showing logs (press Ctrl+C to exit)..."
  docker-compose -f docker-compose.dev.yml logs -f
}

# Check status of services
function check_status() {
  echo "Checking Docker services status..."
  docker-compose -f docker-compose.dev.yml ps
}

# Open PostgreSQL shell
function open_psql() {
  echo "Opening PostgreSQL shell..."
  docker-compose -f docker-compose.dev.yml exec postgres psql -U root -d powerplantapp
}

# Create database backup
function create_backup() {
  BACKUP_FILE="powerplantapp_$(date +%Y%m%d_%H%M%S).sql"
  echo "Creating database backup to backups/$BACKUP_FILE..."
  mkdir -p backups
  docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U root -d powerplantapp > "backups/$BACKUP_FILE"
  echo "Backup created: backups/$BACKUP_FILE"
}

# Restore database from backup
function restore_backup() {
  # List available backups
  echo "Available backups:"
  ls -la backups/*.sql 2>/dev/null || echo "No backups found."
  
  # Ask for backup file
  echo ""
  echo "Enter backup file name from backups/ directory:"
  read BACKUP_FILE
  
  if [ ! -f "backups/$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: backups/$BACKUP_FILE"
    exit 1
  fi
  
  echo "Restoring database from backups/$BACKUP_FILE..."
  cat "backups/$BACKUP_FILE" | docker-compose -f docker-compose.dev.yml exec -T postgres psql -U root -d powerplantapp
  echo "Database restored."
}

# Check if Docker is installed
check_docker

# Process command line arguments
if [ $# -eq 0 ]; then
  display_help
  exit 0
fi

case "$1" in
  start)
    start_services
    ;;
  stop)
    stop_services
    ;;
  restart)
    restart_services
    ;;
  build)
    build_images
    ;;
  logs)
    show_logs
    ;;
  status)
    check_status
    ;;
  psql)
    open_psql
    ;;
  backup)
    create_backup
    ;;
  restore)
    restore_backup
    ;;
  help)
    display_help
    ;;
  *)
    echo "Unknown command: $1"
    display_help
    exit 1
    ;;
esac

exit 0