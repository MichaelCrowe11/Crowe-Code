"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import NeuralBackground from "@/components/ui/NeuralBackground";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import FuturisticButton from "@/components/ui/FuturisticButton";
import HolographicDisplay from "@/components/ui/HolographicDisplay";
import QuantumLoader from "@/components/ui/QuantumLoader";
import {
  Github,
  Mail,
  Lock,
  User,
  ArrowRight,
  Shield,
  Zap,
  Brain,
  Chrome,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // After successful registration, sign them in automatically
        setTimeout(async () => {
          const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl: "/dashboard",
          });
          if (result?.ok) {
            router.push("/dashboard");
          }
        }, 1500);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = (provider: "github" | "google") => {
    setLoadingProvider(provider);
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Neural Background */}
      <NeuralBackground
        particleCount={60}
        connectionDistance={150}
        color="147, 51, 234"
        interactive={true}
        pulseIntensity={0.3}
      />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-40 right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute bottom-40 left-40 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, 80, 0],
          y: [0, -60, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-12">
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
              <HolographicDisplay variant="badge" color="147, 51, 234" intensity={2}>
                <div className="flex items-center gap-3 px-6 py-3">
                  <Brain className="w-8 h-8 text-purple-400" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Crowe Logic
                  </span>
                </div>
              </HolographicDisplay>
            </div>

            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Join the Future
              </span>
            </h1>
            <p className="text-gray-400">
              Create your account to get started
            </p>
          </motion.div>

          {/* Registration Card */}
          <GlassmorphicCard blur="heavy" interactive gradient>
            <div className="p-8">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2"
                >
                  <AlertCircle className="h-5 w-5" />
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 flex items-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  Account created successfully! Redirecting...
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
                    onClick={() => handleOAuthSignUp("github")}
                    disabled={loadingProvider !== null || success}
                    className="w-full relative group"
                  >
                    <HolographicDisplay variant="button" color="100, 116, 139" interactive>
                      <div className="w-full px-4 py-3 flex items-center justify-center gap-3">
                        {loadingProvider === "github" ? (
                          <QuantumLoader size="sm" variant="orbit" />
                        ) : (
                          <>
                            <Github className="h-5 w-5" />
                            <span className="font-medium">Sign up with GitHub</span>
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
                    onClick={() => handleOAuthSignUp("google")}
                    disabled={loadingProvider !== null || success}
                    className="w-full relative group"
                  >
                    <HolographicDisplay variant="button" color="234, 67, 53" interactive>
                      <div className="w-full px-4 py-3 flex items-center justify-center gap-3">
                        {loadingProvider === "google" ? (
                          <QuantumLoader size="sm" variant="orbit" />
                        ) : (
                          <>
                            <Chrome className="h-5 w-5" />
                            <span className="font-medium">Sign up with Google</span>
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
                    Or register with email
                  </span>
                </div>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleRegister} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/30 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:bg-black/50 transition-all"
                      placeholder="Michael Crowe"
                      disabled={isLoading || success}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
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
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/30 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:bg-black/50 transition-all"
                      placeholder="southwestfungi@gmail.com"
                      disabled={isLoading || success}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
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
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/30 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:bg-black/50 transition-all"
                      placeholder="••••••••"
                      disabled={isLoading || success}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/30 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:bg-black/50 transition-all"
                      placeholder="••••••••"
                      disabled={isLoading || success}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex items-center"
                >
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="rounded border-gray-600 bg-black/30"
                    disabled={isLoading || success}
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-400">
                    I agree to the{" "}
                    <Link href="/terms" className="text-purple-400 hover:text-purple-300">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
                      Privacy Policy
                    </Link>
                  </label>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <FuturisticButton
                    variant="quantum"
                    size="lg"
                    icon={isLoading || success ? undefined : <ArrowRight className="h-5 w-5" />}
                    loading={isLoading}
                    fullWidth
                    pulse
                    disabled={success}
                  >
                    {isLoading ? "Creating Account..." : success ? "Success!" : "Create Account"}
                  </FuturisticButton>
                </motion.div>
              </form>
            </div>
          </GlassmorphicCard>

          {/* Sign In Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                Sign In
              </Link>
            </p>
          </motion.div>

          {/* Features Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-6 flex justify-center"
          >
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>AI Powered</span>
              </div>
              <div className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                <span>256K Context</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}