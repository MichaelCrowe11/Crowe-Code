# 🚀 Going Live with Stripe - CroweCode

## Current Status ✅
- **Test Mode**: Fully configured and working
- **Products Created**: All 4 pricing tiers in test mode
- **Account**: CROWE LOGIC (acct_1RkUYkQ6s74Bq3bW)

## Steps to Go Live

### 1. Activate Your Stripe Account (Required)

Before you can accept real payments, you need to complete Stripe activation:

1. **Go to**: https://dashboard.stripe.com/account/onboarding
2. **Complete**:
   - Business details (business type, address, tax ID)
   - Bank account information (for payouts)
   - Identity verification (government ID)
   - Business representative information
   - Website URL: https://crowecode-main.fly.dev

**Time**: Usually instant, but can take up to 2 business days for verification

### 2. Get Your Live API Keys

Once activated:
1. Visit: https://dashboard.stripe.com/apikeys (no `/test/`)
2. Copy your **Live Secret Key** (starts with `sk_live_`)
3. Copy your **Live Publishable Key** (starts with `pk_live_`)

### 3. Create Live Products via CLI

```bash
# Switch to live mode
stripe --live

# Create products in live mode (same commands, but in live environment)
# The products will have different IDs than test mode
```

Or I can create them for you once you're activated:

```bash
# Just run this after activation:
npx tsx scripts/setup-stripe-pricing-live.ts
```

### 4. Update Production Environment

Set your live keys on Fly.io:

```bash
# Set live Stripe keys
fly secrets set \
  STRIPE_SECRET_KEY="sk_live_YOUR_REAL_KEY" \
  STRIPE_PUBLISHABLE_KEY="pk_live_YOUR_REAL_KEY" \
  --app crowecode-main

# Set live price IDs (after creating live products)
fly secrets set \
  CROWECODE_PRO_PRICE_ID="price_live_..." \
  CROWECODE_TEAM_PRICE_ID="price_live_..." \
  CROWECODE_ENTERPRISE_PLUS_PRICE_ID="price_live_..." \
  CROWECODE_COMPUTE_CREDITS_PRICE_ID="price_live_..." \
  --app crowecode-main
```

### 5. Configure Live Webhooks

1. Go to: https://dashboard.stripe.com/webhooks (live dashboard)
2. Add endpoint: `https://crowecode-main.fly.dev/api/stripe/webhook`
3. Select events (same as test)
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### 6. Enable Payment Methods

In live mode, configure accepted payment methods:
1. Go to: https://dashboard.stripe.com/settings/payment_methods
2. Enable:
   - Cards (Visa, Mastercard, Amex, etc.)
   - Digital wallets (Apple Pay, Google Pay)
   - Bank debits (ACH, SEPA if needed)

### 7. Set Up Tax Collection (Optional but Recommended)

1. Go to: https://dashboard.stripe.com/settings/tax
2. Enable Stripe Tax
3. Configure tax registration for your jurisdictions

## Important Live Mode Considerations

### Security
- **Never expose live secret keys** in code or logs
- **Always use HTTPS** for production
- **Implement rate limiting** on checkout endpoints
- **Enable 2FA** on your Stripe account

### Compliance
- **PCI Compliance**: Stripe handles this, but ensure you:
  - Never log card details
  - Always use Stripe.js for card collection
  - Keep your integration up to date

### Testing in Live Mode
- Use real cards (you'll be charged!)
- Set up a separate staging environment with test keys
- Consider using Stripe's test clock for subscription testing

### Monitoring
- Set up alerts: https://dashboard.stripe.com/settings/alerts
- Monitor failed payments
- Track conversion rates
- Review fraud detection

## Quick Checklist

- [ ] Complete Stripe account activation
- [ ] Add bank account for payouts
- [ ] Verify identity
- [ ] Get live API keys
- [ ] Create products in live mode
- [ ] Update production environment variables
- [ ] Configure live webhooks
- [ ] Enable payment methods
- [ ] Set up tax collection (if needed)
- [ ] Test with a small real transaction
- [ ] Set up monitoring and alerts

## Your Current Test Configuration

For reference, here are your test mode price IDs:

```env
# TEST MODE (Currently Active)
CROWECODE_PRO_PRICE_ID=price_1S9DcbQ6s74Bq3bWG3D4Py2f
CROWECODE_TEAM_PRICE_ID=price_1S9DcvQ6s74Bq3bW4m3oHAqO
CROWECODE_ENTERPRISE_PLUS_PRICE_ID=price_1S9DdQQ6s74Bq3bWwWxEugCC
CROWECODE_COMPUTE_CREDITS_PRICE_ID=price_1S9DdwQ6s74Bq3bWLNZ9XvnD
```

## Support Resources

- **Stripe Support**: https://support.stripe.com
- **Going Live Guide**: https://stripe.com/docs/development/checklist
- **Best Practices**: https://stripe.com/docs/development/best-practices

---

**Ready to go live?** Start with Step 1 (Account Activation) at:
https://dashboard.stripe.com/account/onboarding

Once activated, I can help you create the live products immediately!