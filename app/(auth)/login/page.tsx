"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, CheckCircle2, Info } from "lucide-react";
import Image from "next/image";
import { login } from "@/lib/api/auth";

function LoginForm() {
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [successMsg, setSuccessMsg]     = useState("");

  const router       = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMsg("Account created! Please sign in.");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await login({ email: email.trim(), password });

      const token = localStorage.getItem("skillpath_token");
      if (!token) {
        setError("No token received. Try again.");
        setLoading(false);
        return;
      }

      const d = (res.data as unknown as Record<string, unknown>)?.data as Record<string, unknown>;
      const user = d?.user as Record<string, unknown> | undefined;
      const preferences = user?.preferences as Record<string, unknown> | undefined;

      if (!preferences?.goal || preferences.goal === "") {
        router.push("/onboarding/goal");
      } else {
        router.push("/dashboard");
      }

    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(
        e?.response?.data?.message ||
        "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div style={{ backgroundColor: "#F5A623" }} className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Image src="/logo.png" alt="SkillPath AI" width={28} height={28} className="object-contain" />
        </div>
        <span className="font-black text-ink tracking-tight text-[16px] whitespace-nowrap">
          SKILL<span style={{ color: "#F5A623" }}>PATH</span> AI
        </span>
      </div>

      <div className="w-full max-w-md">

        <h2 className="text-[32px] font-black text-ink tracking-tight text-center mb-1">
          Welcome Back 👋
        </h2>
        <p className="text-[14px] text-ink-muted text-center mb-8">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary font-semibold underline hover:text-primary-dark">
            Sign up free
          </Link>
        </p>

        {successMsg && (
          <div className="bg-primary-light border border-primary text-primary text-[13px] rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
            <CheckCircle2 size={15} />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-border shadow-card-default">

          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-ink mb-1.5">
              Email or Phone number
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. amaka@gmail.com"
                required
                className={`w-full h-11 pl-9 pr-3 border rounded-lg text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all ${
                  error ? "border-error ring-2 ring-error-light" : "border-grey-200"
                }`}
              />
            </div>
            {error && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Info size={13} className="text-error flex-shrink-0" />
                <p className="text-[12px] text-error">{error}</p>
              </div>
            )}
          </div>

          <div className="mb-2">
            <label className="block text-[13px] font-semibold text-ink mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full h-11 pl-9 pr-10 border border-grey-200 rounded-lg text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <a href="#" className="text-[13px] text-ink-muted hover:text-primary transition-colors">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-full transition-all text-[15px]"
          >
            {loading ? "Signing in..." : "Sign in to SkillPath AI"}
          </button>
        </form>

        <p className="text-[12px] text-ink-faint text-center mt-6">
          © 2026 SkillPath AI. All rights reserved. Built with 🤍 for Africa.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}