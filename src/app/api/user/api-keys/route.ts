import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth-config";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { z } from "zod";

const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.string()).optional(),
  expiresAt: z.string().datetime().optional(),
});

// Generate a secure API key
function generateApiKey(): string {
  const prefix = "clp_live_sk";
  const randomPart = randomBytes(32).toString("base64url");
  return `${prefix}_${randomPart}`;
}

// Hash API key for storage
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// GET /api/user/api-keys - List user's API keys
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
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        key: true, // This will be hashed, so we only show last 4 chars
        permissions: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Mask the API keys, only showing last 4 characters
    const maskedKeys = apiKeys.map(key => ({
      ...key,
      key: `${key.key.slice(0, 15)}...${key.key.slice(-4)}`,
    }));

    return NextResponse.json(maskedKeys);
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/user/api-keys - Create a new API key
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
    const validatedData = createApiKeySchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has reached API key limit
    const existingKeysCount = await prisma.apiKey.count({
      where: { userId: user.id },
    });

    if (existingKeysCount >= 10) {
      return NextResponse.json(
        { error: "API key limit reached. Please delete unused keys." },
        { status: 400 }
      );
    }

    // Generate the actual API key
    const apiKey = generateApiKey();
    const hashedKey = await hashApiKey(apiKey);

    // Create the API key record with hashed key
    const createdKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        key: hashedKey,
        permissions: validatedData.permissions || ["read", "write"],
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
      },
      select: {
        id: true,
        name: true,
        permissions: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    // Return the actual key only on creation (won't be shown again)
    return NextResponse.json({
      ...createdKey,
      key: apiKey, // Return the unhashed key only once
      message: "Save this API key securely. You won't be able to see it again.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/user/api-keys/[id] - Delete an API key
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const keyId = url.pathname.split("/").pop();

    if (!keyId) {
      return NextResponse.json(
        { error: "API key ID required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify the key belongs to the user
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId: user.id,
      },
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      );
    }

    // Delete the API key
    await prisma.apiKey.delete({
      where: { id: keyId },
    });

    return NextResponse.json({ message: "API key deleted successfully" });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}