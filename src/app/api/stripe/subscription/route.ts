import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth-config";
import { StripeService } from "@/lib/stripe/stripe-service";
import { PLANS } from "@/lib/stripe/stripe-config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET /api/stripe/subscription - Get current subscription
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const subscription = await StripeService.getSubscription(session.user.id);

    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        plan: PLANS.FREE,
      });
    }

    const plan = PLANS[subscription.tier as keyof typeof PLANS];

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        tier: subscription.tier,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        cancelledAt: subscription.cancelledAt,
      },
      plan,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

const updateSchema = z.object({
  action: z.enum(["cancel", "resume", "upgrade"]),
  planId: z.enum(["DEVELOPER", "TEAM", "ENTERPRISE"]).optional(),
});

// PUT /api/stripe/subscription - Update subscription
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, planId } = updateSchema.parse(body);

    const subscription = await StripeService.getSubscription(session.user.id);

    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    switch (action) {
      case "cancel":
        await StripeService.cancelSubscription(subscription.stripeSubscriptionId);
        break;

      case "resume":
        // Resume a cancelled subscription
        await StripeService.updateSubscription(
          subscription.stripeSubscriptionId,
          subscription.tier as keyof typeof PLANS
        );
        break;

      case "upgrade":
        if (!planId) {
          return NextResponse.json(
            { error: "Plan ID required for upgrade" },
            { status: 400 }
          );
        }
        await StripeService.updateSubscription(
          subscription.stripeSubscriptionId,
          planId
        );
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

// GET /api/stripe/subscription/invoices - Get invoices
export async function getInvoices(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const invoices = await StripeService.getInvoices(session.user.id);

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}