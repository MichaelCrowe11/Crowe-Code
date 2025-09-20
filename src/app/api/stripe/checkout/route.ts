import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth-config";
import { StripeService } from "@/lib/stripe/stripe-service";
import { PLANS } from "@/lib/stripe/stripe-config";
import { z } from "zod";

const checkoutSchema = z.object({
  planId: z.enum(["DEVELOPER", "TEAM", "ENTERPRISE"]),
});

// POST /api/stripe/checkout - Create checkout session
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { planId } = checkoutSchema.parse(body);

    const origin = req.headers.get("origin") || "https://crowecode.com";
    const successUrl = `${origin}/dashboard?tab=billing&success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/dashboard?tab=billing&cancelled=true`;

    const checkoutSession = await StripeService.createCheckoutSession(
      session.user.id,
      planId,
      successUrl,
      cancelUrl
    );

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid plan selected", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}