"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The sign in link is no longer valid.",
    OAuthSignin: "Error in constructing an authorization URL.",
    OAuthCallback: "Error in handling the response from OAuth provider.",
    OAuthCreateAccount: "Could not create OAuth provider user in the database.",
    EmailCreateAccount: "Could not create email provider user in the database.",
    Callback: "Error in OAuth callback handler.",
    OAuthAccountNotLinked: "Email already exists with different provider.",
    EmailSignin: "Check your email for the verification link.",
    CredentialsSignin: "Sign in failed. Check your credentials.",
    SessionRequired: "Please sign in to access this page.",
    Default: "Unable to sign in.",
  };

  const message = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-900/50 border border-red-500/30 rounded-lg p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-red-500">Authentication Error</h1>
          </div>

          <div className="mb-6">
            <p className="text-gray-300 mb-2">Error Type: <span className="text-red-400 font-mono">{error || "Unknown"}</span></p>
            <p className="text-gray-400">{message}</p>
          </div>

          {error === "OAuthCallback" && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm">
                <strong>Common causes:</strong>
              </p>
              <ul className="text-yellow-400/80 text-sm mt-2 list-disc list-inside space-y-1">
                <li>OAuth provider not configured correctly</li>
                <li>Callback URL mismatch in OAuth settings</li>
                <li>Database connection issues</li>
                <li>Missing environment variables</li>
              </ul>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              Try Again
            </Link>

            <Link
              href="/register"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Create Account with Email
            </Link>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-700 hover:bg-gray-900 rounded-lg transition-colors"
            >
              <Home className="h-5 w-5" />
              Go Home
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>If this problem persists, please contact support</p>
          <p className="mt-1">Error ID: {new Date().getTime()}</p>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading error details...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}