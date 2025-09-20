import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth-config";
import { prisma } from "@/lib/prisma";

// GET /api/user/usage - Get user's usage statistics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        usageQuota: true,
        customer: {
          include: {
            subscriptions: {
              where: {
                status: {
                  in: ["ACTIVE", "TRIALING"],
                },
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
            usageRecords: {
              where: {
                timestamp: {
                  gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of current month
                },
              },
              orderBy: {
                timestamp: "desc",
              },
            },
          },
        },
        apiKeys: {
          select: {
            id: true,
            name: true,
            lastUsedAt: true,
          },
        },
        farms: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate usage statistics
    const currentSubscription = user.customer?.subscriptions[0];
    const tier = currentSubscription?.tier || "FREE";

    // Default limits based on tier
    const tierLimits = {
      FREE: {
        aiRequests: 1000,
        storage: 1, // GB
        buildMinutes: 100,
        apiCalls: 10000,
        collaborators: 1,
        privateRepos: 3,
        customDomains: 0,
      },
      DEVELOPER: {
        aiRequests: 50000,
        storage: 10,
        buildMinutes: 1000,
        apiCalls: 100000,
        collaborators: 5,
        privateRepos: 50,
        customDomains: 1,
      },
      TEAM: {
        aiRequests: 200000,
        storage: 50,
        buildMinutes: 5000,
        apiCalls: 500000,
        collaborators: 20,
        privateRepos: 200,
        customDomains: 5,
      },
      ENTERPRISE: {
        aiRequests: -1, // Unlimited
        storage: 500,
        buildMinutes: -1,
        apiCalls: -1,
        collaborators: -1,
        privateRepos: -1,
        customDomains: -1,
      },
    };

    const limits = tierLimits[tier as keyof typeof tierLimits] || tierLimits.FREE;

    // Calculate actual usage from usage records
    const usageByType = user.customer?.usageRecords.reduce((acc, record) => {
      acc[record.type] = (acc[record.type] || 0) + record.quantity;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get or create usage quota
    let usageQuota = user.usageQuota;
    if (!usageQuota) {
      usageQuota = await prisma.usageQuota.create({
        data: {
          userId: user.id,
          tier: tier as any,
          aiRequestsLimit: limits.aiRequests,
          storageLimitGB: limits.storage,
          buildMinutesLimit: limits.buildMinutes,
          terminalMinutesLimit: 1000,
          apiCallsLimit: limits.apiCalls,
          collaboratorsLimit: limits.collaborators,
          privateReposLimit: limits.privateRepos,
          customDomainsLimit: limits.customDomains,
          aiRequestsUsed: 0,
          storageUsedGB: 0,
          buildMinutesUsed: 0,
          terminalMinutesUsed: 0,
          apiCallsUsed: 0,
          nextResetAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), // First day of next month
        },
      });
    }

    // Check if quota needs to be reset (monthly)
    if (usageQuota.nextResetAt < new Date()) {
      usageQuota = await prisma.usageQuota.update({
        where: { id: usageQuota.id },
        data: {
          aiRequestsUsed: 0,
          buildMinutesUsed: 0,
          terminalMinutesUsed: 0,
          apiCallsUsed: 0,
          lastResetAt: new Date(),
          nextResetAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      });
    }

    // Calculate percentages
    const calculatePercentage = (used: number, limit: number) => {
      if (limit === -1) return 0; // Unlimited
      return Math.min(100, Math.round((used / limit) * 100));
    };

    const usage = {
      tier,
      subscription: currentSubscription ? {
        status: currentSubscription.status,
        currentPeriodEnd: currentSubscription.currentPeriodEnd,
        cancelAtPeriodEnd: currentSubscription.cancelAtPeriodEnd,
      } : null,
      limits: {
        aiRequests: usageQuota.aiRequestsLimit,
        storage: usageQuota.storageLimitGB,
        buildMinutes: usageQuota.buildMinutesLimit,
        apiCalls: usageQuota.apiCallsLimit,
        collaborators: usageQuota.collaboratorsLimit,
        privateRepos: usageQuota.privateReposLimit,
        customDomains: usageQuota.customDomainsLimit,
      },
      usage: {
        aiRequests: {
          used: usageQuota.aiRequestsUsed,
          limit: usageQuota.aiRequestsLimit,
          percentage: calculatePercentage(usageQuota.aiRequestsUsed, usageQuota.aiRequestsLimit),
          unlimited: usageQuota.aiRequestsLimit === -1,
        },
        storage: {
          used: usageQuota.storageUsedGB,
          limit: usageQuota.storageLimitGB,
          percentage: calculatePercentage(usageQuota.storageUsedGB, usageQuota.storageLimitGB),
          unlimited: false,
        },
        buildMinutes: {
          used: usageQuota.buildMinutesUsed,
          limit: usageQuota.buildMinutesLimit,
          percentage: calculatePercentage(usageQuota.buildMinutesUsed, usageQuota.buildMinutesLimit),
          unlimited: usageQuota.buildMinutesLimit === -1,
        },
        apiCalls: {
          used: usageQuota.apiCallsUsed,
          limit: usageQuota.apiCallsLimit,
          percentage: calculatePercentage(usageQuota.apiCallsUsed, usageQuota.apiCallsLimit),
          unlimited: usageQuota.apiCallsLimit === -1,
        },
        collaborators: {
          used: user.farms.length, // Assuming farms = projects with collaborators
          limit: usageQuota.collaboratorsLimit,
          percentage: calculatePercentage(user.farms.length, usageQuota.collaboratorsLimit),
          unlimited: usageQuota.collaboratorsLimit === -1,
        },
      },
      resetDate: usageQuota.nextResetAt,
      lastReset: usageQuota.lastResetAt,
    };

    return NextResponse.json(usage);
  } catch (error) {
    console.error("Error fetching usage statistics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/user/usage/track - Track usage (internal endpoint)
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
    const { type, quantity = 1, metadata } = body;

    const validTypes = [
      "AI_REQUEST",
      "FILE_STORAGE",
      "BUILD_MINUTES",
      "TERMINAL_MINUTES",
      "API_CALL",
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid usage type" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        usageQuota: true,
        customer: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update usage quota
    if (user.usageQuota) {
      const updateData: any = {};

      switch (type) {
        case "AI_REQUEST":
          updateData.aiRequestsUsed = { increment: quantity };
          break;
        case "BUILD_MINUTES":
          updateData.buildMinutesUsed = { increment: quantity };
          break;
        case "TERMINAL_MINUTES":
          updateData.terminalMinutesUsed = { increment: quantity };
          break;
        case "API_CALL":
          updateData.apiCallsUsed = { increment: quantity };
          break;
        case "FILE_STORAGE":
          updateData.storageUsedGB = { increment: quantity };
          break;
      }

      await prisma.usageQuota.update({
        where: { id: user.usageQuota.id },
        data: updateData,
      });
    }

    // Record usage for billing if customer exists
    if (user.customer) {
      await prisma.usageRecord.create({
        data: {
          customerId: user.customer.id,
          type: type as any,
          quantity,
          metadata,
        },
      });
    }

    return NextResponse.json({ message: "Usage tracked successfully" });
  } catch (error) {
    console.error("Error tracking usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}