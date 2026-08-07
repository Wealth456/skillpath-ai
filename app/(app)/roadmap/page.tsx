"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, ChevronRight, Settings } from "lucide-react";
import { getRoadmap } from "@/lib/api/roadmap";
import { getCourses, getEnrollments, enrollInCourse } from "@/lib/api/learning";
import type { Course, Enrollment } from "@/lib/api/learning";
import PageNav from "@/components/PageNav";

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

// ── KEYWORD MATCHING ─────────────────────────────────────────────────────────
const STOPWORDS = new Set([
  "the", "a", "an", "of", "to", "and", "for", "in", "on", "with",
  "your", "you", "beginner", "intermediate", "advanced", "introduction",
  "fundamentals", "basics", "guide", "learn", "learning", "mastery",
  "from", "job", "ready",
]);

function extractKeywords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s/]/g, " ")
      .split(/\s+/)
      .flatMap((word) => word.split("/"))
      .filter((word) => word.length > 2 && !STOPWORDS.has(word))
  );
}

function matchCourseForStage(stage: RoadmapStage, courses: Course[]): Course | null {
  const stageKeywords = new Set([
    ...extractKeywords(stage.title),
    ...stage.topics.flatMap((t) => Array.from(extractKeywords(t.name))),
  ]);

  let bestMatch: Course | null = null;
  let bestScore = 0;

  for (const course of courses) {
    const courseKeywords = new Set([
      ...extractKeywords(course.category ?? ""),
      ...extractKeywords(course.title ?? ""),
      ...(course.modules ?? []).flatMap((m) => Array.from(extractKeywords(m.title ?? ""))),
    ]);

    let sharedCount = 0;
    for (const word of stageKeywords) {
      if (courseKeywords.has(word)) sharedCount++;
    }

    if (sharedCount >= 2 && sharedCount > bestScore) {
      bestScore = sharedCount;
      bestMatch = course;
    }
  }

  return bestMatch;
}

