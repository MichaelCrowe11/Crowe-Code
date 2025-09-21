"use client";

import { useState, useEffect } from "react";
import { signIn, signOut, useSession, getProviders } from "next-auth/react";
import {
  Github,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  User,
  Key,
  Globe,
  Shield,
  Terminal,
  Settings,
  LogIn,
  LogOut,
  Activity
} from "lucide-react";

interface DebugInfo {
  success: boolean;
  healthy: boolean;
  environment: string;
  session: any;
  configuration: any;
  providers: any;
  requiredUrls: any;
  healthChecks: any;
  recommendations: string[];
}

function OAuthTestPageContent() {
  const { data: session, status, update } = useSession();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [providers, setProviders] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadProviders();
    runDebugCheck();
  }, []);

  const loadProviders = async () => {
    try {
      const res = await getProviders();
      setProviders(res);
    } catch (err) {
      console.error("Failed to load providers:", err);
    }
  };

  const runDebugCheck = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/debug-oauth");
      const data = await response.json();
      setDebugInfo(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testEndpoint = async (endpoint: string) => {
    try {
      const response = await fetch(endpoint);
      const contentType = response.headers.get("content-type");
      const isJson = contentType?.includes("application/json");

      const data = isJson ? await response.json() : await response.text();

      setTestResults((prev: any) => ({
        ...prev,
        [endpoint]: {
          status: response.status,
          ok: response.ok,
          contentType,
          data: data,
        },
      }));
    } catch (err: any) {
      setTestResults((prev: any) => ({
        ...prev,
        [endpoint]: {
          error: err.message,
        },
      }));
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSignIn = async (providerId: string) => {
    try {
      const result = await signIn(providerId, {
        callbackUrl: window.location.origin + "/dashboard",
      });
      console.log("Sign in result:", result);
    } catch (error) {
      console.error("Sign in error:", error);
      setError(`Sign in failed: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-blue-950/20 to-purple-950/20 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-blue-400" />
            OAuth Authentication Test & Debug
          </h1>
          <p className="text-white/60">
            Comprehensive OAuth testing and debugging for CroweCode Platform
          </p>
        </div>

        {/* Session Status */}
        <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Current Session
            </h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              status === "authenticated"
                ? "bg-green-500/20 text-green-400 border border-green-400/30"
                : status === "loading"
                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-400/30"
                : "bg-red-500/20 text-red-400 border border-red-400/30"
            }`}>
              {status === "loading" ? (
                <RefreshCw className="w-4 h-4 animate-spin inline mr-1" />
              ) : null}
              {status}
            </div>
          </div>

          {session ? (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <p className="text-white font-medium">{session.user?.name || "No name"}</p>
                  <p className="text-white/60 text-sm">{session.user?.email || "No email"}</p>
                </div>
              </div>

              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-white/60">Not authenticated</p>

              {/* OAuth Provider Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleSignIn("github")}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Github className="w-5 h-5" />
                  Sign in with GitHub
                </button>

                <button
                  onClick={() => handleSignIn("google")}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Sign in with Google
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Debug Information */}
        {isLoading ? (
          <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-6 mb-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
              <span className="ml-2 text-white">Loading debug information...</span>
            </div>
          </div>
        ) : debugInfo ? (
          <>
            {/* Health Status */}
            <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" />
                Health Status
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border ${
                  debugInfo.healthChecks.nextAuthUrlValid
                    ? "bg-green-500/10 border-green-400/30"
                    : "bg-red-500/10 border-red-400/30"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {debugInfo.healthChecks.nextAuthUrlValid ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-white font-medium">NextAuth URL</span>
                  </div>
                  <p className="text-white/60 text-sm">{debugInfo.configuration.nextAuthUrl}</p>
                </div>

                <div className={`p-4 rounded-lg border ${
                  debugInfo.healthChecks.secretConfigured
                    ? "bg-green-500/10 border-green-400/30"
                    : "bg-red-500/10 border-red-400/30"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {debugInfo.healthChecks.secretConfigured ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-white font-medium">NextAuth Secret</span>
                  </div>
                  <p className="text-white/60 text-sm">
                    {debugInfo.healthChecks.secretConfigured ? "Configured" : "Not configured"}
                  </p>
                </div>

                <div className={`p-4 rounded-lg border ${
                  debugInfo.healthChecks.atLeastOneProviderConfigured
                    ? "bg-green-500/10 border-green-400/30"
                    : "bg-red-500/10 border-red-400/30"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {debugInfo.healthChecks.atLeastOneProviderConfigured ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-white font-medium">OAuth Providers</span>
                  </div>
                  <p className="text-white/60 text-sm">
                    {debugInfo.healthChecks.atLeastOneProviderConfigured
                      ? "At least one configured"
                      : "No providers configured"}
                  </p>
                </div>
              </div>
            </div>

            {/* Provider Configuration */}
            <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-yellow-400" />
                Provider Configuration
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* GitHub */}
                <div className="p-4 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Github className="w-5 h-5 text-white" />
                      <span className="text-white font-medium">GitHub OAuth</span>
                    </div>
                    {debugInfo.providers.github.configured ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Client ID:</span>
                      <span className={debugInfo.providers.github.clientIdSet ? "text-green-400" : "text-red-400"}>
                        {debugInfo.providers.github.clientIdSet ? "Set" : "Not set"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Client Secret:</span>
                      <span className={debugInfo.providers.github.clientSecretSet ? "text-green-400" : "text-red-400"}>
                        {debugInfo.providers.github.clientSecretSet ? "Set" : "Not set"}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-white/60 text-xs mb-1">Callback URL:</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-blue-400 bg-black/30 px-2 py-1 rounded flex-1 overflow-x-auto">
                          {debugInfo.providers.github.expectedCallbackUrl}
                        </code>
                        <button
                          onClick={() => copyToClipboard(debugInfo.providers.github.expectedCallbackUrl, "github-callback")}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          {copied === "github-callback" ? (
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-white/60" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Google */}
                <div className="p-4 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-white" />
                      <span className="text-white font-medium">Google OAuth</span>
                    </div>
                    {debugInfo.providers.google.configured ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Client ID:</span>
                      <span className={debugInfo.providers.google.clientIdSet ? "text-green-400" : "text-red-400"}>
                        {debugInfo.providers.google.clientIdSet ? "Set" : "Not set"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Client Secret:</span>
                      <span className={debugInfo.providers.google.clientSecretSet ? "text-green-400" : "text-red-400"}>
                        {debugInfo.providers.google.clientSecretSet ? "Set" : "Not set"}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-white/60 text-xs mb-1">Callback URL:</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-blue-400 bg-black/30 px-2 py-1 rounded flex-1 overflow-x-auto">
                          {debugInfo.providers.google.expectedCallbackUrl}
                        </code>
                        <button
                          onClick={() => copyToClipboard(debugInfo.providers.google.expectedCallbackUrl, "google-callback")}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          {copied === "google-callback" ? (
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-white/60" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {debugInfo.recommendations.length > 0 && (
              <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  Recommendations
                </h2>

                <div className="space-y-2">
                  {debugInfo.recommendations.map((rec: string, index: number) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        rec.includes("✅")
                          ? "bg-green-500/10 border-green-400/30"
                          : rec.includes("❌")
                          ? "bg-red-500/10 border-red-400/30"
                          : "bg-yellow-500/10 border-yellow-400/30"
                      }`}
                    >
                      <p className="text-white text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Endpoint Tests */}
            <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-400" />
                Endpoint Tests
              </h2>

              <div className="space-y-3">
                {Object.entries(debugInfo.requiredUrls).map(([key, url]: [string, any]) => (
                  <div key={key} className="flex items-center gap-3">
                    <button
                      onClick={() => testEndpoint(url)}
                      className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-sm flex items-center gap-2"
                    >
                      Test
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <code className="text-sm text-white/60 flex-1">{url}</code>
                    {testResults[url] && (
                      <span className={`text-sm ${
                        testResults[url].ok ? "text-green-400" : "text-red-400"
                      }`}>
                        {testResults[url].status || testResults[url].error}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Actions & Quick Fixes
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={runDebugCheck}
                  className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Debug Info
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  Reload Page
                </button>

                <button
                  onClick={() => update()}
                  className="px-4 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Update Session
                </button>
              </div>
            </div>
          </>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">Error Loading Debug Info</span>
            </div>
            <p className="text-white/60">{error}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// Wrap in dynamic to prevent SSR issues
import dynamic from "next/dynamic";

const OAuthTestPage = dynamic(() => Promise.resolve(OAuthTestPageContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-blue-950/20 to-purple-950/20 p-8 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <RefreshCw className="h-5 h-5 animate-spin text-blue-400" />
        <span className="text-white/60">Loading OAuth test...</span>
      </div>
    </div>
  )
});

export default OAuthTestPage;