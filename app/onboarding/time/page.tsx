"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { updateProfile } from "@/lib/api/user";
import Image from "next/image";

function StepBar({ current }: { current: number }) {
  const steps = [
    { num: 1, label: "Your goal" },
    { num: 2, label: "currentLevel" },
    { num: 3, label: "DailyTime" },
  ];
  return (
    <div className="flex items-center justify-center gap-0 py-4">
      {steps.map((step, i) => {
        const isDone   = step.num < current;
        const isActive = step.num === current;
        return (
          <div key={step.num} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold border-2 transition-all ${
                  isDone
                    ? "bg-primary border-primary text-white"
                    : isActive
                    ? "bg-primary border-primary text-white"
                    : "bg-white border-grey-200 text-ink-faint"
                }`}
              >
                {isDone ? <Check size={14} /> : step.num}
              </div>
              <span className={`text-[13px] font-semibold ${isActive ? "text-ink" : isDone ? "text-primary" : "text-ink-faint"}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-3 ${isDone ? "bg-primary" : "bg-grey-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

const timeOptions = [
  {
    id: 15,
    label: "15 – 30 minutes",
    desc: "Light pace · Great for busy schedules",
    badge: null,
  },
  {
    id: 45,
    label: "30 – 60 minutes",
    desc: "Steady pace · Most learners choose this",
    badge: "Most popular",
  },
  {
    id: 90,
    label: "1 – 2 hours",
    desc: "Fast pace · Ideal if you are job-hunting",
    badge: "Intensive",
  },
];

export default function TimePage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const router = useRouter();

  async function handleBuildRoadmap() {
    if (!selected) return;

    setLoading(true);
    setError("");

    try {
      // Read goal and level saved in previous steps
      const goal  = localStorage.getItem("sp_goal")  || "";
      const level = localStorage.getItem("sp_level") || "beginner";

      // Call PUT /api/user/profile — saves all 3 onboarding values to the backend
      // The backend uses these to generate the AI roadmap
      await updateProfile({
        goal,
        currentLevel: level as "beginner" | "intermediate" | "advanced",
        dailyTime: selected,
      });

      // Clean up temp localStorage keys — we don't need them anymore
      localStorage.removeItem("sp_goal");
      localStorage.removeItem("sp_level");

      // Go to the generating screen which calls generateRoadmap()
      router.push("/onboarding/generating");

    } catch (err: unknown) {
  const e = err as { response?: { data?: { message?: string } } };
  setError(
    e?.response?.data?.message ||
    "Something went wrong. Please try again."
  );
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* TOP BAR */}
      <div className="bg-white border-b border-border px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="SkillPath AI" width={28} height={28} className="object-contain" />
            <span className="font-black text-ink tracking-tight text-[15px]">
              SKILLPATH <span className="text-primary">AI</span>
            </span>
          </div>
          <StepBar current={3} />
          <div className="w-24" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border border-border shadow-card-default p-8">

          <div className="inline-block bg-primary-light text-primary text-[12px] font-bold px-3 py-1 rounded-full mb-5 uppercase tracking-wide">
            Step 3 of 3 — Almost there!
          </div>

          <h1 className="text-[32px] font-black text-ink tracking-tight mb-1">
            How much time can you study daily?
          </h1>
          <p className="text-[14px] text-ink-muted mb-8">
            We will pace your roadmap around your schedule. Consistency beats intensity every time.
          </p>

          {/* Time option rows */}
          <div className="flex flex-col gap-4 mb-8">
            {timeOptions.map((option) => {
              const isSelected = selected === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setSelected(option.id)}
                  className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left ${
                    isSelected
                      ? "border-primary bg-primary-light"
                      : "border-border bg-white hover:border-primary-light hover:bg-primary-xlight"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSelected ? "bg-primary" : "bg-primary-light"
                    }`}>
                      <Clock size={18} className={isSelected ? "text-white" : "text-primary"} />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-ink">{option.label}</p>
                      <p className="text-[13px] text-ink-muted">{option.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {option.badge && (
                      <span className={`text-[12px] font-semibold px-3 py-1 rounded-full ${
                        option.badge === "Most popular"
                          ? "bg-primary-light text-primary"
                          : "bg-grey-200 text-ink-muted"
                      }`}>
                        {option.badge}
                      </span>
                    )}
                    {/* Radio circle */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? "border-primary bg-primary" : "border-grey-300 bg-white"
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-error-light border border-error text-error text-[13px] rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}
        </div>

        {/* NAVIGATION */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => router.push("/onboarding/level")}
            className="flex items-center gap-2 bg-white border border-border text-ink font-semibold px-5 py-2.5 rounded-full hover:bg-grey-100 transition-all text-[14px]"
          >
            <ChevronLeft size={16} />
            Back
          </button>
          <button
            onClick={handleBuildRoadmap}
            disabled={!selected || loading}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-full transition-all text-[14px]"
          >
            {loading ? "Saving..." : "Build my roadmap"}
            {!loading && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}