export default function RoadmapPage() {
  const [roadmap, setRoadmap]     = useState<Roadmap | null>(null);
  const [userLevel, setUserLevel] = useState("Beginner");
  const [dailyTime] = useState("30-60 min/day");
  const router = useRouter();

  const [checkedStorage, setCheckedStorage] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadRoadmap() {
      const saved = localStorage.getItem("skillpath_roadmap");
      if (saved) {
        try {
          setRoadmap(JSON.parse(saved));
          setCheckedStorage(true);
          return;
        } catch {
          localStorage.removeItem("skillpath_roadmap");
        }
      }

      const userId = localStorage.getItem("skillpath_user_id");
      if (userId) {
        try {
          const response = await getRoadmap(userId);
          const fetched = response.data?.data?.roadmap;
          if (fetched) {
            setRoadmap(fetched);
            localStorage.setItem("skillpath_roadmap", JSON.stringify(fetched));
          }
        } catch {
          // 404 (no roadmap) or network error — fall through to
          // "no roadmap found" screen below
        }
      }

      setCheckedStorage(true);
    }

    async function loadCoursesAndProgress() {
      try {
        const coursesRes = await getCourses();
        setCourses(coursesRes.data?.data?.courses ?? []);
      } catch {
        setCourses([]);
      }

      try {
        const enrollRes = await getEnrollments();
        const enrollments: Enrollment[] = enrollRes.data?.data?.enrollments ?? [];
        const progress: Record<string, number> = {};
        enrollments.forEach((e) => {
          progress[e.course._id] = e.progress?.progressPercent ?? 0;
        });
        setProgressMap(progress);
      } catch {
        setProgressMap({});
      }
    }

    loadRoadmap();
    loadCoursesAndProgress();

    const level = localStorage.getItem("sp_level") || "beginner";
    setUserLevel(
      level === "beginner" ? "Beginner" :
      level === "intermediate" ? "Intermediate" : "Advanced"
    );
  }, [router]);

  // A stage is unlocked if:
  // - it's the first stage (always unlocked), OR
  // - the PREVIOUS stage has a matched course AND that course is 100% complete
  function isStageUnlocked(stageIndex: number): boolean {
    if (!roadmap) return false;
    if (stageIndex === 0) return true;

    const prevStage = roadmap.stages[stageIndex - 1];
    const prevCourse = matchCourseForStage(prevStage, courses);
    if (!prevCourse) return false;

    return (progressMap[prevCourse._id] ?? 0) === 100;
  }

  // Clicking a topic on an unlocked stage jumps straight into that
  // stage's matched course. If the user isn't enrolled yet, silently
  // enroll them first — a roadmap-generated course shouldn't require a
  // separate manual "Enroll" step, since the system already picked it.
  async function handleTopicClick(stage: RoadmapStage, unlocked: boolean) {
    if (!unlocked) return;
    const course = matchCourseForStage(stage, courses);
    if (!course) {
      router.push("/courses");
      return;
    }

    if (progressMap[course._id] === undefined) {
      try {
        await enrollInCourse(course._id);
      } catch {
        // Already enrolled server-side, or a transient error — either
        // way, still navigate; the course page reflects real state.
      }
    }

    router.push(`/courses/${course._id}`);
  }

  if (!roadmap && checkedStorage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <p className="text-[15px] font-bold text-ink mb-2">No roadmap found</p>
        <p className="text-[13px] text-ink-muted mb-5 max-w-sm">
          We couldn&apos;t find a saved roadmap for your account. Generate a new one to continue.
        </p>
        <button
          onClick={() => router.push("/onboarding/goal")}
          className="bg-primary hover:bg-primary-dark text-white text-[13px] font-bold px-6 py-2.5 rounded-full transition-all"
        >
          Generate my roadmap →
        </button>
      </div>
    );
  }

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

  const totalTopics = roadmap.stages.reduce(
    (acc, s) => acc + s.topics.length, 0
  );

  const nextTopic = roadmap.stages[0]?.topics[0]?.name || "—";

  const daysRemaining = roadmap.stages
    .slice(1)
    .reduce(
      (acc, s) => acc + s.topics.reduce((a, t) => a + t.estimatedDays, 0),
      0
    );

  const matchedProgressValues = roadmap.stages
    .map((stage) => {
      const course = matchCourseForStage(stage, courses);
      return course ? progressMap[course._id] ?? 0 : null;
    })
    .filter((v): v is number => v !== null);

  const overallProgress =
    matchedProgressValues.length > 0
      ? Math.round(
          matchedProgressValues.reduce((a, b) => a + b, 0) / matchedProgressValues.length
        )
      : 0;

  return (
    <div>
      <PageNav />
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
        <p className="text-[11px] text-ink-faint mb-2">
          roadmap · {roadmap.stages.length} stages · {roadmap.estimatedWeeks} estimated weeks
        </p>

        <h2 className="text-[22px] font-black text-ink mb-3">
          {roadmap.title}
        </h2>

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

          <div className="ml-auto flex items-center gap-2">
            <div className="w-24 h-1.5 bg-grey-200 rounded-full">
              <div
                className="h-1.5 bg-primary rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="text-[12px] font-bold text-primary">{overallProgress}% complete</span>
          </div>
        </div>
      </div>

      {/* ── STAGE COLUMNS ── */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-5">
        {roadmap.stages.map((stage, stageIndex) => {
          const unlocked = isStageUnlocked(stageIndex);
          const isActive = unlocked && stageIndex === 0;
          const matchedCourse = matchCourseForStage(stage, courses);

          return (
            <div
              key={stage.stage}
              className={`flex-shrink-0 w-[220px] rounded-2xl border-2 overflow-hidden ${
                unlocked ? "border-primary" : "border-border opacity-80"
              }`}
            >
              {/* Stage header */}
              <div className={`px-4 py-3 flex items-center justify-between ${
                unlocked ? "bg-primary-light" : "bg-grey-100"
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
                  {unlocked ? (
                    <span className="text-[10px] bg-primary text-white font-bold px-2 py-0.5 rounded-full">
                      {isActive ? "Active" : "Unlocked"}
                    </span>
                  ) : (
                    <Lock size={14} className="text-ink-faint" />
                  )}
                  {!unlocked && (
                    <span className="text-[10px] text-ink-faint font-medium">Locked</span>
                  )}
                </div>
              </div>

              {/* Topic cards */}
              <div className="p-3 flex flex-col gap-2 bg-white">
                {stage.topics.map((topic, topicIndex) => (
                  <div
                    key={topic._id}
                    onClick={() => handleTopicClick(stage, unlocked)}
                    className={`rounded-xl p-3 border ${
                      unlocked
                        ? "border-border bg-white hover:border-primary hover:bg-primary-xlight transition-colors cursor-pointer"
                        : "border-border bg-grey-100 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        unlocked ? "bg-primary-light" : "bg-grey-200"
                      }`}>
                        {!unlocked ? (
                          <Lock size={10} className="text-ink-faint" />
                        ) : (
                          <ChevronRight size={10} className="text-primary" />
                        )}
                      </div>
                      <p className={`text-[13px] font-semibold leading-tight ${
                        !unlocked ? "text-ink-muted" : "text-ink"
                      }`}>
                        {topic.name}
                      </p>
                    </div>

                    <p className={`text-[11px] font-medium ml-7 ${
                      !unlocked ? "text-ink-faint" : "text-ink-muted"
                    }`}>
                      {topic.estimatedDays} days
                    </p>

                    {isActive && topicIndex === 0 && matchedCourse && (
                      <div className="mt-2 ml-7">
                        <div className="h-1 bg-grey-200 rounded-full">
                          <div
                            className="h-1 bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${progressMap[matchedCourse._id] ?? 0}%` }}
                          />
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

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-primary-light text-primary font-bold px-2 py-1 rounded-full">
              API stages[] + topics[]
            </span>
          </div>

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