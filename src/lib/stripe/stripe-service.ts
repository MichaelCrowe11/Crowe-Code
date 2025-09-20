import { stripe, PLANS, USAGE_PRICING } from "./stripe-config";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export class StripeService {
  // Create a Stripe customer for a user
  static async createCustomer(userId: string, email: string, name?: string) {
    if (!stripe) throw new Error("Stripe is not configured");

    try {
      // Check if customer already exists
      const existingCustomer = await prisma.customer.findUnique({
        where: { userId },
      });

      if (existingCustomer?.stripeCustomerId) {
        return existingCustomer.stripeCustomerId;
      }

      // Create Stripe customer
      const customer = await stripe.customers.create({
        email,
        name: name || undefined,
        metadata: {
          userId,
        },
      });

      // Store in database
      await prisma.customer.upsert({
        where: { userId },
        create: {
          userId,
          stripeCustomerId: customer.id,
          email,
          name,
        },
        update: {
          stripeCustomerId: customer.id,
          email,
          name,
        },
      });

      return customer.id;
    } catch (error) {
      console.error("Error creating Stripe customer:", error);
      throw error;
    }
  }

  // Create a checkout session for subscription
  static async createCheckoutSession(
    userId: string,
    planId: keyof typeof PLANS,
    successUrl: string,
    cancelUrl: string
  ) {
    if (!stripe) throw new Error("Stripe is not configured");

    const plan = PLANS[planId];
    if (!plan.priceId) {
      throw new Error("Invalid plan selected");
    }

    // Get or create customer
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { customer: true },
    });

    if (!user) throw new Error("User not found");

    let stripeCustomerId = user.customer?.stripeCustomerId;
    if (!stripeCustomerId) {
      stripeCustomerId = await this.createCustomer(userId, user.email, user.name || undefined);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planId,
      },
      subscription_data: {
        metadata: {
          userId,
          planId,
        },
      },
      allow_promotion_codes: true,
    });

    return session;
  }

  // Create a portal session for managing subscription
  static async createPortalSession(userId: string, returnUrl: string) {
    if (!stripe) throw new Error("Stripe is not configured");

    const customer = await prisma.customer.findUnique({
      where: { userId },
    });

    if (!customer?.stripeCustomerId) {
      throw new Error("No customer found");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripeCustomerId,
      return_url: returnUrl,
    });

    return session;
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId: string, immediately = false) {
    if (!stripe) throw new Error("Stripe is not configured");

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: !immediately,
      ...(immediately && { prorate: false }),
    });

    // Update database
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscriptionId },
      data: {
        status: immediately ? "CANCELLED" : "ACTIVE",
        cancelAtPeriodEnd: !immediately,
        cancelledAt: new Date(),
      },
    });

    return subscription;
  }

  // Update subscription
  static async updateSubscription(
    subscriptionId: string,
    newPlanId: keyof typeof PLANS
  ) {
    if (!stripe) throw new Error("Stripe is not configured");

    const plan = PLANS[newPlanId];
    if (!plan.priceId) {
      throw new Error("Invalid plan selected");
    }

    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update to new plan
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: plan.priceId,
          },
        ],
        proration_behavior: "create_prorations",
      }
    );

    // Update database
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscriptionId },
      data: {
        tier: newPlanId,
      },
    });

    return updatedSubscription;
  }

  // Record usage for metered billing
  static async recordUsage(
    userId: string,
    usageType: keyof typeof USAGE_PRICING,
    quantity: number
  ) {
    if (!stripe) throw new Error("Stripe is not configured");

    const customer = await prisma.customer.findUnique({
      where: { userId },
      include: {
        subscriptions: {
          where: {
            status: "ACTIVE",
          },
        },
      },
    });

    if (!customer?.subscriptions[0]) {
      // No active subscription, just track in database
      return;
    }

    const subscription = customer.subscriptions[0];
    const pricing = USAGE_PRICING[usageType];

    if (!pricing.meteredPriceId) {
      console.warn(`No metered price ID configured for ${usageType}`);
      return;
    }

    try {
      // Find the subscription item for this metered price
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
      );

      const meteredItem = stripeSubscription.items.data.find(
        (item) => item.price.id === pricing.meteredPriceId
      );

      if (meteredItem) {
        // Record usage in Stripe
        await stripe.subscriptionItems.createUsageRecord(
          meteredItem.id,
          {
            quantity,
            timestamp: Math.floor(Date.now() / 1000),
          }
        );
      }
    } catch (error) {
      console.error(`Error recording usage for ${usageType}:`, error);
    }

    // Always record in our database
    await prisma.usageRecord.create({
      data: {
        customerId: customer.id,
        type: usageType as any,
        quantity,
        metadata: {
          recorded: true,
        },
      },
    });
  }

  // Get subscription details
  static async getSubscription(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        customer: {
          userId,
        },
        status: {
          in: ["ACTIVE", "TRIALING"],
        },
      },
      include: {
        customer: true,
      },
    });

    if (!subscription || !stripe) {
      return null;
    }

    try {
      // Get latest details from Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
      );

      // Update local database with latest status
      if (stripeSubscription.status !== subscription.status.toLowerCase()) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: stripeSubscription.status.toUpperCase() as any,
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          },
        });
      }

      return {
        ...subscription,
        stripeDetails: stripeSubscription,
      };
    } catch (error) {
      console.error("Error fetching Stripe subscription:", error);
      return subscription;
    }
  }

  // Get invoices for a user
  static async getInvoices(userId: string, limit = 10) {
    if (!stripe) return [];

    const customer = await prisma.customer.findUnique({
      where: { userId },
    });

    if (!customer?.stripeCustomerId) {
      return [];
    }

    const invoices = await stripe.invoices.list({
      customer: customer.stripeCustomerId,
      limit,
    });

    return invoices.data.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: invoice.status,
      created: new Date(invoice.created * 1000),
      pdfUrl: invoice.invoice_pdf,
      hostedUrl: invoice.hosted_invoice_url,
    }));
  }

  // Get payment methods
  static async getPaymentMethods(userId: string) {
    if (!stripe) return [];

    const customer = await prisma.customer.findUnique({
      where: { userId },
    });

    if (!customer?.stripeCustomerId) {
      return [];
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.stripeCustomerId,
      type: "card",
    });

    return paymentMethods.data.map(pm => ({
      id: pm.id,
      brand: pm.card?.brand,
      last4: pm.card?.last4,
      expMonth: pm.card?.exp_month,
      expYear: pm.card?.exp_year,
      isDefault: pm.id === customer.defaultPaymentMethodId,
    }));
  }
}