# 🚀 Stripe Quick Setup Guide for CroweCode

## Step 1: Get Your Stripe API Keys

1. **Sign up or log in to Stripe**: https://dashboard.stripe.com

2. **Get your test API keys**:
   - Navigate to: https://dashboard.stripe.com/test/apikeys
   - Copy your **Test Secret Key** (starts with `sk_test_`)
   - Copy your **Test Publishable Key** (starts with `pk_test_`)

3. **Update your `.env.local` file**:
   ```env
   STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
   STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
   ```

## Step 2: Run the Setup Script

Once you have your real API keys in `.env.local`, run:

```bash
# Using TypeScript (recommended)
npx tsx scripts/setup-stripe-pricing.ts

# OR using Python
python scripts/setup_stripe_pricing.py
```

This will create:
- ✅ CroweCode Pro ($20/month)
- ✅ CroweCode Team ($200/month)
- ✅ CroweCode Enterprise+ ($299/month per seat)
- ✅ Compute Credits ($2/hour metered)

## Step 3: Save the Price IDs

The script will output price IDs like:
```
CROWECODE_PRO_PRICE_ID=price_1ABC123...
CROWECODE_TEAM_PRICE_ID=price_1DEF456...
```

Add these to your `.env.local` file.

## Step 4: Set Up Webhooks (for production)

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Add endpoint URL: `https://crowecode-main.fly.dev/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.*`
   - `invoice.payment_*`
4. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

## Step 5: Deploy to Production

Set your Stripe secrets on Fly.io:

```bash
fly secrets set STRIPE_SECRET_KEY="sk_live_..." --app crowecode-main
fly secrets set STRIPE_PUBLISHABLE_KEY="pk_live_..." --app crowecode-main
fly secrets set STRIPE_WEBHOOK_SECRET="whsec_..." --app crowecode-main

# Add the price IDs
fly secrets set CROWECODE_PRO_PRICE_ID="price_..." --app crowecode-main
fly secrets set CROWECODE_TEAM_PRICE_ID="price_..." --app crowecode-main
# ... etc
```

## Need a Stripe Account?

1. **Sign up free**: https://dashboard.stripe.com/register
2. **No credit card required** for test mode
3. **Instant access** to test API keys

## Test Card Numbers

For testing payments:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

Use any future date for expiry and any 3 digits for CVC.

---

**Next step**: Replace the test API key in `.env.local` with your actual Stripe test key, then run the setup script!