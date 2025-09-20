#!/bin/bash

# CroweCode Platform - Modal GPU Deployment Script
# Deploys to Modal with GPU acceleration for AI workloads

echo "========================================"
echo "  Modal GPU Deployment Script"
echo "========================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Modal CLI is installed
if ! command -v modal &> /dev/null; then
    echo -e "${RED}Modal CLI is not installed!${NC}"
    echo "Install it with: pip install modal"
    exit 1
fi

# Function to check Modal authentication
check_modal_auth() {
    if ! modal token whoami &> /dev/null; then
        echo -e "${YELLOW}Not authenticated with Modal${NC}"
        echo "Setting up Modal authentication..."
        modal token new
    else
        echo -e "${GREEN}✓ Modal authentication verified${NC}"
    fi
}

# Function to create Modal secrets
setup_modal_secrets() {
    echo -e "${YELLOW}Setting up Modal secrets...${NC}"

    # Database secrets
    modal secret create crowecode-database \
        DATABASE_URL="$DATABASE_URL" \
        DATABASE_URL_UNPOOLED="$DATABASE_URL_UNPOOLED"

    # Authentication secrets
    modal secret create crowecode-auth \
        NEXTAUTH_URL="https://crowecode-platform.modal.run" \
        NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
        GITHUB_CLIENT_ID="$GITHUB_CLIENT_ID" \
        GITHUB_CLIENT_SECRET="$GITHUB_CLIENT_SECRET" \
        GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
        GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET"

    # AI Provider secrets
    modal secret create crowecode-ai \
        XAI_API_KEY="$XAI_API_KEY" \
        ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
        OPENAI_API_KEY="$OPENAI_API_KEY" \
        GOOGLE_AI_API_KEY="$GOOGLE_AI_API_KEY" \
        GROQ_API_KEY="$GROQ_API_KEY"

    # Stripe secrets (if configured)
    if [ ! -z "$STRIPE_SECRET_KEY" ]; then
        modal secret create crowecode-stripe \
            STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" \
            STRIPE_PUBLISHABLE_KEY="$STRIPE_PUBLISHABLE_KEY" \
            STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET"
    fi

    echo -e "${GREEN}✓ Secrets configured${NC}"
}

# Function to deploy to Modal
deploy_to_modal() {
    echo -e "${YELLOW}Deploying to Modal with GPU support...${NC}"

    # Deploy the application
    modal deploy modal_app.py

    echo ""
    echo -e "${GREEN}✓ Deployment complete!${NC}"
    echo ""

    # Get deployment info
    echo "Deployment Information:"
    echo "======================="
    modal app list | grep crowecode-platform

    echo ""
    echo -e "${BLUE}Endpoints:${NC}"
    echo "  Web: https://crowecode-platform.modal.run"
    echo "  WebSocket: wss://crowecode-platform-ws.modal.run"
    echo "  API: https://api.modal.run/crowecode-platform"
    echo ""

    echo -e "${BLUE}GPU Configuration:${NC}"
    echo "  AI Processor: NVIDIA T4 GPU"
    echo "  Memory: 8GB"
    echo "  Timeout: 600 seconds"
    echo ""
}

# Function to run performance tests
test_gpu_performance() {
    echo -e "${YELLOW}Testing GPU performance...${NC}"

    # Create test script
    cat > test_modal_gpu.py << 'EOF'
import modal
import time

app = modal.App("crowecode-gpu-test")

@app.function(gpu="T4")
def test_gpu_performance():
    import torch

    # Check if GPU is available
    gpu_available = torch.cuda.is_available()
    gpu_name = torch.cuda.get_device_name(0) if gpu_available else "No GPU"

    # Run a simple benchmark
    if gpu_available:
        device = torch.device("cuda")

        # Create large tensors
        size = 10000
        a = torch.randn(size, size, device=device)
        b = torch.randn(size, size, device=device)

        # Measure matrix multiplication time
        start = time.time()
        c = torch.matmul(a, b)
        torch.cuda.synchronize()
        elapsed = time.time() - start

        return {
            "gpu_available": True,
            "gpu_name": gpu_name,
            "matrix_multiply_time": f"{elapsed:.3f} seconds",
            "performance": "Good" if elapsed < 1 else "Moderate"
        }
    else:
        return {
            "gpu_available": False,
            "gpu_name": "None",
            "error": "GPU not available"
        }

@app.local_entrypoint()
def main():
    result = test_gpu_performance.remote()
    print("GPU Performance Test Results:")
    print("=============================")
    for key, value in result.items():
        print(f"{key}: {value}")

EOF

    # Run the test
    modal run test_modal_gpu.py

    # Clean up
    rm test_modal_gpu.py
}

