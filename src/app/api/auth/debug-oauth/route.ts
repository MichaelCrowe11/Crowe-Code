import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth-config";

export async function GET(request: NextRequest) {
  try {
    // Get current session
    const session = await getServerSession(authOptions);

    // Check environment variables (safely)
    const hasGitHubId = !!process.env.GITHUB_CLIENT_ID;
    const hasGitHubSecret = !!process.env.GITHUB_CLIENT_SECRET;
    const hasGoogleId = !!process.env.GOOGLE_CLIENT_ID;
    const hasGoogleSecret = !!process.env.GOOGLE_CLIENT_SECRET;
    const hasNextAuthUrl = !!process.env.NEXTAUTH_URL;
    const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;

    // Validate callback URLs
    const nextAuthUrl = process.env.NEXTAUTH_URL || "Not set";
    const expectedGitHubCallback = `${nextAuthUrl}/api/auth/callback/github`;
    const expectedGoogleCallback = `${nextAuthUrl}/api/auth/callback/google`;

    // Debug information
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,

      session: {
        exists: !!session,
        user: session?.user ? {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        } : null,
      },

      configuration: {
        nextAuthUrl: nextAuthUrl,
        hasNextAuthSecret: hasNextAuthSecret,
        authJsVersion: "4.x (NextAuth)",
      },

      providers: {
        github: {
          clientIdSet: hasGitHubId,
          clientSecretSet: hasGitHubSecret,
          clientIdLength: process.env.GITHUB_CLIENT_ID?.length || 0,
          expectedCallbackUrl: expectedGitHubCallback,
          configured: hasGitHubId && hasGitHubSecret,
        },
        google: {
          clientIdSet: hasGoogleId,
          clientSecretSet: hasGoogleSecret,
          clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
          expectedCallbackUrl: expectedGoogleCallback,
          configured: hasGoogleId && hasGoogleSecret,
        },
      },

      requiredUrls: {
        signIn: `${nextAuthUrl}/api/auth/signin`,
        signOut: `${nextAuthUrl}/api/auth/signout`,
        callback: `${nextAuthUrl}/api/auth/callback/[provider]`,
        session: `${nextAuthUrl}/api/auth/session`,
        csrf: `${nextAuthUrl}/api/auth/csrf`,
      },

      healthChecks: {
        nextAuthUrlValid: nextAuthUrl.startsWith("http"),
        secretConfigured: hasNextAuthSecret,
        atLeastOneProviderConfigured: (hasGitHubId && hasGitHubSecret) || (hasGoogleId && hasGoogleSecret),
      },

      recommendations: [],
    };

    // Add recommendations based on issues
    if (!hasNextAuthUrl) {
      debugInfo.recommendations.push("❌ CRITICAL: Set NEXTAUTH_URL environment variable");
    }
    if (!hasNextAuthSecret) {
      debugInfo.recommendations.push("❌ CRITICAL: Set NEXTAUTH_SECRET environment variable");
    }
    if (!hasGitHubId || !hasGitHubSecret) {
      debugInfo.recommendations.push("⚠️ GitHub OAuth not fully configured");
    }
    if (!hasGoogleId || !hasGoogleSecret) {
      debugInfo.recommendations.push("⚠️ Google OAuth not fully configured");
    }

    // Check for common issues
    if (nextAuthUrl.includes("localhost") && process.env.NODE_ENV === "production") {
      debugInfo.recommendations.push("❌ NEXTAUTH_URL contains 'localhost' in production");
    }

    if (process.env.GITHUB_CLIENT_ID?.length !== 20) {
      debugInfo.recommendations.push("⚠️ GitHub Client ID might be invalid (should be 20 characters)");
    }

    const allHealthy = debugInfo.healthChecks.nextAuthUrlValid &&
                       debugInfo.healthChecks.secretConfigured &&
                       debugInfo.healthChecks.atLeastOneProviderConfigured;

    if (allHealthy) {
      debugInfo.recommendations.push("✅ OAuth configuration appears healthy");
    }

    return NextResponse.json({
      success: true,
      healthy: allHealthy,
      ...debugInfo,
    });

  } catch (error: any) {
    console.error("OAuth debug error:", error);

    return NextResponse.json({
      success: false,
      error: error.message || "Failed to debug OAuth",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    }, { status: 500 });
  }
}