# AI Provider API Keys Setup Guide

## Overview
CroweCode Platform supports multiple AI providers for enhanced capabilities. The platform uses an intelligent fallback system, so you don't need ALL providers - just configure the ones you have access to.

## Primary Providers (Recommended)

### 1. 🤖 XAI (Grok) - Primary Provider
**Get API Key**: [https://console.x.ai/](https://console.x.ai/)
- Sign up for X.AI access
- Navigate to API Keys section
- Generate a new API key
- Copy the key starting with `xai-`

**Set in Production**:
```bash
fly secrets set XAI_API_KEY="xai-your-key-here" --app crowecode-main
```

### 2. 🧠 Anthropic (Claude) - Fallback Provider
**Get API Key**: [https://console.anthropic.com/](https://console.anthropic.com/)
- Sign up for Anthropic Console
- Go to Settings → API Keys
- Create new API key
- Copy the key starting with `sk-ant-`

**Set in Production**:
```bash
fly secrets set ANTHROPIC_API_KEY="sk-ant-your-key-here" --app crowecode-main
```

### 3. 🌟 OpenAI (GPT-4) - Secondary Fallback
**Get API Key**: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Sign in to OpenAI Platform
- Navigate to API keys
- Create new secret key
- Copy the key starting with `sk-`

**Set in Production**:
```bash
fly secrets set OPENAI_API_KEY="sk-your-key-here" --app crowecode-main
```

## Optional Providers

### 4. 🔷 Google AI (Gemini)
**Get API Key**: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
- Sign in with Google account
- Click "Get API Key"
- Create API key in new project or select existing
- Copy the API key

**Set in Production**:
```bash
fly secrets set GOOGLE_AI_API_KEY="your-gemini-key" --app crowecode-main
```

### 5. ⚡ Groq (Fast Inference)
**Get API Key**: [https://console.groq.com/keys](https://console.groq.com/keys)
- Sign up for Groq Cloud
- Navigate to API Keys
- Create new API key
- Copy the key

**Set in Production**:
```bash
fly secrets set GROQ_API_KEY="gsk_your-key-here" --app crowecode-main
```

## Quick Setup Options

### Option 1: Interactive Setup Script (Recommended)
```bash
# Run the interactive setup script
bash scripts/setup-ai-providers.sh
```

### Option 2: Set All Keys at Once
```bash
fly secrets set \
  XAI_API_KEY="xai-your-key" \
  ANTHROPIC_API_KEY="sk-ant-your-key" \
  OPENAI_API_KEY="sk-your-key" \
  --app crowecode-main
```

### Option 3: Set Keys Individually
```bash
# Set one at a time
fly secrets set XAI_API_KEY="xai-your-key" --app crowecode-main
fly secrets set ANTHROPIC_API_KEY="sk-ant-your-key" --app crowecode-main
fly secrets set OPENAI_API_KEY="sk-your-key" --app crowecode-main
```

## Verify Configuration

### Check Which Keys Are Set
```bash
fly secrets list --app crowecode-main | grep -E "XAI|ANTHROPIC|OPENAI|GOOGLE_AI|GROQ"
```

### Test AI Providers
After setting the keys, test them at:
- **Test Endpoint**: https://crowecode-main.fly.dev/api/ai/test
- **Provider Status**: https://crowecode-main.fly.dev/api/ai/providers
- **Generate Code**: https://crowecode-main.fly.dev/api/ai/generate

## Provider Capabilities

| Provider | Best For | Context Window | Speed | Cost |
|----------|----------|---------------|-------|------|
| **XAI (Grok)** | Code generation, analysis | 256K | Fast | $$ |
| **Anthropic (Claude)** | Complex reasoning, debugging | 200K | Medium | $$$ |
| **OpenAI (GPT-4)** | General purpose, testing | 128K | Medium | $$$ |
| **Google (Gemini)** | Multi-modal, documentation | 1M | Fast | $$ |
| **Groq** | Fast inference, completions | 32K | Very Fast | $ |

## Fallback Chain
The platform automatically falls back through providers if one fails:
1. **Primary**: XAI (Grok)
2. **Fallback 1**: Anthropic (Claude)
3. **Fallback 2**: OpenAI (GPT-4)
4. **Fallback 3**: Google AI (Gemini)
5. **Fallback 4**: Groq

## Minimum Requirements
- At least **ONE** provider configured
- Recommended: Configure at least 2 providers for redundancy
- Optimal: Configure XAI + Anthropic + OpenAI

## Troubleshooting

### "No AI provider configured"
- Ensure at least one API key is set
- Check the key format is correct
- Verify the key is active in provider's dashboard

### "Rate limit exceeded"
- The platform will automatically switch to fallback provider
- Consider adding more providers for better distribution

### "Invalid API key"
- Double-check the key is copied correctly
- Ensure no extra spaces or characters
- Verify the key hasn't been revoked

## Cost Management

### Free Tiers Available
- **OpenAI**: $5 free credits for new accounts
- **Google AI**: Free tier with rate limits
- **Anthropic**: Limited free tier available

### Cost Optimization Tips
1. Set usage limits in each provider's dashboard
2. Monitor usage through provider consoles
3. Use Groq for high-volume, simple tasks (cheapest)
4. Reserve Claude/GPT-4 for complex tasks

## Security Notes
- Never commit API keys to git
- Rotate keys regularly
- Use separate keys for dev/staging/production
- Monitor usage for suspicious activity

## Support Links
- **XAI Documentation**: [https://docs.x.ai/](https://docs.x.ai/)
- **Anthropic Docs**: [https://docs.anthropic.com/](https://docs.anthropic.com/)
- **OpenAI Docs**: [https://platform.openai.com/docs](https://platform.openai.com/docs)
- **Google AI Docs**: [https://ai.google.dev/](https://ai.google.dev/)
- **Groq Docs**: [https://console.groq.com/docs](https://console.groq.com/docs)