"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  KeyRound,
  Fingerprint,
  ScanLine,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const { user, isLoading: authLoading, supabase } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const unauthorizedError = searchParams.get("error") === "unauthorized";

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/admin/dashboard");
    }
  }, [user, authLoading, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsSubmitting(false);
      return;
    }

    router.push("/admin/dashboard");
  };

  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060d19]">
        <Loader2 className="w-8 h-8 text-[var(--accent-teal)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#060d19]">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Background gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#0B2A4F]" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, rgba(6,182,212,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(6,182,212,0.1) 0%, transparent 50%)",
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating security icons */}
        <motion.div
          className="absolute top-[15%] left-[12%]"
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/[0.07] border border-white/[0.10] backdrop-blur-sm flex items-center justify-center">
            <Shield className="w-7 h-7 text-cyan-400/80" />
          </div>
        </motion.div>

        <motion.div
          className="absolute top-[35%] right-[15%]"
          animate={{ y: [0, 12, 0], rotate: [0, -3, 0] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <div className="w-12 h-12 rounded-xl bg-white/[0.07] border border-white/[0.10] backdrop-blur-sm flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-cyan-400/70" />
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-[30%] left-[20%]"
          animate={{ y: [0, -10, 0], rotate: [0, -5, 0] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        >
          <div className="w-11 h-11 rounded-xl bg-white/[0.07] border border-white/[0.10] backdrop-blur-sm flex items-center justify-center">
            <Fingerprint className="w-5 h-5 text-cyan-400/60" />
          </div>
        </motion.div>

        <motion.div
          className="absolute top-[60%] right-[25%]"
          animate={{ y: [0, 8, 0], rotate: [0, 4, 0] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          <div className="w-10 h-10 rounded-lg bg-white/[0.07] border border-white/[0.10] backdrop-blur-sm flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-cyan-400/60" />
          </div>
        </motion.div>

        {/* Glowing orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/[0.03] blur-[100px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12 lg:p-16">
          {/* Top - Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-base font-bold text-white tracking-tight">
                JD
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm tracking-wide" style={{ color: "rgba(255,255,255,0.9)" }}>
                JD Home Solutions
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Admin Portal</p>
            </div>
          </motion.div>

          {/* Center - Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-md"
          >
            <h1
              className="text-4xl xl:text-5xl font-bold leading-[1.15] tracking-tight"
              style={{ fontFamily: "var(--font-heading)", color: "#ffffff" }}
            >
              Manage your
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                business
              </span>{" "}
              with ease.
            </h1>
            <p className="mt-5 text-base leading-relaxed max-w-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              Access invoices, manage clients, and track your locksmith, car
              lockout, and garage door operations.
            </p>
          </motion.div>

          {/* Bottom - Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center gap-6"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                Encrypted connection
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Role-based access</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-8 lg:px-16 relative">
        {/* Subtle background accent for right panel */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, rgba(6,182,212,0.04) 0%, transparent 50%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-[400px] relative z-10"
        >
          {/* Mobile logo (hidden on lg) */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-sm font-bold text-white tracking-tight">
                JD
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
                JD Home Solutions
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Admin Portal</p>
            </div>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <h2
              className="text-2xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-heading)", color: "#ffffff" }}
            >
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
              Sign in to your admin account to continue.
            </p>
          </div>

          {/* Error alerts */}
          {unauthorizedError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-300/90">
                You don&apos;t have admin access. Please sign in with an admin
                account.
              </p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-300/90">{error}</p>
            </motion.div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Email address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/20 transition-colors group-focus-within:text-cyan-400/70" />
                <input
                  {...register("email")}
                  type="email"
                  id="email"
                  autoComplete="email"
                  className="w-full h-12 pl-11 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/20 transition-all duration-200 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(6,182,212,0.08)] hover:border-white/[0.12]"
                  placeholder="admin@jdhomesolutions.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400/90">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/20 transition-colors group-focus-within:text-cyan-400/70" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  className="w-full h-12 pl-11 pr-12 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/20 transition-all duration-200 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(6,182,212,0.08)] hover:border-white/[0.12]"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-[18px] h-[18px]" />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400/90">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 mt-2 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-[#0a1628] font-semibold text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs mt-10" style={{ color: "rgba(255,255,255,0.3)" }}>
            &copy; {new Date().getFullYear()} JD Home Solutions Inc. All rights
            reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#060d19]">
          <Loader2 className="w-8 h-8 text-[var(--accent-teal)] animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
