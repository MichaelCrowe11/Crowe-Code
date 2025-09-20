import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth-config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  preferences: z.object({
    theme: z.enum(["dark", "light", "system"]).optional(),
    language: z.string().optional(),
    fontSize: z.number().min(10).max(20).optional(),
    editorTheme: z.string().optional(),
  }).optional(),
});

// GET /api/user/profile - Get user profile
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
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        image: true,
        avatar: true,
        role: true,
        emailVerified: true,
        metadata: true,
        createdAt: true,
        lastLoginAt: true,
        twoFactorEnabled: true,
        // Include usage quota
        usageQuota: {
          select: {
            tier: true,
            aiRequestsUsed: true,
            aiRequestsLimit: true,
            storageUsedGB: true,
            storageLimitGB: true,
            buildMinutesUsed: true,
            buildMinutesLimit: true,
            apiCallsUsed: true,
            apiCallsLimit: true,
            collaboratorsLimit: true,
            privateReposLimit: true,
            customDomainsLimit: true,
            lastResetAt: true,
            nextResetAt: true,
          },
        },
        // Include customer info if exists
        customer: {
          select: {
            stripeCustomerId: true,
            currency: true,
            subscriptions: {
              select: {
                tier: true,
                status: true,
                currentPeriodEnd: true,
                cancelAtPeriodEnd: true,
              },
            },
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

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - Update user profile
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
    const validatedData = updateProfileSchema.parse(body);

    const updateData: any = {};

    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.firstName) updateData.firstName = validatedData.firstName;
    if (validatedData.lastName) updateData.lastName = validatedData.lastName;
    if (validatedData.bio) {
      updateData.metadata = {
        ...(await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { metadata: true },
        }))?.metadata as any,
        bio: validatedData.bio,
      };
    }
    if (validatedData.avatar) updateData.avatar = validatedData.avatar;
    if (validatedData.preferences) {
      updateData.metadata = {
        ...(await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { metadata: true },
        }))?.metadata as any,
        preferences: validatedData.preferences,
      };
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        image: true,
        avatar: true,
        role: true,
        metadata: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}