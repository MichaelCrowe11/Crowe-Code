#!/bin/bash

# ========================================
# GCP Deployment Script for Crowe Logic Platform
# Complete setup with Vertex AI Model Garden
# ========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-crowe-logic-platform}"
REGION="${GCP_REGION:-us-central1}"
ZONE="${GCP_ZONE:-us-central1-a}"
APP_NAME="crowe-logic-platform"
DB_INSTANCE_NAME="${APP_NAME}-db"
REDIS_INSTANCE_NAME="${APP_NAME}-redis"
SERVICE_ACCOUNT_NAME="vertex-ai-sa"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check gcloud
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI not found. Please install it from: https://cloud.google.com/sdk/install"
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker not found. Please install Docker."
    fi
    
    # Check if logged in to gcloud
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
        print_warning "Not logged in to gcloud. Running login..."
        gcloud auth login
    fi
    
    print_success "Prerequisites check passed"
}

# Create or set project
setup_project() {
    print_status "Setting up GCP project..."
    
    # Check if project exists
    if gcloud projects describe $PROJECT_ID &> /dev/null; then
        print_status "Project $PROJECT_ID exists"
    else
        print_status "Creating new project $PROJECT_ID..."
        gcloud projects create $PROJECT_ID --name="Crowe Logic Platform"
    fi
    
    # Set as active project
    gcloud config set project $PROJECT_ID
    
    print_success "Project configured: $PROJECT_ID"
}

# Enable required APIs
enable_apis() {
    print_status "Enabling required Google Cloud APIs..."
    
    APIS=(
        "aiplatform.googleapis.com"
        "cloudbuild.googleapis.com"
        "run.googleapis.com"
        "sqladmin.googleapis.com"
        "redis.googleapis.com"
        "secretmanager.googleapis.com"
        "compute.googleapis.com"
        "containerregistry.googleapis.com"
        "cloudresourcemanager.googleapis.com"
        "speech.googleapis.com"
        "texttospeech.googleapis.com"
        "translate.googleapis.com"
    )
    
    for api in "${APIS[@]}"; do
        print_status "Enabling $api..."
        gcloud services enable $api --quiet
    done
    
    print_success "All APIs enabled"
}

