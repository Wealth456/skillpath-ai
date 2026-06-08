"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Sprout, BookOpen, Zap } from "lucide-react";
import Image from "next/image";

function StepBar({ current }: { current: number }) {
  const steps = [
    { num: 1, label: "Your goal" },
    { num: 2, label: "currentLevel" },
    { num: 3, label: "dailyTime" },
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

const levels = [
  {
    id: "beginner",
    label: "Complete Beginner",
    desc: "No coding experience yet — starting from scratch",
    icon: Sprout,
    feedback: "Your roadmap will start with the absolute basics — no assumptions, step by step. Perfect for first-timers!",
  },
  {
    id: "intermediate",
    label: "Some Basics",
    desc: "Tried tutorials, know a few concepts but not consistent",
    icon: BookOpen,
    feedback: "Your roadmap will skip the basics and focus on building real projects with structured guidance.",
  },
  {
    id: "advanced",
    label: "Intermediate",
    desc: "Comfortable with fundamentals, want to go deeper",
    icon: Zap,
    feedback: "Your roadmap will challenge you with advanced topics, system design, and production-grade skills.",
  },
];

export default function LevelPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  function handleNext() {
    if (!selected) return;
    // Save level to localStorage — Step 3 reads both sp_goal and sp_level
    localStorage.setItem("sp_level", selected);
    router.push("/onboarding/time");
  }

  const selectedLevel = levels.find((l) => l.id === selected);

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
          <StepBar current={2} />
          <div className="w-24" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border border-border shadow-card-default p-8">

          <div className="inline-block bg-primary-light text-primary text-[12px] font-bold px-3 py-1 rounded-full mb-5 uppercase tracking-wide">
            Step 2 of 3
          </div>

          <h1 className="text-[32px] font-black text-ink tracking-tight mb-1">
            What is your current skill level?
          </h1>
          <p className="text-[14px] text-ink-muted mb-8">
            Be honest — there is no wrong answer. This helps us build the right roadmap for you.
          </p>

          {/* Level cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            {levels.map((level) => {
              const Icon       = level.icon;
              const isSelected = selected === level.id;
              return (
                <button
                  key={level.id}
                  onClick={() => setSelected(level.id)}
                  className={`relative text-center p-6 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary-light"
                      : "border-border bg-white hover:border-primary-light hover:bg-primary-xlight"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                  <div className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    isSelected ? "bg-primary" : "bg-primary-light"
                  }`}>
                    <Icon size={24} className={isSelected ? "text-white" : "text-primary"} />
                  </div>
                  <p className="text-[15px] font-bold text-ink mb-2">{level.label}</p>
                  <p className="text-[13px] text-ink-muted leading-relaxed">{level.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Feedback banner — shows when a level is selected */}
          {selectedLevel && (
            <div className="bg-primary-light border border-primary rounded-xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[14px]">🤖</span>
              </div>
              <div>
                <p className="text-[13px] font-bold text-ink mb-0.5">
                  {selectedLevel.label} path selected
                </p>
                <p className="text-[13px] text-ink-muted leading-relaxed">
                  {selectedLevel.feedback}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* NAVIGATION */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => router.push("/onboarding/goal")}
            className="flex items-center gap-2 bg-white border border-border text-ink font-semibold px-5 py-2.5 rounded-full hover:bg-grey-100 transition-all text-[14px]"
          >
            <ChevronLeft size={16} />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!selected}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-full transition-all text-[14px]"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}