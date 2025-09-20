#!/bin/bash

# ========================================
# GCP Deployment Configuration
# Project: dulcet-nucleus-450804-a3
# ========================================

# Your specific GCP project configuration
export GCP_PROJECT_ID="dulcet-nucleus-450804-a3"
export GCP_REGION="us-central1"
export GCP_ZONE="us-central1-a"

# Application naming
export APP_NAME="crowe-logic-platform"
export DB_INSTANCE_NAME="${APP_NAME}-db"
export REDIS_INSTANCE_NAME="${APP_NAME}-redis"
export SERVICE_ACCOUNT_NAME="vertex-ai-sa"

# Cloud SQL configuration
export DB_NAME="crowe_platform"
export DB_USER="crowe_admin"
export DB_TIER="db-g1-small"  # For production, use db-n1-standard-2

# Redis configuration
export REDIS_SIZE_GB="1"
export REDIS_VERSION="redis_7_0"

# Cloud Run configuration
export CLOUD_RUN_MEMORY="2Gi"
export CLOUD_RUN_CPU="2"
export CLOUD_RUN_MIN_INSTANCES="1"
export CLOUD_RUN_MAX_INSTANCES="100"
export CLOUD_RUN_CONCURRENCY="1000"

# Container Registry
export IMAGE_URL="gcr.io/${GCP_PROJECT_ID}/${APP_NAME}"

# Cloud SQL connection name
export INSTANCE_CONNECTION_NAME="${GCP_PROJECT_ID}:${GCP_REGION}:${DB_INSTANCE_NAME}"

# Service URLs (will be updated after deployment)
export CLOUD_RUN_URL="https://${APP_NAME}-uc.a.run.app"

echo "Configuration loaded for project: ${GCP_PROJECT_ID}"