# Create service account for Vertex AI
create_service_account() {
    print_status "Creating service account for Vertex AI..."
    
    # Check if service account exists
    if gcloud iam service-accounts describe ${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com &> /dev/null; then
        print_warning "Service account already exists"
    else
        gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
            --display-name="Vertex AI Service Account" \
            --description="Service account for Vertex AI operations"
    fi
    
    # Grant necessary roles
    ROLES=(
        "roles/aiplatform.user"
        "roles/aiplatform.admin"
        "roles/ml.developer"
        "roles/cloudsql.client"
        "roles/redis.editor"
        "roles/secretmanager.secretAccessor"
        "roles/storage.objectAdmin"
    )
    
    for role in "${ROLES[@]}"; do
        print_status "Granting $role..."
        gcloud projects add-iam-policy-binding $PROJECT_ID \
            --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
            --role="$role" \
            --quiet
    done
    
    # Create and download service account key
    KEY_FILE="vertex-ai-key.json"
    if [ ! -f "$KEY_FILE" ]; then
        print_status "Creating service account key..."
        gcloud iam service-accounts keys create $KEY_FILE \
            --iam-account=${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com
    fi
    
    print_success "Service account created and configured"
}

# Create Cloud SQL instance
create_cloud_sql() {
    print_status "Setting up Cloud SQL (PostgreSQL)..."
    
    # Check if instance exists
    if gcloud sql instances describe $DB_INSTANCE_NAME &> /dev/null; then
        print_warning "Cloud SQL instance already exists"
    else
        print_status "Creating Cloud SQL instance (this may take several minutes)..."
        gcloud sql instances create $DB_INSTANCE_NAME \
            --database-version=POSTGRES_15 \
            --tier=db-g1-small \
            --region=$REGION \
            --network=default \
            --backup \
            --backup-start-time=02:00 \
            --maintenance-window-day=SUN \
            --maintenance-window-hour=03 \
            --database-flags=max_connections=100 \
            --quiet
    fi
    
    # Create database
    if ! gcloud sql databases describe crowe_platform --instance=$DB_INSTANCE_NAME &> /dev/null; then
        print_status "Creating database..."
        gcloud sql databases create crowe_platform --instance=$DB_INSTANCE_NAME
    fi
    
    # Generate secure password
    DB_PASSWORD=$(openssl rand -base64 32)
    
    # Create user
    print_status "Creating database user..."
    gcloud sql users create crowe_admin \
        --instance=$DB_INSTANCE_NAME \
        --password=$DB_PASSWORD \
        --quiet || true
    
    # Store password in Secret Manager
    echo -n "$DB_PASSWORD" | gcloud secrets create db-password --data-file=- &> /dev/null || \
        echo -n "$DB_PASSWORD" | gcloud secrets versions add db-password --data-file=-
    
    print_success "Cloud SQL configured"
}

# Create Redis instance
create_redis() {
    print_status "Setting up Cloud Memorystore (Redis)..."
    
    # Check if instance exists
    if gcloud redis instances describe $REDIS_INSTANCE_NAME --region=$REGION &> /dev/null; then
        print_warning "Redis instance already exists"
    else
        print_status "Creating Redis instance (this may take several minutes)..."
        gcloud redis instances create $REDIS_INSTANCE_NAME \
            --size=1 \
            --region=$REGION \
            --redis-version=redis_7_0 \
            --quiet
    fi
    
    # Get Redis host
    REDIS_HOST=$(gcloud redis instances describe $REDIS_INSTANCE_NAME \
        --region=$REGION \
        --format="value(host)")
    
    print_success "Redis configured at $REDIS_HOST"
}

# Create secrets
create_secrets() {
    print_status "Creating application secrets..."
    
    # JWT Secret
    JWT_SECRET=$(openssl rand -base64 64)
    echo -n "$JWT_SECRET" | gcloud secrets create jwt-secret --data-file=- &> /dev/null || \
        echo -n "$JWT_SECRET" | gcloud secrets versions add jwt-secret --data-file=-
    
    # NextAuth Secret
    NEXTAUTH_SECRET=$(openssl rand -base64 64)
    echo -n "$NEXTAUTH_SECRET" | gcloud secrets create nextauth-secret --data-file=- &> /dev/null || \
        echo -n "$NEXTAUTH_SECRET" | gcloud secrets versions add nextauth-secret --data-file=-
    
    # Vertex AI Credentials
    if [ -f "vertex-ai-key.json" ]; then
        gcloud secrets create vertex-ai-credentials --data-file=vertex-ai-key.json &> /dev/null || \
            gcloud secrets versions add vertex-ai-credentials --data-file=vertex-ai-key.json
    fi
    
    print_success "Secrets configured"
}

# Build and push Docker image
build_and_push_image() {
    print_status "Building and pushing Docker image..."
    
    IMAGE_URL="gcr.io/$PROJECT_ID/$APP_NAME:latest"
    
    # Configure Docker for GCR
    gcloud auth configure-docker --quiet
    
    # Build image
    print_status "Building Docker image..."
    docker build -t $IMAGE_URL .
    
    # Push to Container Registry
    print_status "Pushing to Container Registry..."
    docker push $IMAGE_URL
    
    print_success "Image pushed to $IMAGE_URL"
}

# Deploy to Cloud Run
deploy_cloud_run() {
    print_status "Deploying to Cloud Run..."
    
    # Get Cloud SQL connection name
    INSTANCE_CONNECTION_NAME="$PROJECT_ID:$REGION:$DB_INSTANCE_NAME"
    
    # Deploy
    gcloud run deploy $APP_NAME \
        --image=gcr.io/$PROJECT_ID/$APP_NAME:latest \
        --platform=managed \
        --region=$REGION \
        --allow-unauthenticated \
        --add-cloudsql-instances=$INSTANCE_CONNECTION_NAME \
        --set-env-vars="NODE_ENV=production" \
        --set-env-vars="GCP_PROJECT_ID=$PROJECT_ID" \
        --set-env-vars="GCP_LOCATION=$REGION" \
        --set-env-vars="DATABASE_URL=postgresql://crowe_admin:PASSWORD@localhost/crowe_platform?host=/cloudsql/$INSTANCE_CONNECTION_NAME" \
        --set-env-vars="REDIS_URL=redis://$REDIS_HOST:6379" \
        --set-secrets="JWT_SECRET=jwt-secret:latest" \
        --set-secrets="NEXTAUTH_SECRET=nextauth-secret:latest" \
        --set-secrets="DB_PASSWORD=db-password:latest" \
        --set-secrets="/secrets/vertex-ai-key.json=vertex-ai-credentials:latest" \
        --set-env-vars="GOOGLE_APPLICATION_CREDENTIALS=/secrets/vertex-ai-key.json" \
        --memory=2Gi \
        --cpu=2 \
        --min-instances=1 \
        --max-instances=100 \
        --timeout=300 \
        --concurrency=1000 \
        --quiet
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe $APP_NAME \
        --platform=managed \
        --region=$REGION \
        --format="value(status.url)")
    
    print_success "Deployed to Cloud Run: $SERVICE_URL"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Use Cloud Build to run migrations
    cat > /tmp/migrate.yaml <<EOF
steps:
  - name: 'gcr.io/$PROJECT_ID/$APP_NAME:latest'
    entrypoint: 'npx'
    args: ['prisma', 'migrate', 'deploy']
    env:
      - 'DATABASE_URL=postgresql://crowe_admin:\${_DB_PASSWORD}@localhost/crowe_platform?host=/cloudsql/$PROJECT_ID:$REGION:$DB_INSTANCE_NAME'
    secretEnv: ['_DB_PASSWORD']

availableSecrets:
  secretManager:
    - versionName: projects/$PROJECT_ID/secrets/db-password/versions/latest
      env: '_DB_PASSWORD'
EOF
    
    gcloud builds submit --config=/tmp/migrate.yaml --no-source --quiet
    
    print_success "Database migrations completed"
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring and alerts..."
    
    # Create uptime check
    gcloud monitoring uptime-checks create https crowe-health-check \
        --display-name="Crowe Platform Health Check" \
        --uri="$SERVICE_URL/api/health" \
        --quiet || true
    
    print_success "Monitoring configured"
}

# Main deployment flow
main() {
    echo "=========================================="
    echo "🚀 Crowe Logic Platform - GCP Deployment"
    echo "=========================================="
    echo ""
    echo "Project ID: $PROJECT_ID"
    echo "Region: $REGION"
    echo ""
    
    check_prerequisites
    setup_project
    enable_apis
    create_service_account
    create_cloud_sql
    create_redis
    create_secrets
    build_and_push_image
    deploy_cloud_run
    run_migrations
    setup_monitoring
    
    echo ""
    echo "=========================================="
    echo "✅ DEPLOYMENT COMPLETE!"
    echo "=========================================="
    echo ""
    echo "🌐 Application URL: $SERVICE_URL"
    echo "📊 GCP Console: https://console.cloud.google.com/home/dashboard?project=$PROJECT_ID"
    echo "🤖 Vertex AI: https://console.cloud.google.com/vertex-ai?project=$PROJECT_ID"
    echo ""
    echo "Next steps:"
    echo "1. Test the application at $SERVICE_URL"
    echo "2. Configure custom domain (optional)"
    echo "3. Set up CI/CD pipeline"
    echo "4. Configure additional Vertex AI models in Model Garden"
    echo ""
    print_success "Deployment successful! 🎉"
}

# Run main function
main
