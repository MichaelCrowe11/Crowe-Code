import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe, STRIPE_WEBHOOK_SECRET, PLANS } from "@/lib/stripe/stripe-config";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// POST /api/stripe/webhook - Handle Stripe webhook events
export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 500 }
    );
  }

  const body = await req.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId as keyof typeof PLANS;

  if (!userId || !planId) {
    console.error("Missing metadata in checkout session");
    return;
  }

  const customer = await prisma.customer.findUnique({
    where: { userId },
  });

  if (!customer) {
    console.error("Customer not found for userId:", userId);
    return;
  }

  // Create subscription record
  if (session.subscription) {
    const subscription = await stripe!.subscriptions.retrieve(
      session.subscription as string
    );

    await prisma.subscription.create({
      data: {
        customerId: customer.id,
        stripeSubscriptionId: subscription.id,
        tier: planId,
        status: subscription.status.toUpperCase() as any,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        metadata: {
          checkoutSessionId: session.id,
        },
      },
    });

    // Update user's quota based on new plan
    const plan = PLANS[planId];
    await prisma.usageQuota.upsert({
      where: { userId },
      create: {
        userId,
        tier: planId,
        aiRequestsLimit: plan.features.aiRequests,
        storageLimitGB: plan.features.storageGB,
        buildMinutesLimit: plan.features.buildMinutes,
        apiCallsLimit: plan.features.apiCalls,
        collaboratorsLimit: plan.features.collaborators,
        privateReposLimit: plan.features.privateRepos,
        customDomainsLimit: plan.features.customDomains,
        aiRequestsUsed: 0,
        storageUsedGB: 0,
        buildMinutesUsed: 0,
        terminalMinutesUsed: 0,
        apiCallsUsed: 0,
        terminalMinutesLimit: 1000,
        nextResetAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      },
      update: {
        tier: planId,
        aiRequestsLimit: plan.features.aiRequests,
        storageLimitGB: plan.features.storageGB,
        buildMinutesLimit: plan.features.buildMinutes,
        apiCallsLimit: plan.features.apiCalls,
        collaboratorsLimit: plan.features.collaborators,
        privateReposLimit: plan.features.privateRepos,
        customDomainsLimit: plan.features.customDomains,
      },
    });

    // Log the payment
    await prisma.payment.create({
      data: {
        customerId: customer.id,
        amount: session.amount_total || 0,
        currency: session.currency || "usd",
        status: "SUCCEEDED",
        stripePaymentIntentId: session.payment_intent as string,
        metadata: {
          checkoutSessionId: session.id,
          planId,
        },
      },
    });
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const customer = await prisma.customer.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!customer) {
    console.error("Customer not found for Stripe ID:", customerId);
    return;
  }

  // Get the plan from price ID
  let planId: keyof typeof PLANS = "FREE";
  const priceId = subscription.items.data[0]?.price.id;

  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) {
      planId = key as keyof typeof PLANS;
      break;
    }
  }

  // Update or create subscription
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      customerId: customer.id,
      stripeSubscriptionId: subscription.id,
      tier: planId,
      status: subscription.status.toUpperCase() as any,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      tier: planId,
      status: subscription.status.toUpperCase() as any,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  // Update user's quota
  const plan = PLANS[planId];
  const user = await prisma.user.findUnique({
    where: { id: customer.userId },
  });

  if (user) {
    await prisma.usageQuota.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        tier: planId,
        aiRequestsLimit: plan.features.aiRequests,
        storageLimitGB: plan.features.storageGB,
        buildMinutesLimit: plan.features.buildMinutes,
        apiCallsLimit: plan.features.apiCalls,
        collaboratorsLimit: plan.features.collaborators,
        privateReposLimit: plan.features.privateRepos,
        customDomainsLimit: plan.features.customDomains,
        aiRequestsUsed: 0,
        storageUsedGB: 0,
        buildMinutesUsed: 0,
        terminalMinutesUsed: 0,
        apiCallsUsed: 0,
        terminalMinutesLimit: 1000,
        nextResetAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      },
      update: {
        tier: planId,
        aiRequestsLimit: plan.features.aiRequests,
        storageLimitGB: plan.features.storageGB,
        buildMinutesLimit: plan.features.buildMinutes,
        apiCallsLimit: plan.features.apiCalls,
        collaboratorsLimit: plan.features.collaborators,
        privateReposLimit: plan.features.privateRepos,
        customDomainsLimit: plan.features.customDomains,
      },
    });
  }
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
    },
  });

  // Reset user to FREE tier
  const customer = await prisma.customer.findFirst({
    where: { stripeCustomerId: subscription.customer as string },
  });

  if (customer) {
    const freePlan = PLANS.FREE;
    await prisma.usageQuota.update({
      where: { userId: customer.userId },
      data: {
        tier: "FREE",
        aiRequestsLimit: freePlan.features.aiRequests,
        storageLimitGB: freePlan.features.storageGB,
        buildMinutesLimit: freePlan.features.buildMinutes,
        apiCallsLimit: freePlan.features.apiCalls,
        collaboratorsLimit: freePlan.features.collaborators,
        privateReposLimit: freePlan.features.privateRepos,
        customDomainsLimit: freePlan.features.customDomains,
      },
    });
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customer = await prisma.customer.findFirst({
    where: { stripeCustomerId: invoice.customer as string },
  });

  if (!customer) return;

  await prisma.payment.create({
    data: {
      customerId: customer.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: "SUCCEEDED",
      stripePaymentIntentId: invoice.payment_intent as string,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
      },
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customer = await prisma.customer.findFirst({
    where: { stripeCustomerId: invoice.customer as string },
  });

  if (!customer) return;

  await prisma.payment.create({
    data: {
      customerId: customer.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: "FAILED",
      stripePaymentIntentId: invoice.payment_intent as string,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        failureReason: "Payment failed",
      },
    },
  });

  // TODO: Send email notification to user about payment failure
}