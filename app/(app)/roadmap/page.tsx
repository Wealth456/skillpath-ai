"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, ChevronRight, Settings } from "lucide-react";

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface RoadmapTopic {
  name: string;
  estimatedDays: number;
  _id: string;
}

interface RoadmapStage {
  stage: number;
  title: string;
  topics: RoadmapTopic[];
}

interface Roadmap {
  title: string;
  estimatedWeeks: number;
  stages: RoadmapStage[];
}

export default function RoadmapPage() {
  const [roadmap, setRoadmap]     = useState<Roadmap | null>(null);
  // Replace with:
const [userLevel, setUserLevel] = useState("Beginner");
const [dailyTime] = useState("30-60 min/day");
  const router = useRouter();

  useEffect(() => {
    // Read roadmap saved during onboarding generating page
    const saved = localStorage.getItem("skillpath_roadmap");
    if (saved) {
      try {
        setRoadmap(JSON.parse(saved));
      } catch {
        // corrupted — redirect back
        router.push("/dashboard");
      }
    }

    // Read user info
  
    const level = localStorage.getItem("sp_level") || "beginner";
    
    setUserLevel(
      level === "beginner" ? "Beginner" :
      level === "intermediate" ? "Intermediate" : "Advanced"
    );
  }, [router]);

  if (!roadmap) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[14px] text-ink-muted">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  // Total topics across all stages
  const totalTopics = roadmap.stages.reduce(
    (acc, s) => acc + s.topics.length, 0
  );

  // Next topic — first topic of first stage
  const nextTopic = roadmap.stages[0]?.topics[0]?.name || "—";

  // Rough days remaining estimate
  const daysRemaining = roadmap.stages
    .slice(1) // exclude active stage
    .reduce(
      (acc, s) => acc + s.topics.reduce((a, t) => a + t.estimatedDays, 0),
      0
    );

  return (
    <div>
      {/* ── PAGE HEADER ── */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-[26px] font-black text-ink tracking-tight">
            My Learning Roadmap
          </h1>
          <p className="text-[13px] text-ink-muted mt-0.5">
            {roadmap.title} · {roadmap.estimatedWeeks} weeks
          </p>
        </div>

        {/* Edit preferences button */}
        <button
          onClick={() => router.push("/onboarding/goal")}
          className="flex items-center gap-2 bg-white border border-border text-ink text-[13px] font-semibold px-4 py-2 rounded-full hover:bg-grey-100 transition-all"
        >
          <Settings size={14} />
          Edit preferences
        </button>
      </div>

      {/* ── ROADMAP INFO STRIP ── */}
      <div className="bg-white rounded-2xl border border-border p-4 mb-5 shadow-card-default">
        {/* Top mini label */}
        <p className="text-[11px] text-ink-faint mb-2">
          roadmap · {roadmap.stages.length} stages · {roadmap.estimatedWeeks} estimated weeks
        </p>

        {/* Roadmap title */}
        <h2 className="text-[22px] font-black text-ink mb-3">
          {roadmap.title}
        </h2>

        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="bg-primary-light text-primary text-[12px] font-semibold px-3 py-1 rounded-full">
            {userLevel}
          </span>
          <span className="bg-grey-100 text-ink-muted text-[12px] font-semibold px-3 py-1 rounded-full">
            {roadmap.estimatedWeeks} weeks
          </span>
          <span className="bg-grey-100 text-ink-muted text-[12px] font-semibold px-3 py-1 rounded-full">
            {dailyTime}
          </span>
          <span className="bg-grey-100 text-ink-muted text-[12px] font-semibold px-3 py-1 rounded-full">
            {roadmap.stages.length} stages
          </span>
          <span className="bg-grey-100 text-ink-muted text-[12px] font-semibold px-3 py-1 rounded-full">
            {totalTopics} topics
          </span>

          {/* Progress */}
          <div className="ml-auto flex items-center gap-2">
            <div className="w-24 h-1.5 bg-grey-200 rounded-full">
              <div className="w-[25%] h-1.5 bg-primary rounded-full" />
            </div>
            <span className="text-[12px] font-bold text-primary">25% complete</span>
          </div>
        </div>
      </div>

      {/* ── STAGE COLUMNS ── */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-5">
        {roadmap.stages.map((stage, stageIndex) => {
          const isActive = stageIndex === 0;
          const isLocked = stageIndex > 0;

          return (
            <div
              key={stage.stage}
              className={`flex-shrink-0 w-[220px] rounded-2xl border-2 overflow-hidden ${
                isActive
                  ? "border-primary"
                  : "border-border opacity-80"
              }`}
            >
              {/* Stage header */}
              <div className={`px-4 py-3 flex items-center justify-between ${
                isActive ? "bg-primary-light" : "bg-grey-100"
              }`}>
                <div>
                  <p className="text-[11px] font-bold text-ink-faint uppercase tracking-wide">
                    Stage {stage.stage}
                  </p>
                  <p className="text-[14px] font-black text-ink leading-tight">
                    {stage.title}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {isActive ? (
                    <span className="text-[10px] bg-primary text-white font-bold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  ) : (
                    <Lock size={14} className="text-ink-faint" />
                  )}
                  {isLocked && (
                    <span className="text-[10px] text-ink-faint font-medium">Locked</span>
                  )}
                </div>
              </div>

              {/* Topic cards */}
              <div className="p-3 flex flex-col gap-2 bg-white">
                {stage.topics.map((topic, topicIndex) => (
                  <div
                    key={topic._id}
                    className={`rounded-xl p-3 border ${
                      isActive
                        ? "border-border bg-white hover:border-primary hover:bg-primary-xlight transition-colors cursor-pointer"
                        : "border-border bg-grey-100 cursor-not-allowed"
                    }`}
                  >
                    {/* Topic icon + name */}
                    <div className="flex items-start gap-2 mb-2">
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isActive ? "bg-primary-light" : "bg-grey-200"
                      }`}>
                        {isLocked ? (
                          <Lock size={10} className="text-ink-faint" />
                        ) : (
                          <ChevronRight size={10} className="text-primary" />
                        )}
                      </div>
                      <p className={`text-[13px] font-semibold leading-tight ${
                        isLocked ? "text-ink-muted" : "text-ink"
                      }`}>
                        {topic.name}
                      </p>
                    </div>

                    {/* Days estimate */}
                    <p className={`text-[11px] font-medium ml-7 ${
                      isLocked ? "text-ink-faint" : "text-ink-muted"
                    }`}>
                      {topic.estimatedDays} days
                    </p>

                    {/* Progress bar — only on active stage first topic */}
                    {isActive && topicIndex === 0 && (
                      <div className="mt-2 ml-7">
                        <div className="h-1 bg-grey-200 rounded-full">
                          <div className="h-1 bg-primary rounded-full w-[40%]" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── BOTTOM SUMMARY BAR ── */}
      <div className="bg-white rounded-2xl border border-border p-4 shadow-card-default">
        <div className="flex items-center justify-between">

          {/* API badge */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-primary-light text-primary font-bold px-2 py-1 rounded-full">
              API stages[] + topics[]
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-[11px] text-ink-faint mb-0.5">Total weeks</p>
              <p className="text-[20px] font-black text-ink">{roadmap.estimatedWeeks}</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-[11px] text-ink-faint mb-0.5">Stages</p>
              <p className="text-[20px] font-black text-ink">{roadmap.stages.length}</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-[11px] text-ink-faint mb-0.5">Topics</p>
              <p className="text-[20px] font-black text-ink">{totalTopics}</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-[11px] text-ink-faint mb-0.5">Days remaining</p>
              <p className="text-[20px] font-black text-ink">~{daysRemaining}</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-[11px] text-ink-faint mb-0.5">Next topic</p>
              <p className="text-[14px] font-bold text-primary truncate max-w-[140px]">
                {nextTopic}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}