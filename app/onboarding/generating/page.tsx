"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { generateRoadmap } from "@/lib/api/roadmap";
import Image from "next/image";

const loadingSteps = [
  "Analysing your goals...",
  "Mapping your skill level...",
  "Building your personalised roadmap...",
  "Selecting the best courses for you...",
  "Finalising your learning path...",
];

export default function GeneratingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError]             = useState("");
  const router = useRouter();

  useEffect(() => {
    const ticker = setInterval(() => {
      setCurrentStep((prev) =>
        prev < loadingSteps.length - 1 ? prev + 1 : prev
      );
    }, 1200);

    async function generate() {
      try {
        const res = await generateRoadmap();

        // Save this user's unique AI-generated roadmap to localStorage.
        // Every user gets a different roadmap based on their onboarding answers.
        // We save it here so the dashboard can read it instantly without
        // making another API call.
        const roadmap = res.data?.data?.roadmap;
        if (roadmap) {
          localStorage.setItem("skillpath_roadmap", JSON.stringify(roadmap));
        }

        clearInterval(ticker);
        // Small pause so user sees the final step message
        setTimeout(() => router.push("/dashboard"), 800);

      } catch (err: unknown) {
  clearInterval(ticker);
  const e = err as { response?: { data?: { message?: string } } };
  setError(
    e?.response?.data?.message ||
    "Failed to generate your roadmap. Please try again."
  );
      }
    }

    generate();
    return () => clearInterval(ticker);
  }, [router]);

  const progress = Math.round(((currentStep + 1) / loadingSteps.length) * 100);

  return (
    <div className="min-h-screen bg-sidebar flex flex-col items-center justify-center px-6">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-12">
        <Image src="/logo.png" alt="SkillPath AI" width={28} height={28} className="object-contain" />
        <span className="font-black text-white tracking-tight text-[15px]">
          SKILLPATH <span className="text-primary-light">AI</span>
        </span>
      </div>

      {/* Card */}
      <div className="bg-white/10 border border-white/20 rounded-3xl p-10 max-w-md w-full text-center">

        {/* Pulse ring */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-primary opacity-20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center">
            <span className="text-3xl">🤖</span>
          </div>
        </div>

        <h2 className="text-[24px] font-black text-white mb-2">
          Building your roadmap
        </h2>
        <p className="text-[14px] text-white/60 mb-8">
          Our AI is crafting a personalised learning path just for you
        </p>

        {/* Progress bar */}
        <div className="h-2 bg-white/10 rounded-full mb-4">
          <div
            className="h-2 bg-primary rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Current step label */}
        <p className="text-[14px] text-primary-light font-medium min-h-[20px]">
          {loadingSteps[currentStep]}
        </p>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-6">
          {loadingSteps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= currentStep ? "w-6 bg-primary" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
  <div className="mt-6 bg-white/10 border border-white/20 rounded-2xl px-6 py-5 max-w-md w-full text-center">
    <p className="text-2xl mb-2">⚠️</p>
    <p className="text-[15px] font-bold text-white mb-1">
      Roadmap generation unavailable
    </p>
    <p className="text-[13px] text-white/60 mb-4 leading-relaxed">
      Our AI service is temporarily at capacity. This usually resolves within a few minutes. Please try again shortly.
    </p>
    <button
      onClick={() => window.location.reload()}
      className="bg-primary hover:bg-primary-dark text-white text-[13px] font-bold px-6 py-2.5 rounded-full transition-all"
    >
      Try again
    </button>
  </div>
)}
    </div>
  );
}