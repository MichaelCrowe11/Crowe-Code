#!/bin/bash

# Crowe Logic Platform - Database Backup Script
# Runs daily via cron to backup PostgreSQL database to S3

set -e

# Load environment variables
source /opt/crowe-platform/.env.production

# Configuration
BACKUP_DIR="/tmp/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="crowe_platform"
BACKUP_FILE="backup_${DB_NAME}_${TIMESTAMP}.sql.gz"
S3_BUCKET="${BACKUP_S3_BUCKET:-crowe-backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# Slack notification function
notify_slack() {
    local status=$1
    local message=$2
    
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST "$SLACK_WEBHOOK_URL" \
            -H 'Content-Type: application/json' \
            -d "{
                \"text\": \"Database Backup ${status}\",
                \"attachments\": [{
                    \"color\": \"${status,,}\",
                    \"fields\": [
                        {\"title\": \"Database\", \"value\": \"${DB_NAME}\", \"short\": true},
                        {\"title\": \"Timestamp\", \"value\": \"${TIMESTAMP}\", \"short\": true},
                        {\"title\": \"Message\", \"value\": \"${message}\", \"short\": false}
                    ]
                }]
            }"
    fi
}

# Error handler
handle_error() {
    echo "Error occurred during backup: $1"
    notify_slack "danger" "Backup failed: $1"
    exit 1
}

trap 'handle_error "Unexpected error"' ERR

echo "Starting database backup at $(date)"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Perform database backup
echo "Backing up database..."
PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "${DB_HOST:-localhost}" \
    -p "${DB_PORT:-5432}" \
    -U "${DB_USER:-crowe}" \
    -d "$DB_NAME" \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    | gzip > "$BACKUP_DIR/$BACKUP_FILE" || handle_error "Database dump failed"

# Check backup size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
echo "Backup completed: $BACKUP_FILE (Size: $BACKUP_SIZE)"

# Upload to S3
if command -v aws &> /dev/null; then
    echo "Uploading to S3..."
    aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" "s3://$S3_BUCKET/postgres/$BACKUP_FILE" \
        --storage-class STANDARD_IA \
        --metadata "timestamp=$TIMESTAMP,database=$DB_NAME" || handle_error "S3 upload failed"
    
    echo "Backup uploaded to S3"
    
    # Clean up old backups in S3
    echo "Cleaning up old backups..."
    CUTOFF_DATE=$(date -d "$RETENTION_DAYS days ago" +%Y%m%d)
    
    aws s3 ls "s3://$S3_BUCKET/postgres/" | while read -r line; do
        FILE=$(echo "$line" | awk '{print $4}')
        FILE_DATE=$(echo "$FILE" | grep -oP '\d{8}' | head -1)
        
        if [[ -n "$FILE_DATE" && "$FILE_DATE" < "$CUTOFF_DATE" ]]; then
            echo "Deleting old backup: $FILE"
            aws s3 rm "s3://$S3_BUCKET/postgres/$FILE"
        fi
    done
else
    echo "AWS CLI not found, keeping local backup only"
fi

# Also backup to local directory with rotation
LOCAL_BACKUP_DIR="/var/backups/postgres"
mkdir -p "$LOCAL_BACKUP_DIR"
cp "$BACKUP_DIR/$BACKUP_FILE" "$LOCAL_BACKUP_DIR/"

# Rotate local backups (keep last 7 days)
find "$LOCAL_BACKUP_DIR" -name "backup_${DB_NAME}_*.sql.gz" -mtime +7 -delete

# Clean up temp directory
rm -f "$BACKUP_DIR/$BACKUP_FILE"

# Verify backup integrity
echo "Verifying backup integrity..."
if gunzip -t "$LOCAL_BACKUP_DIR/$BACKUP_FILE" 2>/dev/null; then
    echo "Backup integrity verified"
else
    handle_error "Backup integrity check failed"
fi

# Log backup metadata
cat >> /var/log/backups.log << EOF
$(date): Backup completed
File: $BACKUP_FILE
Size: $BACKUP_SIZE
Location: S3 and local
EOF

# Send success notification
notify_slack "good" "Backup completed successfully (Size: $BACKUP_SIZE)"

echo "Backup process completed successfully at $(date)"

# Optional: Test restore to verify backup
if [ "$TEST_RESTORE" = "true" ]; then
    echo "Testing backup restore..."
    TEST_DB="${DB_NAME}_restore_test"
    
    # Create test database
    PGPASSWORD="$DB_PASSWORD" createdb \
        -h "${DB_HOST:-localhost}" \
        -p "${DB_PORT:-5432}" \
        -U "${DB_USER:-crowe}" \
        "$TEST_DB"
    
    # Restore backup to test database
    gunzip -c "$LOCAL_BACKUP_DIR/$BACKUP_FILE" | \
    PGPASSWORD="$DB_PASSWORD" psql \
        -h "${DB_HOST:-localhost}" \
        -p "${DB_PORT:-5432}" \
        -U "${DB_USER:-crowe}" \
        -d "$TEST_DB" \
        -q
    
    # Drop test database
    PGPASSWORD="$DB_PASSWORD" dropdb \
        -h "${DB_HOST:-localhost}" \
        -p "${DB_PORT:-5432}" \
        -U "${DB_USER:-crowe}" \
        "$TEST_DB"
    
    echo "Restore test completed successfully"
fi
