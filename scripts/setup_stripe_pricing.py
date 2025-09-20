#!/usr/bin/env python3
"""
CroweCode Stripe Pricing Setup Script (Python Version)

This script creates the pricing structure in Stripe:
- Pro Plan: $20/month - Personal developer workspaces
- Team Plan: $200/month - Shared team workspaces with collaboration
- Enterprise+ Plan: $299/month per seat - Premium features with GPU support
- Compute Credits: $2/hour metered - Additional compute resources

Usage: python scripts/setup_stripe_pricing.py
"""

import os
import sys
from typing import Optional, Dict, Any, Tuple

try:
    import stripe
except ImportError:
    print("❌ Error: stripe package not installed")
    print("Install with: pip install stripe")
    sys.exit(1)

# Load environment variables
from dotenv import load_dotenv
load_dotenv('.env.local')

# Configure Stripe
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

if not stripe.api_key:
    print("❌ Error: STRIPE_SECRET_KEY is not set in environment variables")
    print("Add it to your .env.local file or set it as an environment variable")
    sys.exit(1)

def create_product_with_price(
    name: str,
    unit_amount_cents: Optional[int],
    currency: str = "usd",
    recurring_interval: str = "month",
    metadata: Optional[Dict[str, str]] = None,
    trial_days: Optional[int] = None,
    usage_type: Optional[str] = None,
    product_description: Optional[str] = None
) -> Tuple[Any, Any]:
    """
    Create a Stripe product and its associated price.

    Args:
        name: Product name
        unit_amount_cents: Price in cents (None for metered billing)
        currency: Currency code (default: usd)
        recurring_interval: Billing interval (month/year)
        metadata: Additional metadata for the product
        trial_days: Trial period in days
        usage_type: 'licensed' or 'metered' for usage-based billing
        product_description: Detailed product description

    Returns:
        Tuple of (product, price) Stripe objects
    """
    try:
        # Create product
        prod = stripe.Product.create(
            name=name,
            description=product_description or "",
            metadata=metadata or {}
        )

        # Prepare price parameters
        price_args = {
            "product": prod.id,
            "currency": currency,
            "recurring": {"interval": recurring_interval},
        }

        # Add unit amount if specified
        if unit_amount_cents is not None:
            price_args["unit_amount"] = int(unit_amount_cents)

        # Add usage type for metered prices
        if usage_type:
            price_args["recurring"]["usage_type"] = usage_type

        # Add trial period if specified
        if trial_days:
            price_args["recurring"]["trial_period_days"] = trial_days

        # Create price
        price = stripe.Price.create(**price_args)

        amount_str = f"${unit_amount_cents/100:.2f}" if unit_amount_cents else "Metered"
        print(f"✅ Created product: {name}")
        print(f"   Product ID: {prod.id}")
        print(f"   Price ID: {price.id}")
        print(f"   Amount: {amount_str}/{recurring_interval}")
        print()

        return prod, price

    except Exception as e:
        print(f"❌ Failed to create {name}: {str(e)}")
        raise


