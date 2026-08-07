"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Flame,
  Map,
  ChevronRight,
  Sparkles,
  Trophy,
  CheckCircle2,
  Check,
  Clock,
} from "lucide-react";
import { getCourses, getProgressSummary, getEnrollments, enrollInCourse } from "@/lib/api/learning";
import type { Enrollment } from "@/lib/api/learning";
import { getRoadmap } from "@/lib/api/roadmap";
import { useRouter } from "next/navigation";
import PageNav from "@/components/PageNav";

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface Lesson {
  _id: string;
  title: string;
  order: number;
}

interface CourseModule {
  _id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  _id: string;
  title: string;
  category: string;
  level: string;
  instructor: string;
  totalLessons: number;
  modules: CourseModule[];
}

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

// ── DATE HELPERS ──────────────────────────────────────────────────────────────
// Both derived from real `lastAccessedAt` timestamps returned per
// enrollment by the backend — not invented data. Limitation: this
// reflects "a course was opened that day", not per-lesson granularity,
// since the backend doesn't expose per-lesson completion timestamps.

function toDateKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function computeActiveDayKeys(enrollments: Enrollment[]): Set<string> {
  const keys = new Set<string>();
  enrollments.forEach((e) => {
    if (e.progress?.lastAccessedAt) {
      keys.add(toDateKey(e.progress.lastAccessedAt));
    }
  });
  return keys;
}

function computeStreak(activeDayKeys: Set<string>): number {
  if (activeDayKeys.size === 0) return 0;

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  // Streak only counts as "current" if today or yesterday had activity —
  // otherwise it's a broken streak, so it resets to 0.
  if (!activeDayKeys.has(todayKey) && !activeDayKeys.has(yesterdayKey)) {
    return 0;
  }

  let streak = 0;
  const cursor = activeDayKeys.has(todayKey) ? new Date(today) : new Date(yesterday);

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (activeDayKeys.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function getLast7DaysActivity(activeDayKeys: Set<string>): { day: string; active: boolean }[] {
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const result: { day: string; active: boolean }[] = [];
  const today = new Date();

  // Find this week's Monday. getDay() returns 0=Sun..6=Sat, so we
  // calculate how many days back Monday is (Sunday wraps to 6 days back).
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(today);
  monday.setDate(monday.getDate() - daysSinceMonday);

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    // Don't mark future days within this week as active — only today
    // and past days are checked against real access data.
    const isFuture = d > today;
    result.push({ day: labels[i], active: !isFuture && activeDayKeys.has(key) });
  }

  return result;
}

// ── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
}) {
  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-border p-5 shadow-card-default">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-semibold text-ink-muted">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className="text-[30px] font-black text-ink leading-none mb-1">{value}</p>
      <p className="text-[12px] text-primary font-semibold">{sub}</p>
    </div>
  );
}