# Function to setup monitoring
setup_monitoring() {
    echo -e "${YELLOW}Setting up Modal monitoring...${NC}"

    # Create monitoring script
    cat > monitor_modal.py << 'EOF'
import modal

app = modal.App("crowecode-monitor")

@app.function(schedule=modal.Period(minutes=5))
def health_check():
    import requests

    endpoints = [
        "https://crowecode-platform.modal.run/api/health",
        "https://crowecode-platform-ws.modal.run/health"
    ]

    results = []
    for endpoint in endpoints:
        try:
            response = requests.get(endpoint, timeout=10)
            results.append({
                "endpoint": endpoint,
                "status": response.status_code,
                "healthy": response.status_code == 200
            })
        except Exception as e:
            results.append({
                "endpoint": endpoint,
                "status": "error",
                "error": str(e)
            })

    return results

EOF

    # Deploy monitoring
    modal deploy monitor_modal.py

    echo -e "${GREEN}✓ Monitoring configured${NC}"

    # Clean up
    rm monitor_modal.py
}

# Main execution
echo "Modal GPU Deployment Configuration"
echo "==================================="
echo ""

# Check authentication
check_modal_auth

# Display GPU options
echo ""
echo -e "${BLUE}Available GPU Options:${NC}"
echo "1. T4 (16GB) - Best for inference, $0.59/hour"
echo "2. A10G (24GB) - Balanced performance, $1.10/hour"
echo "3. A100 (40GB) - Maximum performance, $3.09/hour"
echo "4. H100 (80GB) - Enterprise grade, $8.50/hour"
echo ""

# Select GPU type
read -p "Select GPU type (1-4, default: 1): " GPU_CHOICE
GPU_CHOICE=${GPU_CHOICE:-1}

# Update modal_app.py with selected GPU
case $GPU_CHOICE in
    1) GPU_TYPE="T4" ;;
    2) GPU_TYPE="A10G" ;;
    3) GPU_TYPE="A100" ;;
    4) GPU_TYPE="H100" ;;
    *) GPU_TYPE="T4" ;;
esac

# Update the GPU type in modal_app.py
sed -i "s/gpu=\"T4\"/gpu=\"$GPU_TYPE\"/g" modal_app.py

echo -e "${GREEN}✓ Selected GPU: $GPU_TYPE${NC}"
echo ""

# Deployment options
echo "Select deployment option:"
echo "1. Full deployment (app + GPU workers)"
echo "2. GPU workers only"
echo "3. Update secrets only"
echo "4. Test GPU performance"
echo "5. Setup monitoring"
echo ""
read -p "Enter option (1-5): " -n 1 -r
echo ""

case $REPLY in
    1)
        setup_modal_secrets
        deploy_to_modal
        test_gpu_performance
        setup_monitoring
        ;;
    2)
        echo -e "${YELLOW}Deploying GPU workers only...${NC}"
        modal deploy modal_app.py::ai_processor
        echo -e "${GREEN}✓ GPU workers deployed${NC}"
        ;;
    3)
        setup_modal_secrets
        ;;
    4)
        test_gpu_performance
        ;;
    5)
        setup_monitoring
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Modal GPU deployment completed!${NC}"
echo ""
echo "Useful Modal commands:"
echo "  modal app list              - List all apps"
echo "  modal app logs crowecode   - View logs"
echo "  modal app stop crowecode   - Stop deployment"
echo "  modal secret list          - List secrets"
echo "  modal gpu list             - Show GPU usage"
echo ""
echo "GPU Optimization Tips:"
echo "  - Batch AI requests for better GPU utilization"
echo "  - Use T4 for inference, A100/H100 for training"
echo "  - Monitor GPU memory usage in Modal dashboard"
echo "  - Enable request queuing for cost optimization"