"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import NeuralBackground from "@/components/ui/NeuralBackground";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import FuturisticButton from "@/components/ui/FuturisticButton";
import HolographicDisplay from "@/components/ui/HolographicDisplay";
import QuantumLoader from "@/components/ui/QuantumLoader";
import { Github, Mail, Lock, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";

function SignInContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        window.location.href = callbackUrl;
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: "github" | "google") => {
    setLoadingProvider(provider);
    signIn(provider, { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Neural Background */}
      <NeuralBackground
        particleCount={40}
        connectionDistance={150}
        color="59, 130, 246"
        interactive={true}
        pulseIntensity={0.3}
      />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo and Header */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center mb-6">
              <HolographicDisplay variant="badge" color="59, 130, 246" intensity={2}>
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur-md opacity-50" />
                    <Image
                      src="/crowe-avatar.png"
                      alt="Crowe Logic"
                      width={32}
                      height={32}
                      className="relative rounded-lg"
                    />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Crowe Logic
                  </span>
                </div>
              </HolographicDisplay>
            </div>

            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Welcome Back
              </span>
            </h1>
            <p className="text-gray-400">
              Sign in to access the future of development
            </p>
          </motion.div>

          {/* Sign In Card */}
          <GlassmorphicCard blur="heavy" interactive gradient>
            <div className="p-8">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2"
                >
                  <Shield className="h-5 w-5" />
                  {error}
                </motion.div>
              )}

              {/* OAuth Buttons */}
              <div className="space-y-3 mb-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <button
                    onClick={() => handleOAuthSignIn("github")}
                    disabled={loadingProvider !== null}
                    className="w-full relative group"
                  >
                    <HolographicDisplay variant="button" color="100, 116, 139" interactive>
                      <div className="w-full px-4 py-3 flex items-center justify-center gap-3">
                        {loadingProvider === "github" ? (
                          <QuantumLoader size="sm" variant="orbit" />
                        ) : (
                          <>
                            <Github className="h-5 w-5" />
                            <span className="font-medium">Continue with GitHub</span>
                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </>
                        )}
                      </div>
                    </HolographicDisplay>
                  </button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <button
                    onClick={() => handleOAuthSignIn("google")}
                    disabled={loadingProvider !== null}
                    className="w-full relative group"
                  >
                    <HolographicDisplay variant="button" color="234, 67, 53" interactive>
                      <div className="w-full px-4 py-3 flex items-center justify-center gap-3">
                        {loadingProvider === "google" ? (
                          <QuantumLoader size="sm" variant="orbit" />
                        ) : (
                          <>
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                              <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC04" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span className="font-medium">Continue with Google</span>
                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </>
                        )}
                      </div>
                    </HolographicDisplay>
                  </button>
                </motion.div>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-black/50 text-gray-400">
                    Or sign in with credentials
                  </span>
                </div>
              </div>

              {/* Credentials Form */}
              <form onSubmit={handleCredentialsSignIn} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/30 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:bg-black/50 transition-all"
                      placeholder="you@example.com"
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/30 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:bg-black/50 transition-all"
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center justify-between"
                >
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-600 bg-black/30" />
                    <span className="ml-2 text-sm text-gray-400">Remember me</span>
                  </label>
                  <Link href="/auth/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                    Forgot password?
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <FuturisticButton
                    variant="quantum"
                    size="lg"
                    icon={isLoading ? undefined : <ArrowRight className="h-5 w-5" />}
                    loading={isLoading}
                    fullWidth
                    pulse
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </FuturisticButton>
                </motion.div>
              </form>
            </div>
          </GlassmorphicCard>

          {/* Sign Up Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-medium">
                Create Account
              </Link>
            </p>
          </motion.div>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 flex justify-center"
          >
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Shield className="h-3 w-3" />
              <span>Secured with end-to-end encryption</span>
              <Zap className="h-3 w-3" />
              <span>Lightning fast authentication</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center">
      <QuantumLoader size="lg" variant="quantum" />
    </div>}>
      <SignInContent />
    </Suspense>
  );
}