// ── WEEKLY ACTIVITY CHART — real, based on lastAccessedAt ─────────────────────
function WeeklyChart({ activeDayKeys }: { activeDayKeys: Set<string> }) {
  const days = getLast7DaysActivity(activeDayKeys);

  return (
    <div className="flex items-end justify-between gap-2 h-20 mt-2">
      {days.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div
            className={`w-full rounded-t-md transition-all ${
              d.active ? "bg-primary" : "bg-grey-200"
            }`}
            style={{ height: d.active ? "56px" : "4px" }}
          />
          <span className="text-[10px] text-ink-faint">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

// ── ROADMAP-RECOMMENDED CARD (left side of Continue Learning) ────────────────
function RoadmapCourseCard({
  course,
  percent,
  isEnrolled,
}: {
  course: Course | null;
  percent: number;
  isEnrolled: boolean;
}) {
  const router = useRouter();
  const [enrolling, setEnrolling] = useState(false);

  async function handleStart() {
    if (!course) return;

    if (isEnrolled) {
      router.push(`/courses/${course._id}`);
      return;
    }

    try {
      setEnrolling(true);
      await enrollInCourse(course._id);
    } catch {
      // Already enrolled server-side, or a transient error — still navigate.
    } finally {
      setEnrolling(false);
      router.push(`/courses/${course._id}`);
    }
  }

  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-border p-5 shadow-card-default hover:shadow-card-hover transition-shadow">
      <div className="inline-block bg-primary-light text-primary text-[11px] font-bold px-2 py-0.5 rounded-full mb-3">
        From Your Roadmap
      </div>

      {course ? (
        <>
          <h3 className="text-[15px] font-bold text-ink mb-1">{course.title}</h3>
          <p className="text-[12px] text-ink-muted mb-3">
            By {course.instructor} · {course.totalLessons} lessons
          </p>
          <div className="mb-1">
            <div className="flex justify-between mb-1">
              <span className="text-[12px] text-ink-muted">Progress</span>
              <span className="text-[12px] font-semibold text-primary">{percent}%</span>
            </div>
            <div className="h-1.5 bg-grey-200 rounded-full overflow-hidden">
              <div
                className="h-1.5 bg-primary rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-ink-faint mb-4">
            Your current roadmap stage
          </p>
          <button
            onClick={handleStart}
            disabled={enrolling}
            className="block w-full text-center bg-primary hover:bg-primary-dark text-white text-[13px] font-bold py-2.5 rounded-full transition-all disabled:opacity-60"
          >
            {enrolling ? "Starting..." : percent > 0 ? "Continue Course →" : "Start Course →"}
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Map size={28} className="text-ink-faint mb-2" />
          <p className="text-[13px] text-ink-muted mb-3">
            No matching course found for your roadmap yet
          </p>
          <Link href="/roadmap" className="text-primary text-[13px] font-semibold underline">
            View roadmap →
          </Link>
        </div>
      )}
    </div>
  );
}

// ── ENROLLED CARD (right side of Continue Learning) ──────────────────────────
function EnrolledCourseCard({
  course,
  percent,
}: {
  course: Course | null;
  percent: number;
}) {
  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-border p-5 shadow-card-default hover:shadow-card-hover transition-shadow">
      <div className="inline-block bg-primary-light text-primary text-[11px] font-bold px-2 py-0.5 rounded-full mb-3">
        Your Enrolled Courses
      </div>

      {course ? (
        <>
          <h3 className="text-[15px] font-bold text-ink mb-1">{course.title}</h3>
          <p className="text-[12px] text-ink-muted mb-3">
            By {course.instructor} · {course.totalLessons} lessons
          </p>
          <div className="mb-1">
            <div className="flex justify-between mb-1">
              <span className="text-[12px] text-ink-muted">Progress</span>
              <span className="text-[12px] font-semibold text-primary">{percent}%</span>
            </div>
            <div className="h-1.5 bg-grey-200 rounded-full overflow-hidden">
              <div
                className="h-1.5 bg-primary rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-ink-faint mb-4">
            {percent === 100 ? "Completed" : percent > 0 ? "In progress" : "Not started"}
          </p>
          <Link
            href={`/courses/${course._id}`}
            className="block w-full text-center bg-primary hover:bg-primary-dark text-white text-[13px] font-bold py-2.5 rounded-full transition-all"
          >
            {percent > 0 ? "Continue Course →" : "Start Course →"}
          </Link>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <BookOpen size={28} className="text-ink-faint mb-2" />
          <p className="text-[13px] text-ink-muted mb-3">No other enrolled courses yet</p>
          <Link href="/courses" className="text-primary text-[13px] font-semibold underline">
            Browse courses →
          </Link>
        </div>
      )}
    </div>
  );
}

// ── DASHBOARD PAGE ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [courses, setCourses]   = useState<Course[]>([]);
  const [roadmap, setRoadmap]   = useState<Roadmap | null>(null);
  const [userName, setUserName] = useState("there");
  const [loading, setLoading]   = useState(true);

  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [totalLessonsDone, setTotalLessonsDone] = useState(0);

  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [activeDayKeys, setActiveDayKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const name = localStorage.getItem("skillpath_name") || "";
    setUserName(name.split(" ")[0] || "there");

    const savedRoadmap = localStorage.getItem("skillpath_roadmap");
    if (savedRoadmap) {
      try {
        setRoadmap(JSON.parse(savedRoadmap));
      } catch {
        localStorage.removeItem("skillpath_roadmap");
      }
    } else {
      const userId = localStorage.getItem("skillpath_user_id");
      if (userId) {
        getRoadmap(userId)
          .then((response) => {
            const fetched = response.data?.data?.roadmap;
            if (fetched) {
              setRoadmap(fetched);
              localStorage.setItem("skillpath_roadmap", JSON.stringify(fetched));
            }
          })
          .catch(() => {
            // 404 or network error
          });
      }
    }

    async function fetchDashboardData() {
      try {
        const res = await getCourses();
        const list: Course[] = res.data?.data?.courses || [];
        setCourses(list);
      } catch (err: unknown) {
        console.error("Failed to fetch courses:", err);
      }

      try {
        const summaryRes = await getProgressSummary();
        const summary = summaryRes.data.data.summary;
        setTotalLessonsDone(summary.totalLessonsCompleted);
      } catch (err: unknown) {
        console.error("Failed to fetch progress summary:", err);
        setTotalLessonsDone(0);
      }

      try {
        const enrollRes = await getEnrollments();
        const enrollments: Enrollment[] = enrollRes.data.data.enrollments ?? [];

        const progress: Record<string, number> = {};
        enrollments.forEach((enrollment) => {
          progress[enrollment.course._id] = enrollment.progress?.progressPercent ?? 0;
        });
        setProgressMap(progress);

        const sortedByProgress = [...enrollments].sort(
          (a, b) => (b.progress?.progressPercent ?? 0) - (a.progress?.progressPercent ?? 0)
        );

        setEnrolledCourses(sortedByProgress.map((enrollment) => enrollment.course));
        setEnrolledIds(enrollments.map((enrollment) => enrollment.course._id));

        // Real streak/weekly-activity source — derived from actual
        // lastAccessedAt timestamps per enrollment.
        setActiveDayKeys(computeActiveDayKeys(enrollments));
      } catch (err: unknown) {
        console.error("Failed to fetch enrollments:", err);
        setProgressMap({});
        setEnrolledCourses([]);
        setEnrolledIds([]);
        setActiveDayKeys(new Set());
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  let roadmapCourse: Course | null = null;
  if (roadmap) {
    for (const stage of roadmap.stages) {
      const matched = matchCourseForStage(stage, courses);
      if (!matched) continue;
      const percent = progressMap[matched._id] ?? 0;
      if (percent < 100) {
        roadmapCourse = matched;
        break;
      }
    }
  }
  const roadmapCoursePercent = roadmapCourse ? progressMap[roadmapCourse._id] ?? 0 : 0;
  const roadmapCourseIsEnrolled = roadmapCourse ? enrolledIds.includes(roadmapCourse._id) : false;

  const topEnrolledCourse = enrolledCourses.find((c) => c._id !== roadmapCourse?._id) ?? null;
  const topEnrolledPercent = topEnrolledCourse ? progressMap[topEnrolledCourse._id] ?? 0 : 0;

  const streak = computeStreak(activeDayKeys);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[14px] text-ink-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageNav />
      {/* ── PAGE HEADER ── */}
      <div className="mb-6">
        <h1 className="text-[28px] font-black text-ink tracking-tight">
          {getGreeting()}, {userName} 👋
        </h1>
        <p className="text-[14px] text-ink-muted mt-0.5">
          {roadmap
            ? `Your roadmap: ${roadmap.title} · ${roadmap.estimatedWeeks} weeks`
            : "Continue your learning journey"}
        </p>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="flex gap-4 mb-6">
        <StatCard
          icon={<BookOpen size={15} className="text-primary" />}
          label="Available Courses"
          value={courses.length}
          sub={courses.length > 0 ? "Pick one to start" : "Browse courses"}
        />
        <StatCard
          icon={<CheckCircle2 size={15} className="text-primary" />}
          label="Lessons Done"
          value={totalLessonsDone}
          sub={totalLessonsDone > 0 ? "Keep it up!" : "Start learning!"}
        />
        <StatCard
          icon={<Flame size={15} className="text-primary" />}
          label="Day Streak"
          value={`${streak} 🔥`}
          sub={streak > 0 ? "Keep the momentum going!" : "Learn today to start your streak"}
        />
        <StatCard
          icon={<Map size={15} className="text-primary" />}
          label="Roadmap Progress"
          value={roadmap ? `${roadmap.stages.length} stages` : "—"}
          sub={roadmap ? `${roadmap.estimatedWeeks} weeks total` : "Not generated yet"}
        />
      </div>

      {/* ── MAIN GRID ── */}
      <div className="flex gap-6">

        {/* ── LEFT COLUMN ── */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">

          {/* Continue Learning — two equal cards */}
          <div className="flex gap-4">
            <RoadmapCourseCard
              course={roadmapCourse}
              percent={roadmapCoursePercent}
              isEnrolled={roadmapCourseIsEnrolled}
            />
            <EnrolledCourseCard course={topEnrolledCourse} percent={topEnrolledPercent} />
          </div>

          {/* AI Tip Banner */}
          {roadmap && roadmap.stages.length > 0 && (
            <div className="bg-sidebar rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-primary-light mb-1 uppercase tracking-wide">
                    AI Tip — from your roadmap
                  </p>
                  <p className="text-[13px] text-white/80 leading-relaxed">
                    You are currently on{" "}
                    <span className="text-white font-semibold">
                      {roadmap.stages[0].title}
                    </span>
                    {" "}— {roadmap.stages[0].topics.length} topics in this stage.
                    Stay consistent and you will finish in no time!
                  </p>
                </div>
              </div>
              <Link
                href="/roadmap"
                className="flex-shrink-0 flex items-center gap-1 bg-primary hover:bg-primary-dark text-white text-[13px] font-bold px-4 py-2 rounded-full transition-all"
              >
                View roadmap <ChevronRight size={14} />
              </Link>
            </div>
          )}

          {/* Roadmap Stages from API */}
          {roadmap && (
            <div className="bg-white rounded-2xl border border-border p-5 shadow-card-default">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[16px] font-bold text-ink">{roadmap.title}</h3>
                  <p className="text-[12px] text-ink-muted">
                    {roadmap.stages.length} stages · {roadmap.estimatedWeeks} weeks total
                  </p>
                </div>
                <Link
                  href="/roadmap"
                  className="text-[13px] font-semibold text-primary hover:underline"
                >
                  Full roadmap →
                </Link>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">
                {roadmap.stages.map((stage, i) => (
                  <div
                    key={stage.stage}
                    onClick={() => router.push("/roadmap")}
                    className={`flex-shrink-0 w-44 p-4 rounded-xl border-2 cursor-pointer transition-transform hover:scale-[1.02] ${
                      i === 0
                        ? "border-primary bg-primary-light"
                        : "border-border bg-grey-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] text-ink-faint font-semibold">
                        Stage {stage.stage}
                      </p>
                      {i === 0 && (
                        <span className="text-[10px] bg-primary text-white font-bold px-1.5 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] font-bold text-ink mb-1">{stage.title}</p>
                    <p className="text-[11px] text-ink-faint">
                      {stage.topics.length} topics
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

         {/* Recent Achievements — computed from real progress data:
              totalLessonsDone and per-course completion percentages.
              Not a stored/persisted achievement system on the backend —
              these are derived client-side each load from real numbers. */}
          <div className="bg-white rounded-2xl border border-border p-5 shadow-card-default">
            <h3 className="text-[15px] font-bold text-ink mb-4">Recent Achievements</h3>
            {(() => {
              const achievements: { emoji: string; label: string }[] = [];

              if (totalLessonsDone >= 1) {
                achievements.push({ emoji: "🎯", label: "First Lesson Complete" });
              }
              if (totalLessonsDone >= 5) {
                achievements.push({ emoji: "📚", label: "5 Lessons Completed" });
              }
              enrolledCourses.forEach((course) => {
                const percent = progressMap[course._id] ?? 0;
                if (percent === 100) {
                  achievements.push({ emoji: "🏆", label: `${course.title} Completed` });
                } else if (percent >= 50) {
                  achievements.push({ emoji: "🔥", label: `${course.title} — Halfway There` });
                }
              });

              if (achievements.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Trophy size={28} className="text-ink-faint mb-2" />
                    <p className="text-[13px] text-ink-muted">
                      Complete your first lesson to earn achievements
                    </p>
                  </div>
                );
              }

              return (
                <div className="flex flex-col gap-2.5">
                  {achievements.slice(0, 4).map((a, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="text-[18px]">{a.emoji}</span>
                      <span className="text-[13px] font-semibold text-ink">{a.label}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="w-[240px] flex-shrink-0 flex flex-col gap-5">

          {/* Today's Goals — now real: links to the matched course for
              the active stage, shows a check if that course is fully
              complete. Per-topic tracking isn't possible since topics
              aren't individually linked to lessons in the backend. */}
          <div className="bg-white rounded-2xl border border-border p-5 shadow-card-default">
            <h3 className="text-[15px] font-bold text-ink mb-4">Today&apos;s Goals</h3>
            {roadmap && roadmapCourse ? (
              <div className="flex flex-col gap-2.5">
                {roadmap.stages[0]?.topics.slice(0, 3).map((topic) => (
                  <div key={topic._id} className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        roadmapCoursePercent === 100
                          ? "bg-primary border-primary"
                          : "border-grey-200"
                      }`}
                    >
                      {roadmapCoursePercent === 100 && (
                        <Check size={11} className="text-white" />
                      )}
                    </div>
                    <span className="text-[13px] text-ink">{topic.name}</span>
                  </div>
                ))}
                <Link
                  href={`/courses/${roadmapCourse._id}`}
                  className="text-[12px] font-semibold text-primary hover:underline mt-1"
                >
                  {roadmapCoursePercent === 100 ? "Stage complete →" : "Continue this stage →"}
                </Link>
              </div>
            ) : roadmap ? (
              <p className="text-[13px] text-ink-muted text-center py-4">
                No matching course found for this stage yet
              </p>
            ) : (
              <p className="text-[13px] text-ink-muted text-center py-4">
                Generate your roadmap to see daily goals
              </p>
            )}
          </div>

          {/* Weekly Activity — real, from lastAccessedAt timestamps */}
          <div className="bg-white rounded-2xl border border-border p-5 shadow-card-default">
            <h3 className="text-[15px] font-bold text-ink mb-1">Weekly Activity</h3>
            <p className="text-[12px] text-ink-muted">Days you accessed a course</p>
            <WeeklyChart activeDayKeys={activeDayKeys} />
          </div>

          {/* Roadmap Summary */}
          {roadmap && (
            <div className="bg-sidebar rounded-2xl p-5">
              <p className="text-[11px] font-bold text-primary-light uppercase tracking-wide mb-3">
                Your Roadmap
              </p>
              <p className="text-[15px] font-black text-white mb-1">{roadmap.title}</p>
              <p className="text-[12px] text-white/60 mb-3">
                {roadmap.estimatedWeeks} weeks · {roadmap.stages.length} stages ·{" "}
                {roadmap.stages.reduce((acc, s) => acc + s.topics.length, 0)} topics
              </p>

              <div className="flex flex-col gap-1.5 mb-4">
                {roadmap.stages.slice(0, 3).map((stage, i) => (
                  <div key={stage.stage} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      i === 0 ? "bg-primary" : "bg-white/20"
                    }`} />
                    <span className={`text-[12px] truncate ${
                      i === 0 ? "text-white font-semibold" : "text-white/50"
                    }`}>
                      {stage.title}
                    </span>
                  </div>
                ))}
                {roadmap.stages.length > 3 && (
                  <p className="text-[11px] text-white/40 pl-3.5">
                    +{roadmap.stages.length - 3} more stages
                  </p>
                )}
              </div>

              <Link
                href="/roadmap"
                className="block w-full text-center bg-primary hover:bg-primary-dark text-white text-[13px] font-bold py-2 rounded-full transition-all"
              >
                View full roadmap →
              </Link>
            </div>
          )}

          {/* Upcoming */}
          <div className="bg-white rounded-2xl border border-border p-5 shadow-card-default">
            <p className="text-[11px] font-bold text-primary uppercase tracking-wide mb-2">
              Next Up
            </p>
            {roadmap ? (
              <>
                <p className="text-[14px] font-bold text-ink mb-1">
                  {roadmap.stages[0]?.topics[0]?.name || "Start learning"}
                </p>
                <div className="flex items-center gap-1 text-ink-muted mb-3">
                  <Clock size={12} />
                  <span className="text-[12px]">
                    Est. {roadmap.stages[0]?.topics[0]?.estimatedDays || 1} days
                  </span>
                </div>
                <Link
                  href="/courses"
                  className="block w-full text-center bg-primary hover:bg-primary-dark text-white text-[13px] font-bold py-2 rounded-full transition-all"
                >
                  Browse Courses →
                </Link>
              </>
            ) : (
              <p className="text-[13px] text-ink-muted text-center py-4">
                No roadmap yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}