#!/bin/bash

# ========================================
# Quick Deployment Script for dulcet-nucleus-450804-a3
# ========================================

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Your specific project configuration
PROJECT_ID="dulcet-nucleus-450804-a3"
REGION="us-central1"
APP_NAME="crowe-logic-platform"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 Deploying to GCP Project: ${PROJECT_ID}${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Set project
echo -e "${GREEN}Step 1: Setting GCP project...${NC}"
gcloud config set project ${PROJECT_ID}

# Step 2: Enable required APIs
echo -e "${GREEN}Step 2: Enabling required APIs...${NC}"
gcloud services enable \
  aiplatform.googleapis.com \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  redis.googleapis.com \
  secretmanager.googleapis.com \
  compute.googleapis.com \
  containerregistry.googleapis.com \
  speech.googleapis.com \
  texttospeech.googleapis.com \
  translate.googleapis.com \
  --quiet

echo -e "${GREEN}✓ APIs enabled${NC}"

# Step 3: Create service account for Vertex AI
echo -e "${GREEN}Step 3: Creating Vertex AI service account...${NC}"
if ! gcloud iam service-accounts describe vertex-ai-sa@${PROJECT_ID}.iam.gserviceaccount.com &> /dev/null; then
  gcloud iam service-accounts create vertex-ai-sa \
    --display-name="Vertex AI Service Account" \
    --quiet
fi

# Grant necessary roles
for role in \
  "roles/aiplatform.user" \
  "roles/aiplatform.admin" \
  "roles/cloudsql.client" \
  "roles/secretmanager.secretAccessor"
do
  gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:vertex-ai-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="${role}" \
    --quiet
done

echo -e "${GREEN}✓ Service account configured${NC}"

# Step 4: Create service account key
echo -e "${GREEN}Step 4: Creating service account key...${NC}"
if [ ! -f "vertex-ai-key.json" ]; then
  gcloud iam service-accounts keys create vertex-ai-key.json \
    --iam-account=vertex-ai-sa@${PROJECT_ID}.iam.gserviceaccount.com \
    --quiet
  echo -e "${GREEN}✓ Key created: vertex-ai-key.json${NC}"
else
  echo -e "${YELLOW}Key already exists: vertex-ai-key.json${NC}"
fi

# Step 5: Build and deploy using Cloud Build
echo -e "${GREEN}Step 5: Building and deploying application...${NC}"
echo -e "${BLUE}This will:${NC}"
echo "  - Build Docker image"
echo "  - Set up Cloud SQL database"
echo "  - Configure Redis cache"
echo "  - Deploy to Cloud Run"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Option 1: Use Cloud Build
  if [ -f "gcp-deploy/cloudbuild.yaml" ]; then
    echo -e "${GREEN}Using Cloud Build...${NC}"
    gcloud builds submit \
      --config=gcp-deploy/cloudbuild.yaml \
      --substitutions=_REGION=${REGION}
  else
    # Option 2: Direct deployment
    echo -e "${GREEN}Using direct deployment...${NC}"
    
    # Build and push image
    IMAGE="gcr.io/${PROJECT_ID}/${APP_NAME}:latest"
    gcloud builds submit --tag ${IMAGE} .
    
    # Deploy to Cloud Run
    gcloud run deploy ${APP_NAME} \
      --image=${IMAGE} \
      --platform=managed \
      --region=${REGION} \
      --allow-unauthenticated \
      --set-env-vars="GCP_PROJECT_ID=${PROJECT_ID}" \
      --set-env-vars="GCP_LOCATION=${REGION}" \
      --memory=2Gi \
      --cpu=2 \
      --min-instances=1 \
      --max-instances=100 \
      --quiet
  fi
  
  # Get service URL
  SERVICE_URL=$(gcloud run services describe ${APP_NAME} \
    --platform=managed \
    --region=${REGION} \
    --format="value(status.url)")
  
  echo ""
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo ""
  echo -e "${BLUE}📱 Application URL:${NC} ${SERVICE_URL}"
  echo -e "${BLUE}🔧 GCP Console:${NC} https://console.cloud.google.com/home/dashboard?project=${PROJECT_ID}"
  echo -e "${BLUE}🤖 Vertex AI:${NC} https://console.cloud.google.com/vertex-ai?project=${PROJECT_ID}"
  echo -e "${BLUE}☁️ Cloud Run:${NC} https://console.cloud.google.com/run?project=${PROJECT_ID}"
  echo ""
  echo -e "${YELLOW}Next steps:${NC}"
  echo "1. Set up Cloud SQL database (if not done):"
  echo "   gcloud sql instances create crowe-db --database-version=POSTGRES_15 --tier=db-g1-small --region=${REGION}"
  echo ""
  echo "2. Set up Redis (if not done):"
  echo "   gcloud redis instances create crowe-redis --size=1 --region=${REGION}"
  echo ""
  echo "3. Configure secrets in Secret Manager"
  echo "4. Set up custom domain (optional)"
else
  echo -e "${YELLOW}Deployment cancelled${NC}"
fi
