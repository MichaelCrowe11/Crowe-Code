# Live Stripe Products - CroweCode Platform

## Account Information
- **Account Name**: CROWE LOGIC
- **Account ID**: acct_1QJpErDSZPCbVOig
- **Dashboard**: https://dashboard.stripe.com/acct_1QJpErDSZPCbVOig/products

## Live Products & Pricing

### 1. CroweCode Pro - $20/month
- **Product ID**: `prod_T5OrAJ2jTnvO1I`
- **Price ID**: `price_1S9DwwDSZPCbVOighgXMpXNM`
- **Features**:
  - 3 workspaces
  - 4 vCPU / 8GB RAM
  - 25GB storage
  - 1,000 AI prompts/month
  - 14-day free trial

### 2. CroweCode Team - $200/month
- **Product ID**: `prod_T5OrnT4W9jfLBH`
- **Price ID**: `price_1S9DxgDSZPCbVOigKOmPtx8X`
- **Features**:
  - 5+ workspaces
  - 8 vCPU / 32GB RAM
  - 100GB storage
  - 10,000 AI prompts/month
  - SSO support
  - 14-day free trial

### 3. CroweCode Enterprise+ - $299/month per seat
- **Product ID**: `prod_T5Os9qtx3Ygkx5`
- **Price ID**: `price_1S9Dy6DSZPCbVOigkm3Y8DUk`
- **Features**:
  - GPU-ready instances
  - 25,000 AI prompts/month
  - VPC/SAML support
  - 24/7 priority support

### 4. CroweCode Compute Credits - $2.00/month
- **Product ID**: `prod_T5OsjQ1JZLUZdh`
- **Price ID**: `price_1S9E87DSZPCbVOigaw0UDX8S`
- **Features**:
  - Additional compute hours beyond plan limits
  - Note: Configured as monthly recurring, implement usage-based billing in application

## Environment Variables

### Production (Fly.io) - ✅ DEPLOYED
```bash
fly secrets set \
  STRIPE_SECRET_KEY="[REDACTED - Set in Fly.io dashboard]" \
  STRIPE_PUBLISHABLE_KEY="[REDACTED - Set in Fly.io dashboard]" \
  STRIPE_WEBHOOK_SECRET="[REDACTED - Set in Fly.io dashboard]" \
  CROWECODE_PRO_PRICE_ID="price_1S9DwwDSZPCbVOighgXMpXNM" \
  CROWECODE_TEAM_PRICE_ID="price_1S9DxgDSZPCbVOigKOmPtx8X" \
  CROWECODE_ENTERPRISE_PLUS_PRICE_ID="price_1S9Dy6DSZPCbVOigkm3Y8DUk" \
  CROWECODE_COMPUTE_CREDITS_PRICE_ID="price_1S9E87DSZPCbVOigaw0UDX8S" \
  --app crowecode-main
```

### Local Development (.env.local for LIVE testing)
```env
# LIVE Stripe Keys (BE CAREFUL - These are LIVE keys!)
STRIPE_SECRET_KEY_LIVE=[REDACTED - Get from Stripe Dashboard]
STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_51QJpErDSZPCbVOig...

# LIVE Price IDs
CROWECODE_PRO_PRICE_ID_LIVE=price_1S9DwwDSZPCbVOighgXMpXNM
CROWECODE_TEAM_PRICE_ID_LIVE=price_1S9DxgDSZPCbVOigKOmPtx8X
CROWECODE_ENTERPRISE_PLUS_PRICE_ID_LIVE=price_1S9Dy6DSZPCbVOigkm3Y8DUk
CROWECODE_COMPUTE_CREDITS_PRICE_ID_LIVE=price_1S9E87DSZPCbVOigaw0UDX8S
```

## Webhook Configuration - ✅ CONFIGURED

- **Webhook Endpoint ID**: `we_1S9EDZDSZPCbVOigWFisUECh`
- **Endpoint URL**: `https://crowecode-main.fly.dev/api/stripe/webhook`
- **Webhook Secret**: `whsec_B0LRyALYl4vIVg8GCTUIwLwgWku65WGB`
- **Status**: ENABLED
- **Events Configured**:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

## Next Steps

1. ✅ **Live Publishable Key** - Configured: `pk_live_51QJpErDSZPCbVOig6qVepQpCnuLu5agqOFwbQp5NbTE2PxKdBb2GDzXjjmW7es6Krg9nse1C987uPnZRHBDwVNSg00mSVmQcdw`

2. ✅ **Live Webhooks** - Configured and enabled

3. ✅ **Production Environment** - All secrets deployed to Fly.io

4. **Test Live Integration**
   - Create a test checkout session
   - Use a real card to verify end-to-end flow
   - Monitor the Stripe dashboard for transactions

## Important Notes

- These are LIVE products and will process REAL payments
- Always test with small amounts first
- Enable 2FA on your Stripe account
- Monitor failed payments and disputes
- Set up appropriate tax collection if needed

---
*Created: January 19, 2025*
*Status: All live products successfully created*