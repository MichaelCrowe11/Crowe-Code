# 🎉 Stripe Products Successfully Created!

Your CroweCode pricing plans are now live in your CROWE LOGIC Stripe account (test mode).

## ✅ Created Products and Prices

### 1. CroweCode Pro - $20/month
- **Product ID**: `prod_T5OPrdIpePpikA`
- **Price ID**: `price_1S9DcbQ6s74Bq3bWG3D4Py2f`
- **Features**: 3 workspaces, 4 vCPU/8GB RAM, 25GB storage, 1,000 AI prompts/month
- **Trial**: 14 days free

### 2. CroweCode Team - $200/month
- **Product ID**: `prod_T5OP8xzvIWPCTw`
- **Price ID**: `price_1S9DcvQ6s74Bq3bW4m3oHAqO`
- **Features**: 5+ workspaces, 8 vCPU/32GB RAM, 100GB storage, 10,000 AI prompts/month, SSO
- **Trial**: 14 days free

### 3. CroweCode Enterprise+ - $299/month per seat
- **Product ID**: `prod_T5OQjpLgE9qT4a`
- **Price ID**: `price_1S9DdQQ6s74Bq3bWwWxEugCC`
- **Features**: GPU-ready, 25,000 AI prompts/month, VPC/SAML, 24/7 support

### 4. CroweCode Compute Credits - $2/hour
- **Product ID**: `prod_T5OQkXyZStZgEc`
- **Price ID**: `price_1S9DdwQ6s74Bq3bWLNZ9XvnD`
- **Features**: Additional compute hours (set up for standard pricing, convert to metered later)

## 📋 Add to Your Environment Files

### Local Development (`.env.local`)
```env
# Stripe Price IDs
CROWECODE_PRO_PRICE_ID=price_1S9DcbQ6s74Bq3bWG3D4Py2f
CROWECODE_TEAM_PRICE_ID=price_1S9DcvQ6s74Bq3bW4m3oHAqO
CROWECODE_ENTERPRISE_PLUS_PRICE_ID=price_1S9DdQQ6s74Bq3bWwWxEugCC
CROWECODE_COMPUTE_CREDITS_PRICE_ID=price_1S9DdwQ6s74Bq3bWLNZ9XvnD
```

### Production Deployment (Fly.io)
```bash
fly secrets set \
  CROWECODE_PRO_PRICE_ID="price_1S9DcbQ6s74Bq3bWG3D4Py2f" \
  CROWECODE_TEAM_PRICE_ID="price_1S9DcvQ6s74Bq3bW4m3oHAqO" \
  CROWECODE_ENTERPRISE_PLUS_PRICE_ID="price_1S9DdQQ6s74Bq3bWwWxEugCC" \
  CROWECODE_COMPUTE_CREDITS_PRICE_ID="price_1S9DdwQ6s74Bq3bWLNZ9XvnD" \
  --app crowecode-main
```

## 🔗 View in Stripe Dashboard

Your products are now visible at:
- **Products**: https://dashboard.stripe.com/test/products
- **Prices**: https://dashboard.stripe.com/test/prices

## 🚀 Next Steps

1. **Set up webhooks**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

2. **Test a checkout session**:
   ```bash
   stripe checkout sessions create \
     --success-url="https://crowecode-main.fly.dev/dashboard" \
     --line-item="price=price_1S9DcbQ6s74Bq3bWG3D4Py2f,quantity=1" \
     --mode=subscription
   ```

3. **Switch to live mode** (when ready):
   - Activate your Stripe account
   - Get live API keys
   - Create products in live mode
   - Update environment variables

## ⚡ Quick Test

Test your integration with:
```bash
curl https://api.stripe.com/v1/prices/price_1S9DcbQ6s74Bq3bWG3D4Py2f \
  -u YOUR_STRIPE_SECRET_KEY:
```

---

*Created: January 19, 2025*
*Stripe Account: CROWE LOGIC (acct_1RkUYkQ6s74Bq3bW)*