"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, User, Mail, } from "lucide-react";
import { register } from "@/lib/api/auth";
import Image from "next/image";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const router = useRouter();

  function getPasswordStrength(pw: string): { label: string; color: string; width: string } {
    if (pw.length === 0) return { label: "", color: "", width: "0%" };
    if (pw.length < 6)   return { label: "Too short", color: "bg-error", width: "25%" };
    if (pw.length < 8)   return { label: "Weak", color: "bg-error", width: "40%" };
    const hasNum    = /\d/.test(pw);
    const hasLetter = /[a-zA-Z]/.test(pw);
    if (hasNum && hasLetter && pw.length >= 10) return { label: "Strong", color: "bg-primary", width: "100%" };
    if (hasNum || hasLetter)                    return { label: "Fair", color: "bg-primary-dark", width: "65%" };
    return { label: "Weak", color: "bg-error", width: "40%" };
  }

  const strength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register({
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        password,
      });
      router.push("/login?registered=true");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(
        e?.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-5">
        <div style={{ backgroundColor: "#F5A623" }} className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Image src="/logo.png" alt="SkillPath AI" width={28} height={28} className="object-contain" />
        </div>
        <span className="font-black text-ink tracking-tight text-[16px] whitespace-nowrap">
          SKILL<span style={{ color: "#F5A623" }}>PATH</span> AI
        </span>
      </div>

      <div className="w-full max-w-md">

        <h2 className="text-[32px] font-black text-ink tracking-tight text-center mb-1">
          Create your account
        </h2>
        <p className="text-[14px] text-ink-muted text-center mb-8">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold underline hover:text-primary-dark">
            Sign in
          </Link>
        </p>

        {error && (
          <div className="bg-error-light border border-error text-error text-[13px] rounded-xl px-4 py-3 mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-border shadow-card-default">

          {/* First + Last name */}
          <div className="flex gap-4 mb-5">
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-ink mb-1.5">First name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Amaka"
                  required
                  className="w-full h-11 pl-9 pr-3 border border-grey-200 rounded-lg text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-ink mb-1.5">Last name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Okonkwo"
                  required
                  className="w-full h-11 pl-9 pr-3 border border-grey-200 rounded-lg text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-ink mb-1.5">Email or Phone number</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="amaka@gmail.com"
                required
                className="w-full h-11 pl-9 pr-3 border border-grey-200 rounded-lg text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-ink mb-1.5">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={6}
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
            {password.length > 0 && (
              <div className="mt-2">
                <div className="h-1 bg-grey-200 rounded-full">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${strength.color}`}
                    style={{ width: strength.width }}
                  />
                </div>
                <p className="text-[12px] text-ink-muted mt-1">{strength.label} password</p>
              </div>
            )}
          </div>

          {/* Info banner */}
          {/* <div className="bg-sidebar rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
            <Info size={15} className="text-primary-light mt-0.5 flex-shrink-0" />
            <p className="text-[12px] text-white/80 leading-relaxed">
              By creating an account, you will receive learning tips, and you can unsubscribe at any time.
            </p>
          </div> */}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-full transition-all text-[15px]"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-[12px] text-ink-faint text-center mt-6">
          © 2026 SkillPath AI. All rights reserved. Built with 🤍 for Africa.
        </p>
      </div>
    </div>
  );
}