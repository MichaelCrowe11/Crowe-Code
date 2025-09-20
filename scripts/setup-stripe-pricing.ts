/**
 * CroweCode Stripe Pricing Setup Script
 *
 * This script creates the pricing structure in Stripe:
 * - Pro Plan: $20/month - Personal developer workspaces
 * - Team Plan: $200/month - Shared team workspaces with collaboration
 * - Enterprise+ Plan: $299/month per seat - Premium features with GPU support
 * - Compute Credits: $2/hour metered - Additional compute resources
 *
 * Run with: npx tsx scripts/setup-stripe-pricing.ts
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

interface PricingPlan {
  name: string;
  unitAmountCents: number | null;
  currency: string;
  recurringInterval: 'month' | 'year';
  productDescription: string;
  metadata: Record<string, string>;
  usageType?: 'licensed' | 'metered';
  trialPeriodDays?: number;
}

async function createProductWithPrice(plan: PricingPlan) {
  try {
    // Create the product
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.productDescription,
      metadata: plan.metadata,
    });

    // Prepare price creation parameters
    const priceParams: Stripe.PriceCreateParams = {
      product: product.id,
      currency: plan.currency,
      recurring: {
        interval: plan.recurringInterval,
      },
    };

    // Add unit amount if not null (for non-metered prices)
    if (plan.unitAmountCents !== null) {
      priceParams.unit_amount = plan.unitAmountCents;
    }

    // Add usage type for metered billing
    if (plan.usageType) {
      priceParams.recurring!.usage_type = plan.usageType;
      if (plan.usageType === 'metered' && plan.unitAmountCents !== null) {
        priceParams.unit_amount = plan.unitAmountCents;
      }
    }

    // Add trial period if specified
    if (plan.trialPeriodDays) {
      priceParams.recurring!.trial_period_days = plan.trialPeriodDays;
    }

    // Create the price
    const price = await stripe.prices.create(priceParams);

    console.log(`✅ Created product: ${plan.name}`);
    console.log(`   Product ID: ${product.id}`);
    console.log(`   Price ID: ${price.id}`);
    console.log(`   Amount: ${plan.unitAmountCents ? `$${(plan.unitAmountCents / 100).toFixed(2)}` : 'Metered'}/${plan.recurringInterval}`);
    console.log('');

    return { product, price };
  } catch (error) {
    console.error(`❌ Failed to create ${plan.name}:`, error);
    throw error;
  }
}

async function setupStripePricing() {
  console.log('🚀 Setting up CroweCode Stripe pricing plans...\n');

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ Error: STRIPE_SECRET_KEY is not set in environment variables');
    process.exit(1);
  }

  const plans: PricingPlan[] = [
    // Pro Plan - $20/month
    {
      name: 'CroweCode Pro',
      unitAmountCents: 2000,
      currency: 'usd',
      recurringInterval: 'month',
      productDescription: 'Personal developer workspaces: 3 workspaces, 4 vCPU/8GB RAM, 25GB storage, 1,000 AI prompts/month',
      metadata: {
        tier: 'pro',
        workspaces: '3',
        vcpu: '4',
        ram_gb: '8',
        storage_gb: '25',
        ai_prompts_monthly: '1000',
        trial_days: '14',
      },
      trialPeriodDays: 14,
    },

    // Team Plan - $200/month
    {
      name: 'CroweCode Team',
      unitAmountCents: 20000,
      currency: 'usd',
      recurringInterval: 'month',
      productDescription: 'Team collaboration: 5+ shared workspaces, 8 vCPU/32GB RAM, 100GB storage, 10,000 AI prompts/month, SSO',
      metadata: {
        tier: 'team',
        workspaces: 'unlimited',
        vcpu: '8',
        ram_gb: '32',
        storage_gb: '100',
        ai_prompts_monthly: '10000',
        sso: 'true',
        collaboration: 'true',
        trial_days: '14',
      },
      trialPeriodDays: 14,
    },

    // Enterprise+ Plan - $299/month per seat
    {
      name: 'CroweCode Enterprise+',
      unitAmountCents: 29900,
      currency: 'usd',
      recurringInterval: 'month',
      productDescription: 'Premium per-seat plan: GPU-ready workspaces, 25,000 AI prompts/month, VPC/SAML, 24/7 support, custom discounts available',
      metadata: {
        tier: 'enterprise_plus',
        billing_model: 'per_seat',
        workspaces: 'unlimited',
        gpu_support: 'true',
        ai_prompts_monthly: '25000',
        sla: '99.9%',
        support: '24/7',
        vpc: 'true',
        saml: 'true',
      },
    },

    // Compute Credits Add-on - $2/hour (metered)
    {
      name: 'CroweCode Compute Credits',
      unitAmountCents: 200, // $2.00 per hour
      currency: 'usd',
      recurringInterval: 'month',
      productDescription: 'Metered compute credits: $2.00 per hour for additional heavy workspace usage (billed based on actual usage)',
      metadata: {
        addon_type: 'compute_credits',
        billing_model: 'metered',
        unit: 'hour',
        rate_usd: '2.00',
        description: 'Additional compute hours beyond plan limits',
      },
      usageType: 'metered',
    },
  ];

  const results = [];

  for (const plan of plans) {
    try {
      const result = await createProductWithPrice(plan);
      results.push(result);
    } catch (error) {
      console.error('Failed to create plan:', plan.name);
    }
  }

  console.log('📝 Summary:');
  console.log('===========');
  console.log(`✅ Successfully created ${results.length} out of ${plans.length} pricing plans`);

  if (results.length === plans.length) {
    console.log('\n🎉 All CroweCode pricing plans have been set up successfully!');
    console.log('\n📌 Next steps:');
    console.log('1. Update environment variables with the price IDs');
    console.log('2. Configure webhooks in Stripe Dashboard');
    console.log('3. Test checkout flow with test cards');
    console.log('4. Enable payment methods in Stripe Dashboard');
  } else {
    console.log('\n⚠️ Some plans failed to create. Please check the errors above.');
  }

  // Save price IDs to environment file
  if (results.length > 0) {
    console.log('\n🔐 Add these to your .env.local file:');
    console.log('=====================================');
    results.forEach((result, index) => {
      const plan = plans[index];
      const envKey = plan.name.toUpperCase().replace(/[^A-Z0-9]/g, '_') + '_PRICE_ID';
      console.log(`${envKey}=${result.price.id}`);
    });
  }
}

// Run the setup
setupStripePricing().catch(console.error);