"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, CheckCircle2, Info } from "lucide-react";
import { login } from "@/lib/api/auth";
import Image from "next/image";

export default function LoginPage() {
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
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      {/* <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-primary to-sidebar flex-col justify-between p-10"> */}

        {/* Logo */}
{/* <div className="flex items-center gap-2">
  <div style={{ backgroundColor: "#F5A623" }} className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
    <img src="/logo.png" alt="SkillPath AI" className="w-7 h-7 object-contain" />
  </div>
  <span className="font-black text-white tracking-tight text-[16px] whitespace-nowrap">
    SKILL<span style={{ color: "#F5A623" }}>PATH</span> AI
  </span>
</div> */}

        {/* Copy — this div closes before social proof */}
        {/* <div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Welcome<br />
            back to your<br />
            <span style={{ color: "#F5A623" }}>learning path.</span>
          </h1>
          <p className="text-[15px] text-white/70 mb-8 leading-relaxed max-w-xs">
            Pick up right where you left off. Your AI roadmap, courses, and progress are all waiting for you.
          </p> */}

          {/* Bullets */}
          {/* <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div style={{ backgroundColor: "#F5A623" }} className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={12} className="text-white" />
              </div>
              <span className="text-[14px] text-white/80">Resume from where you stopped</span>
            </div>
            <div className="flex items-center gap-3">
              <div style={{ backgroundColor: "#F5A623" }} className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={12} className="text-white" />
              </div>
              <span className="text-[14px] text-white/80">Keep your daily streak alive</span>
            </div>
            <div className="flex items-center gap-3">
              <div style={{ backgroundColor: "#F5A623" }} className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={12} className="text-white" />
              </div>
              <span className="text-[14px] text-white/80">Access all your saved notes & PDFs</span>
            </div>
          </div>
        </div> */}
        {/* ↑ this closes the Copy div */}

        {/* Social proof */}
        {/* <div className="border border-white/20 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary-light border-2 border-white flex items-center justify-center text-[10px] font-bold text-primary">CU</div>
              <div className="w-8 h-8 rounded-full bg-primary border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">KA</div>
              <div className="w-8 h-8 rounded-full bg-sidebar-header border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">FM</div>
              <div className="w-8 h-8 rounded-full bg-ink border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">TO</div>
            </div>
            <p className="text-[13px] text-white/80 leading-snug">
              <span className="font-bold text-white">12,000+ learners</span> across Nigeria, Ghana & Kenya are already on their path.
            </p>
          </div>
        </div> */}
      {/* </div> */}
      {/* ↑ closes left panel */}

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 bg-surface flex flex-col">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 p-6">
          <div style={{ backgroundColor: "#F5A623" }} className="w-8 h-8 rounded-lg flex items-center justify-center">
            <Image src="/logo.png" alt="SkillPath AI" width={24} height={24} className="object-contain" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black text-ink tracking-tight text-[13px]">SKILLPATH</span>
            <span className="font-black tracking-tight text-[13px]" style={{ color: "#F5A623" }}>AI</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
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

              {/* Email */}
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
                    placeholder="e.g. 08012345678 or email"
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

              {/* Password */}
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

              {/* Forgot password */}
              <div className="flex justify-end mb-6">
                <a href="#" className="text-[13px] text-ink-muted hover:text-primary transition-colors">
                  Forgot password?
                </a>
              </div>

              {/* Submit */}
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
      </div>
      {/* ↑ closes right panel */}

    </div>
  );
}