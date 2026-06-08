"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Globe, BarChart2, Layers, Code2, Cloud, Smartphone, ChevronRight } from "lucide-react";
import Image from "next/image";

// ── STEP PROGRESS BAR ────────────────────────────────────────────────────────
// Reused across all 3 steps. `current` = which step we're on (1, 2, or 3).
// `done` = array of step numbers already completed.
function StepBar({ current }: { current: number }) {
  const steps = [
    { num: 1, label: "Your goal" },
    { num: 2, label: "currentLevel" },
    { num: 3, label: "dailyTime" },
  ];

  return (
    <div className="flex items-center justify-center gap-0 py-4">
      {steps.map((step, i) => {
        const isDone    = step.num < current;
        const isActive  = step.num === current;

        return (
          <div key={step.num} className="flex items-center">
            {/* Circle */}
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
              <span
                className={`text-[13px] font-semibold ${
                  isActive ? "text-ink" : isDone ? "text-primary" : "text-ink-faint"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line between steps */}
            {i < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-3 ${
                  isDone ? "bg-primary" : "bg-grey-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── TRACK DATA ───────────────────────────────────────────────────────────────
const tracks = [
  { id: "web",    label: "Web Development",    sub: "HTML, CSS, JS, React, Full-stack", icon: Globe },
  { id: "data",   label: "Data Science",       sub: "Python, Stats, ML, Visualisation",  icon: BarChart2 },
  { id: "uiux",  label: "UI/UX Design",        sub: "Figma, Research, Prototyping",      icon: Layers },
  { id: "python", label: "Python Programming", sub: "Core Python, Automation, APIs",     icon: Code2 },
  { id: "cloud",  label: "Cloud & DevOps",     sub: "AWS, Docker, CI/CD, Infrastructure",icon: Cloud },
  { id: "mobile", label: "Mobile Dev",         sub: "React Native, Flutter, iOS/Android",icon: Smartphone },
];

export default function GoalPage() {
  // Which tab is active: "track" or "describe"
  const [tab, setTab]               = useState<"track" | "describe">("track");
  // Which track card is selected
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  // Free-text goal description
  const [description, setDescription]     = useState("");

  const router = useRouter();

  // ── CONTINUE HANDLER ─────────────────────────────────────────────────────
  function handleContinue() {
    // Build the goal string from whichever tab is active
    let goal = "";
    if (tab === "track" && selectedTrack) {
      const found = tracks.find((t) => t.id === selectedTrack);
      goal = found ? found.label : "";
    } else if (tab === "describe" && description.trim()) {
      goal = description.trim();
    }

    if (!goal) return; // Don't proceed if nothing selected

    // Save goal to localStorage so Step 3 can read it when calling the API
    localStorage.setItem("sp_goal", goal);

    // Go to step 2
    router.push("/onboarding/level");
  }

  const canContinue =
    (tab === "track" && selectedTrack !== null) ||
    (tab === "describe" && description.trim().length > 0);

  return (
    <div className="min-h-screen bg-surface">
      {/* TOP BAR WITH LOGO + STEP INDICATOR */}
      <div className="bg-white border-b border-border px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="SkillPath AI" width={28} height={28} className="object-contain" />
            <span className="font-black text-ink tracking-tight text-[15px]">
              SKILLPATH <span className="text-primary">AI</span>
            </span>
          </div>
          <StepBar current={1} />
          <div className="w-24" />{/* Spacer to center the step bar */}
        </div>
      </div>

      {/* MAIN CONTENT CARD */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border border-border shadow-card-default p-8">

          {/* Step badge */}
          <div className="inline-block bg-primary-light text-primary text-[12px] font-bold px-3 py-1 rounded-full mb-5 uppercase tracking-wide">
            Step 1 of 3
          </div>

          <h1 className="text-[32px] font-black text-ink tracking-tight mb-1">
            What do you want to learn?
          </h1>
          <p className="text-[14px] text-ink-muted mb-6">
            Pick a track below, or describe your own goal — our AI will build your roadmap either way.
          </p>

          {/* TAB TOGGLE */}
          <div className="flex bg-grey-100 rounded-xl p-1 w-fit mb-6">
            <button
              onClick={() => setTab("track")}
              className={`px-5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                tab === "track"
                  ? "bg-primary text-white shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Choose a track
            </button>
            <button
              onClick={() => setTab("describe")}
              className={`px-5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                tab === "describe"
                  ? "bg-primary text-white shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Describe my goal
            </button>
          </div>

          {/* TRACK GRID */}
          {tab === "track" && (
            <div>
              <p className="text-[13px] font-bold text-ink mb-1">Popular tracks</p>
              <p className="text-[12px] text-ink-muted mb-4">
                Select one to get started — you can change this later
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {tracks.map((track) => {
                  const Icon     = track.icon;
                  const selected = selectedTrack === track.id;
                  return (
                    <button
                      key={track.id}
                      onClick={() => setSelectedTrack(track.id)}
                      className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                        selected
                          ? "border-primary bg-primary-light"
                          : "border-border bg-white hover:border-primary-light hover:bg-primary-xlight"
                      }`}
                    >
                      {/* Check mark when selected */}
                      {selected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check size={11} className="text-white" />
                        </div>
                      )}
                      <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center mb-2">
                        <Icon size={16} className="text-primary" />
                      </div>
                      <p className="text-[14px] font-bold text-ink">{track.label}</p>
                      <p className="text-[12px] text-ink-muted mt-0.5">{track.sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DESCRIBE GOAL TEXT AREA */}
          {tab === "describe" && (
            <div className="mb-6">
              <p className="text-[13px] font-bold text-ink mb-1">Describe your own goal</p>
              <p className="text-[12px] text-ink-muted mb-3">
                Tell us what you want to build, achieve, or learn — be as specific as you like.
              </p>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) setDescription(e.target.value);
                  }}
                  placeholder={`e.g. "I want to build web apps with React. I have basic HTML/CSS knowledge and I want to be job-ready in 6 months."`}
                  rows={5}
                  className="w-full border border-grey-200 rounded-xl p-4 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all resize-none"
                />
                <p className="absolute bottom-3 right-3 text-[12px] text-ink-faint">
                  {description.length} / 500
                </p>
              </div>
            </div>
          )}

          {/* DIVIDER */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-grey-200" />
            <span className="text-[12px] text-ink-faint">or</span>
            <div className="flex-1 h-px bg-grey-200" />
          </div>

          {/* SECONDARY TEXT AREA — always visible below tracks too */}
          {tab === "track" && (
            <div>
              <p className="text-[13px] font-bold text-ink mb-1">Describe your own goal</p>
              <p className="text-[12px] text-ink-muted mb-3">
                Tell us what you want to build, achieve, or learn — be as specific as you like.
              </p>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) setDescription(e.target.value);
                  }}
                  placeholder={`e.g. "I want to build web apps with React. I have basic HTML/CSS knowledge and I want to be job-ready in 6 months."`}
                  rows={4}
                  className="w-full border border-grey-200 rounded-xl p-4 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all resize-none"
                />
                <p className="absolute bottom-3 right-3 text-[12px] text-ink-faint">
                  {description.length} / 500
                </p>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM BAR */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-[12px] text-ink-faint">
            Your preferences are private and only used to personalise your roadmap
          </p>
          <div className="flex items-center gap-4">
            <p className="text-[13px] text-ink-muted">
              {selectedTrack
                ? "1 track selected"
                : description.trim()
                ? "Goal described"
                : "Select a track or describe your goal to continue"}
            </p>
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-full transition-all text-[14px]"
            >
              Continue
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}