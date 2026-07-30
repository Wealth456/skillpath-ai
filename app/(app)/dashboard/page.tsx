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
  Clock,
} from "lucide-react";
import { getCourses, getProgressSummary, getEnrollments } from "@/lib/api/learning";
import type { Enrollment } from "@/lib/api/learning";
import { getRoadmap } from "@/lib/api/roadmap";
import { useRouter } from "next/navigation";

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

// ── WEEKLY CHART ──────────────────────────────────────────────────────────────
function WeeklyChart() {
  const days = [
    { day: "M", lessons: 3 },
    { day: "T", lessons: 5 },
    { day: "W", lessons: 4 },
    { day: "T", lessons: 7 },
    { day: "F", lessons: 2 },
    { day: "S", lessons: 1 },
    { day: "S", lessons: 0 },
  ];
  const max = Math.max(...days.map((d) => d.lessons));

  return (
    <div className="flex items-end justify-between gap-2 h-20 mt-2">
      {days.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div
            className={`w-full rounded-t-md transition-all ${
              d.lessons === max ? "bg-primary" : "bg-grey-200"
            }`}
            style={{ height: max > 0 ? `${(d.lessons / max) * 56}px` : "4px" }}
          />
          <span className="text-[10px] text-ink-faint">{d.day}</span>
        </div>
      ))}
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

  // Real per-course progress — now sourced from GET /api/learning/progress/summary
  // instead of localStorage completed lesson IDs. Keyed by courseId → percentage (0-100).
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  // Total lessons completed across ALL courses — now the `totalLessonsCompleted`
  // field from the progress summary, instead of a value computed client-side
  // from localStorage.
  const [totalLessonsDone, setTotalLessonsDone] = useState(0);

  // Full course objects the user is actually enrolled in (from
  // GET /api/learning/enrollments), sorted by progress descending.
  // Drives the "Continue Learning" section — previously this section
  // just showed courses.slice(0, 2), i.e. whatever 2 courses happened
  // to be first in the full catalogue, enrolled or not.
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

  // Just the IDs of enrolled courses, used to filter them OUT of
  // "Recommended for You" so it doesn't recommend courses the user
  // is already taking.
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);

  useEffect(() => {
    // ── READ USER NAME ──────────────────────────────────────────────────────
    const name = localStorage.getItem("skillpath_name") || "";
    setUserName(name.split(" ")[0] || "there");

    // ── READ THIS USER'S ROADMAP ────────────────────────────────────────────
    // Fast path: already cached locally.
    const savedRoadmap = localStorage.getItem("skillpath_roadmap");
    if (savedRoadmap) {
      try {
        setRoadmap(JSON.parse(savedRoadmap));
      } catch {
        localStorage.removeItem("skillpath_roadmap");
      }
    } else {
      // Fallback: nothing cached (e.g. right after login, since login()
      // clears this key) — ask the backend if this user already has one.
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
            // 404 (genuinely no roadmap) or network error — dashboard
            // already handles a null `roadmap` gracefully.
          });
      }
    }

    // ── FETCH COURSES + PROGRESS SUMMARY FROM API ───────────────────────────
    async function fetchDashboardData() {
      try {
        const res = await getCourses();
        const list: Course[] = res.data?.data?.courses || [];
        setCourses(list);
      } catch (err: unknown) {
        console.error("Failed to fetch courses:", err);
      }

    // totalLessonsCompleted still comes from the summary endpoint —
      // that field IS reliable, we just can't use its per-course
      // breakdown since it has no courseId to match against.
      try {
        const summaryRes = await getProgressSummary();
        const summary = summaryRes.data.data.summary;
        setTotalLessonsDone(summary.totalLessonsCompleted);
      } catch (err: unknown) {
        console.error("Failed to fetch progress summary:", err);
        setTotalLessonsDone(0);
      }

      // Enrollments are the single source of truth for per-course progress —
      // same data source the course detail page and Profile page use, so
      // they can never disagree with the dashboard.
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
      } catch (err: unknown) {
        console.error("Failed to fetch enrollments:", err);
        setProgressMap({});
        setEnrolledCourses([]);
        setEnrolledIds([]);
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

  // Returns the number of modules in a course that are "not started"
  // for display text like "2 modules · Not started" / "In progress"
  function getCourseStatusLabel(course: Course, percent: number): string {
    const moduleCount = course.modules?.length || 0;
    if (percent === 0) return `${moduleCount} modules · Not started`;
    if (percent === 100) return `${moduleCount} modules · Completed`;
    return `${moduleCount} modules · In progress`;
  }

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
          value="0 🔥"
          sub="Start your streak today"
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

          {/* Continue Learning */}
          <div className="flex gap-4">
            {enrolledCourses.length > 0 ? (
              enrolledCourses.slice(0, 2).map((course) => {
                // Read this course's real progress percentage
                const percent = progressMap[course._id] ?? 0;
                return (
                  <div
                    key={course._id}
                    className="flex-1 min-w-0 bg-white rounded-2xl border border-border p-5 shadow-card-default hover:shadow-card-hover transition-shadow"
                  >
                    <div className="inline-block bg-primary-light text-primary text-[11px] font-bold px-2 py-0.5 rounded-full mb-3">
                      {course.category}
                    </div>
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
                      {getCourseStatusLabel(course, percent)}
                    </p>
                    <Link
                      href={`/courses/${course._id}`}
                      className="block w-full text-center bg-primary hover:bg-primary-dark text-white text-[13px] font-bold py-2.5 rounded-full transition-all"
                    >
                      {percent > 0 ? "Continue Course →" : "Start Course →"}
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 min-w-0 bg-white rounded-2xl border border-border p-6 text-center">
                <BookOpen size={32} className="text-ink-faint mx-auto mb-3" />
                <p className="text-[14px] text-ink-muted mb-3">No courses yet</p>
                <Link href="/courses" className="text-primary text-[13px] font-semibold underline">
                  Browse courses →
                </Link>
              </div>
            )}
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

          {/* Bottom row: Achievements + Recommended */}
          <div className="flex gap-4">

            {/* Recent Achievements */}
            <div className="flex-1 min-w-0 bg-white rounded-2xl border border-border p-5 shadow-card-default">
              <h3 className="text-[15px] font-bold text-ink mb-4">Recent Achievements</h3>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Trophy size={28} className="text-ink-faint mb-2" />
                <p className="text-[13px] text-ink-muted">
                  Complete your first lesson to earn achievements
                </p>
              </div>
            </div>

            {/* Recommended Courses */}
            <div className="flex-1 min-w-0 bg-white rounded-2xl border border-border p-5 shadow-card-default">
              <h3 className="text-[15px] font-bold text-ink mb-4">Recommended for You</h3>
              <div className="flex flex-col gap-3">
                {courses.filter((course) => !enrolledIds.includes(course._id)).map((course) => (
                  <div key={course._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <BookOpen size={13} className="text-primary flex-shrink-0" />
                      <span className="text-[13px] text-ink truncate">{course.title}</span>
                    </div>
                    <Link
                      href={`/courses/${course._id}`}
                      className="text-[12px] font-semibold text-primary hover:underline flex-shrink-0 ml-2"
                    >
                      Start →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="w-[240px] flex-shrink-0 flex flex-col gap-5">

          {/* Today's Goals */}
          <div className="bg-white rounded-2xl border border-border p-5 shadow-card-default">
            <h3 className="text-[15px] font-bold text-ink mb-4">Today&apos;s Goals</h3>
            {roadmap ? (
              <div className="flex flex-col gap-2.5">
                {roadmap.stages[0]?.topics.slice(0, 3).map((topic) => (
                  <div key={topic._id} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-grey-200 flex-shrink-0" />
                    <span className="text-[13px] text-ink">{topic.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-ink-muted text-center py-4">
                Generate your roadmap to see daily goals
              </p>
            )}
          </div>

          {/* Weekly Activity */}
          <div className="bg-white rounded-2xl border border-border p-5 shadow-card-default">
            <h3 className="text-[15px] font-bold text-ink mb-1">Weekly Activity</h3>
            <p className="text-[12px] text-ink-muted">Lessons completed per day</p>
            <WeeklyChart />
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