import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth-config";
import { StripeService } from "@/lib/stripe/stripe-service";

// POST /api/stripe/portal - Create billing portal session
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const origin = req.headers.get("origin") || "https://crowecode.com";
    const returnUrl = `${origin}/dashboard?tab=billing`;

    const portalSession = await StripeService.createPortalSession(
      session.user.id,
      returnUrl
    );

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}