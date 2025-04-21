#!/bin/bash
# Display system status information

set -e

echo "==============================================="
echo "  Power Plant Operations Management System"
echo "  System Status Report"
echo "==============================================="
echo

# Check database connection
echo "Database Connection:"
if PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT 1" > /dev/null 2>&1; then
    echo "  [✓] Connected to PostgreSQL database"
else
    echo "  [✗] Cannot connect to PostgreSQL database"
fi

# Check disk space
echo
echo "Disk Space:"
df -h /app | awk 'NR>1 {print "  Total: " $2 ", Used: " $3 " (" $5 "), Available: " $4}'

# Check uploads directory
echo
echo "Uploads Directory:"
du -sh /app/uploads | awk '{print "  Size: " $1}'
echo "  Files: $(find /app/uploads -type f | wc -l)"

# Check backups
echo
echo "Database Backups:"
if [ -d "/app/backups" ]; then
    BACKUP_COUNT=$(find /app/backups -name "*.sql.gz" | wc -l)
    if [ $BACKUP_COUNT -gt 0 ]; then
        LATEST_BACKUP=$(ls -t /app/backups/*.sql.gz 2>/dev/null | head -1)
        LATEST_SIZE=$(du -h "$LATEST_BACKUP" 2>/dev/null | cut -f1)
        LATEST_DATE=$(date -r "$LATEST_BACKUP" "+%Y-%m-%d %H:%M:%S" 2>/dev/null)
        echo "  Total backups: $BACKUP_COUNT"
        echo "  Latest backup: $(basename "$LATEST_BACKUP") ($LATEST_SIZE) - $LATEST_DATE"
    else
        echo "  No backups found"
    fi
else
    echo "  Backup directory not found"
fi

# System memory
echo
echo "Memory Usage:"
free -h | grep "Mem:" | awk '{print "  Total: " $2 ", Used: " $3 ", Free: " $4}'

echo
echo "==============================================="
echo