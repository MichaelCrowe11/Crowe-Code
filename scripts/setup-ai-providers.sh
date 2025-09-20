#!/bin/bash

# CroweCode AI Provider Setup Script
# This script helps configure AI provider API keys for the platform

echo "======================================"
echo "  CroweCode AI Provider Setup"
echo "======================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a secret is already set
check_secret() {
    local secret_name=$1
    if fly secrets list --app crowecode-main | grep -q "$secret_name"; then
        echo -e "${GREEN}✓${NC} $secret_name is already configured"
        return 0
    else
        echo -e "${YELLOW}✗${NC} $secret_name is not configured"
        return 1
    fi
}

# Function to set a secret
set_secret() {
    local secret_name=$1
    local secret_value=$2

    if [ -z "$secret_value" ]; then
        echo -e "${YELLOW}Skipping $secret_name (no value provided)${NC}"
        return
    fi

    echo -e "${GREEN}Setting $secret_name...${NC}"
    fly secrets set "$secret_name=$secret_value" --app crowecode-main
}

echo "Checking current AI provider configuration..."
echo "============================================="
echo ""

# Check each provider
check_secret "XAI_API_KEY"
XAI_SET=$?

check_secret "ANTHROPIC_API_KEY"
ANTHROPIC_SET=$?

check_secret "OPENAI_API_KEY"
OPENAI_SET=$?

check_secret "GOOGLE_AI_API_KEY"
GOOGLE_AI_SET=$?

check_secret "GROQ_API_KEY"
GROQ_SET=$?

check_secret "CODEX_API_KEY"
CODEX_SET=$?

echo ""
echo "======================================"
echo "  Configure AI Providers"
echo "======================================"
echo ""
echo "Leave blank to skip any provider you don't want to configure."
echo ""

# Collect API keys
if [ $XAI_SET -ne 0 ]; then
    echo -e "${YELLOW}XAI (Grok) API Key:${NC}"
    echo "Get your key from: https://console.x.ai/"
    read -p "Enter XAI_API_KEY (or press Enter to skip): " XAI_KEY
    echo ""
fi

if [ $ANTHROPIC_SET -ne 0 ]; then
    echo -e "${YELLOW}Anthropic (Claude) API Key:${NC}"
    echo "Get your key from: https://console.anthropic.com/"
    read -p "Enter ANTHROPIC_API_KEY (or press Enter to skip): " ANTHROPIC_KEY
    echo ""
fi

if [ $OPENAI_SET -ne 0 ]; then
    echo -e "${YELLOW}OpenAI (GPT-4) API Key:${NC}"
    echo "Get your key from: https://platform.openai.com/api-keys"
    read -p "Enter OPENAI_API_KEY (or press Enter to skip): " OPENAI_KEY
    echo ""
fi

echo -e "${YELLOW}Optional AI Providers:${NC}"
echo ""

if [ $GOOGLE_AI_SET -ne 0 ]; then
    echo "Google AI (Gemini) API Key:"
    echo "Get your key from: https://makersuite.google.com/app/apikey"
    read -p "Enter GOOGLE_AI_API_KEY (or press Enter to skip): " GOOGLE_AI_KEY
    echo ""
fi

if [ $GROQ_SET -ne 0 ]; then
    echo "Groq API Key:"
    echo "Get your key from: https://console.groq.com/keys"
    read -p "Enter GROQ_API_KEY (or press Enter to skip): " GROQ_KEY
    echo ""
fi

# Ask for confirmation
echo ""
echo "======================================"
echo "  Ready to Configure"
echo "======================================"
echo ""
echo "The following API keys will be configured:"
[ ! -z "$XAI_KEY" ] && echo "  • XAI_API_KEY"
[ ! -z "$ANTHROPIC_KEY" ] && echo "  • ANTHROPIC_API_KEY"
[ ! -z "$OPENAI_KEY" ] && echo "  • OPENAI_API_KEY"
[ ! -z "$GOOGLE_AI_KEY" ] && echo "  • GOOGLE_AI_API_KEY"
[ ! -z "$GROQ_KEY" ] && echo "  • GROQ_API_KEY"
echo ""

read -p "Continue? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Setting API keys..."
    echo ""

    # Set all the secrets
    [ ! -z "$XAI_KEY" ] && set_secret "XAI_API_KEY" "$XAI_KEY"
    [ ! -z "$ANTHROPIC_KEY" ] && set_secret "ANTHROPIC_API_KEY" "$ANTHROPIC_KEY"
    [ ! -z "$OPENAI_KEY" ] && set_secret "OPENAI_API_KEY" "$OPENAI_KEY"
    [ ! -z "$GOOGLE_AI_KEY" ] && set_secret "GOOGLE_AI_API_KEY" "$GOOGLE_AI_KEY"
    [ ! -z "$GROQ_KEY" ] && set_secret "GROQ_API_KEY" "$GROQ_KEY"

    echo ""
    echo -e "${GREEN}✓ AI providers configured successfully!${NC}"
    echo ""
    echo "The application will restart automatically to apply the new configuration."
    echo ""
    echo "Test your AI providers at:"
    echo "  • https://crowecode-main.fly.dev/api/ai/test"
    echo "  • https://crowecode-main.fly.dev/api/ai/providers"
else
    echo ""
    echo -e "${YELLOW}Setup cancelled.${NC}"
fi