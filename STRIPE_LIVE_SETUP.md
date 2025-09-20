# 🔴 IMPORTANT: Setting Up LIVE Stripe Keys

## Your Account Status
✅ **CROWE LOGIC** Stripe account is ACTIVATED and ready for live payments!
- Account ID: `acct_1RkUYkQ6s74Bq3bW`
- Live Publishable Key: `pk_live_51RkUYkQ6s74Bq3bW...` (already available)

## Get Your Live Secret Key

The Stripe CLI has a restricted key that can't create products. You need your full secret key:

### Step 1: Get Your Live Secret Key

1. **Go to**: https://dashboard.stripe.com/apikeys (NOT `/test/apikeys`)
2. **Click**: "Reveal live key"
3. **Copy**: Your `sk_live_...` key

### Step 2: Update Your Environment

Add to `.env.local`:
```env
# LIVE Stripe Keys (for production)
STRIPE_SECRET_KEY_LIVE=sk_live_YOUR_ACTUAL_KEY_HERE
STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_51RkUYkQ6s74Bq3bWn8rIRDOvbQ4rXxYK6OY0SzvMRuBi0ly4uwdvbEAsCkzbFcxMXVThxON1YMDEDfeAfAWBLDZ800iW5J5FEJ
```

### Step 3: Create Live Products

Once you have your live secret key, I can create products via:

**Option A: Use the Script**
```bash
# Set the live key temporarily
export STRIPE_SECRET_KEY=sk_live_YOUR_KEY
# Run the script
npx tsx scripts/setup-stripe-pricing.ts
```

**Option B: Use Stripe Dashboard**
Go to https://dashboard.stripe.com/products and create them manually

## Your Live Keys (What We Know)

```env
# Live Publishable Key (Safe to share - for frontend)
STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_51RkUYkQ6s74Bq3bWn8rIRDOvbQ4rXxYK6OY0SzvMRuBi0ly4uwdvbEAsCkzbFcxMXVThxON1YMDEDfeAfAWBLDZ800iW5J5FEJ

# Live Secret Key (Get from dashboard)
STRIPE_SECRET_KEY_LIVE=sk_live_... # Get this from dashboard
```

## Deploy Live Keys to Production

```bash
fly secrets set \
  STRIPE_SECRET_KEY="sk_live_YOUR_KEY" \
  STRIPE_PUBLISHABLE_KEY="pk_live_51RkUYkQ6s74Bq3bWn8rIRDOvbQ4rXxYK6OY0SzvMRuBi0ly4uwdvbEAsCkzbFcxMXVThxON1YMDEDfeAfAWBLDZ800iW5J5FEJ" \
  --app crowecode-main
```

## Quick Links

- **Get Secret Key**: https://dashboard.stripe.com/apikeys
- **Create Products**: https://dashboard.stripe.com/products
- **Configure Webhooks**: https://dashboard.stripe.com/webhooks

---

**Next Step**: Get your live secret key from the dashboard, then we can create live products!