def setup_crowecode_pricing():
    """Set up all CroweCode pricing plans in Stripe."""

    print("🚀 Setting up CroweCode Stripe pricing plans...\n")

    results = []

    # 1) Pro Plan - $20/month
    print("Creating Pro Plan...")
    try:
        prod, price = create_product_with_price(
            name="CroweCode Pro",
            unit_amount_cents=2000,
            product_description="Personal developer workspaces: 3 workspaces, 4 vCPU/8GB RAM, 25GB storage, 1,000 AI prompts/month",
            metadata={
                "tier": "pro",
                "workspaces": "3",
                "vcpu": "4",
                "ram_gb": "8",
                "storage_gb": "25",
                "ai_prompts_monthly": "1000",
                "trial_days": "14"
            },
            trial_days=14
        )
        results.append(("CROWECODE_PRO_PRICE_ID", price.id))
    except Exception as e:
        print(f"Failed to create Pro plan: {e}")

    # 2) Team Plan - $200/month
    print("Creating Team Plan...")
    try:
        prod, price = create_product_with_price(
            name="CroweCode Team",
            unit_amount_cents=20000,
            product_description="Team collaboration: 5+ shared workspaces, 8 vCPU/32GB RAM, 100GB storage, 10,000 AI prompts/month, SSO",
            metadata={
                "tier": "team",
                "workspaces": "unlimited",
                "vcpu": "8",
                "ram_gb": "32",
                "storage_gb": "100",
                "ai_prompts_monthly": "10000",
                "sso": "true",
                "collaboration": "true",
                "trial_days": "14"
            },
            trial_days=14
        )
        results.append(("CROWECODE_TEAM_PRICE_ID", price.id))
    except Exception as e:
        print(f"Failed to create Team plan: {e}")

    # 3) Enterprise+ Plan - $299/month per seat
    print("Creating Enterprise+ Plan...")
    try:
        prod, price = create_product_with_price(
            name="CroweCode Enterprise+",
            unit_amount_cents=29900,
            product_description="Premium per-seat plan: GPU-ready workspaces, 25,000 AI prompts/month, VPC/SAML, 24/7 support, custom discounts available",
            metadata={
                "tier": "enterprise_plus",
                "billing_model": "per_seat",
                "workspaces": "unlimited",
                "gpu_support": "true",
                "ai_prompts_monthly": "25000",
                "sla": "99.9%",
                "support": "24/7",
                "vpc": "true",
                "saml": "true"
            }
        )
        results.append(("CROWECODE_ENTERPRISE_PLUS_PRICE_ID", price.id))
    except Exception as e:
        print(f"Failed to create Enterprise+ plan: {e}")

    # 4) Metered Compute Add-on - $2/hour
    print("Creating Compute Credits Add-on...")
    try:
        prod, price = create_product_with_price(
            name="CroweCode Compute Credits",
            unit_amount_cents=200,  # $2.00 per hour
            product_description="Metered compute credits: $2.00 per hour for additional heavy workspace usage (billed based on actual usage)",
            usage_type="metered",
            metadata={
                "addon_type": "compute_credits",
                "billing_model": "metered",
                "unit": "hour",
                "rate_usd": "2.00",
                "description": "Additional compute hours beyond plan limits"
            }
        )
        results.append(("CROWECODE_COMPUTE_CREDITS_PRICE_ID", price.id))
    except Exception as e:
        print(f"Failed to create Compute Credits add-on: {e}")

    # Summary
    print("📝 Summary:")
    print("===========")
    print(f"✅ Successfully created {len(results)} out of 4 pricing plans")

    if len(results) == 4:
        print("\n🎉 All CroweCode pricing plans have been set up successfully!")
        print("\n📌 Next steps:")
        print("1. Update environment variables with the price IDs")
        print("2. Configure webhooks in Stripe Dashboard")
        print("3. Test checkout flow with test cards")
        print("4. Enable payment methods in Stripe Dashboard")
    else:
        print("\n⚠️ Some plans failed to create. Please check the errors above.")

    # Display environment variables to add
    if results:
        print("\n🔐 Add these to your .env.local file:")
        print("=====================================")
        for env_key, price_id in results:
            print(f"{env_key}={price_id}")

        # Optionally write to a file
        env_file = "stripe_price_ids.env"
        with open(env_file, "w") as f:
            f.write("# CroweCode Stripe Price IDs\n")
            f.write("# Generated by setup_stripe_pricing.py\n\n")
            for env_key, price_id in results:
                f.write(f"{env_key}={price_id}\n")
        print(f"\n📄 Price IDs also saved to: {env_file}")


if __name__ == "__main__":
    try:
        setup_crowecode_pricing()
    except KeyboardInterrupt:
        print("\n\n❌ Setup cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Setup failed with error: {e}")
        sys.exit(1)