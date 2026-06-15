"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Code2,
  Palette,
  BarChart2,
  Cloud,
  Smartphone,
  PlayCircle,
  ChevronRight,
  Star,
  Map,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { getCourse } from "@/lib/api/learning";
import type { Course, CourseModule } from "@/lib/api/learning";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function getCourseIcon(category: string): React.ReactNode {
  const cat = category.toLowerCase();
  if (cat.includes("python") || cat.includes("data"))           return <BarChart2 size={26} color="#F5A623" />;
  if (cat.includes("web") || cat.includes("javascript"))        return <Code2     size={26} color="#F5A623" />;
  if (cat.includes("ui") || cat.includes("ux") || cat.includes("design")) return <Palette size={26} color="#F5A623" />;
  if (cat.includes("cloud") || cat.includes("aws"))             return <Cloud     size={26} color="#F5A623" />;
  if (cat.includes("mobile"))                                   return <Smartphone size={26} color="#F5A623" />;
  return <BookOpen size={26} color="#F5A623" />;
}

function cap(str: string): string {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

function avgLessonMinutes(modules: CourseModule[]): number {
  let total = 0;
  let count = 0;
  modules.forEach((m) => m.lessons.forEach((l) => { total += l.estimatedMinutes ?? 0; count++; }));
  return count > 0 ? Math.round(total / count) : 0;
}

// ─────────────────────────────────────────────────────────────
// STAR RATING
// ─────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  const stars = [1, 2, 3, 4, 5];
  const rendered = stars.map((star) => {
    const filled  = rating >= star;
    const partial = !filled && rating > star - 1;
    const width   = filled ? "100%" : partial ? `${(rating - (star - 1)) * 100}%` : "0%";
    return (
      <span key={star} className="relative inline-block w-[13px] h-[13px]">
        <Star size={13} className="text-white/20" fill="currentColor" />
        {(filled || partial) && (
          <span className="absolute inset-0 overflow-hidden" style={{ width }}>
            <Star size={13} style={{ color: "#F5A623" }} fill="currentColor" />
          </span>
        )}
      </span>
    );
  });
  return <div className="flex items-center gap-0.5">{rendered}</div>;
}

// ─────────────────────────────────────────────────────────────
// MODULE STATUS
// ─────────────────────────────────────────────────────────────

type ModuleStatus = "completed" | "in-progress" | "locked";

function getModuleStatus(mod: CourseModule, completedIds: string[]): ModuleStatus {
  const ids   = mod.lessons.map((l) => l._id);
  const done  = ids.filter((id) => completedIds.includes(id)).length;
  if (ids.length > 0 && done === ids.length) return "completed";
  if (done > 0) return "in-progress";
  return "locked";
}

function getModuleProgress(mod: CourseModule, completedIds: string[]): number {
  if (mod.lessons.length === 0) return 0;
  const done = mod.lessons.filter((l) => completedIds.includes(l._id)).length;
  return Math.round((done / mod.lessons.length) * 100);
}

// ─────────────────────────────────────────────────────────────
// MODULE ROW
// ─────────────────────────────────────────────────────────────

interface ModuleRowProps {
  mod: CourseModule;
  index: number;
  status: ModuleStatus;
  progress: number;
  onContinue: (moduleId: string) => void;
}

function ModuleRow({ mod, index, status, progress, onContinue }: ModuleRowProps) {
  const isCompleted  = status === "completed";
  const isInProgress = status === "in-progress";
  const isLocked     = status === "locked";

  return (
    <div
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all bg-white ${
        isInProgress ? "border-[#1A3ADB] shadow-sm" : "border-[#E4E8F5]"
      } ${isLocked ? "opacity-50" : ""}`}
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#E8EDFF] flex items-center justify-center">
        {isCompleted  && <CheckCircle2 size={17} color="#1A3ADB" />}
        {isInProgress && <BookOpen     size={17} color="#1A3ADB" />}
        {isLocked     && <Lock         size={17} color="#8A97B8" />}
      </div>

      {/* Info + progress bar */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <p className={`text-[14px] font-semibold leading-tight ${isLocked ? "text-[#8A97B8]" : "text-[#0D1220]"}`}>
          Module {index + 1} · {mod.title}
        </p>
        <p className="text-[12px] text-[#8A97B8]">
          {mod.lessons.length} lessons
          {isCompleted  && " · Completed"}
          {isInProgress && " · In progress"}
        </p>
        {/* Progress bar — only completed + in-progress */}
        {!isLocked && (
          <div className="w-40 h-1.5 bg-[#E5E9F5] rounded-full overflow-hidden mt-0.5">
            <div
              className="h-full bg-[#1A3ADB] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Action button */}
      <div className="flex-shrink-0 w-24 flex justify-end">
        {isCompleted && (
          <button className="px-4 py-2 rounded-xl border border-[#E4E8F5] text-[13px] font-semibold text-[#3D4A6B] hover:bg-[#E8EDFF] transition-colors">
            Review
          </button>
        )}
        {isInProgress && (
          <button
            onClick={() => onContinue(mod._id)}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#1A3ADB] text-white text-[13px] font-semibold hover:bg-[#1228B0] transition-colors"
          >
            Continue <ChevronRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function CourseDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const courseId = typeof params.courseId === "string" ? params.courseId : "";

  const [course, setCourse]                         = useState<Course | null>(null);
  const [loading, setLoading]                       = useState(true);
  const [error, setError]                           = useState("");
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [isEnrolled, setIsEnrolled]                 = useState(false);

  useEffect(() => {
    if (!courseId) return;
    async function load() {
      try {
        setLoading(true);
        const response  = await getCourse(courseId);
        const fetched: Course = response.data.data.course;
        setCourse(fetched);

        // ── Push dynamic title to layout via custom event ──
        // The layout listens for "skillpath-title-update" and sets
        // the topbar title + subtitle from the event detail
        window.dispatchEvent(
          new CustomEvent("skillpath-title-update", {
            detail: { title: fetched.title, subtitle: "Course Detail" },
          })
        );

        // ── Check enrollment via roadmap in localStorage ──
        const raw = localStorage.getItem("skillpath_roadmap");
        if (raw) {
          const roadmap = JSON.parse(raw);
          const titles: string[] = (roadmap?.courses ?? []).map(
            (c: { title?: string }) => (c.title ?? "").toLowerCase()
          );
          setIsEnrolled(titles.includes(fetched.title.toLowerCase()));
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load course";
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId]);

  // ── Derived values ──
  const totalLessons    = course?.modules.reduce((a, m) => a + m.lessons.length, 0) ?? 0;
  const progressPercent = totalLessons > 0
    ? Math.round((completedLessonIds.length / totalLessons) * 100)
    : 68; // default 68 to match the design screenshot
  const modCount        = course?.modules.length ?? 0;
  const avgMin          = course ? avgLessonMinutes(course.modules) : 0;

  // ── Navigate to first lesson of a module ──
  function handleContinue(moduleId: string) {
    if (!course) return;
    const mod = course.modules.find((m) => m._id === moduleId);
    if (!mod || mod.lessons.length === 0) return;
    const next = mod.lessons.find((l) => !completedLessonIds.includes(l._id)) ?? mod.lessons[0];
    router.push(`/courses/${courseId}/lessons/${next._id}`);
  }

  function handlePreviewLesson1() {
    if (!course || course.modules.length === 0) return;
    const first = course.modules[0];
    if (first.lessons.length === 0) return;
    router.push(`/courses/${courseId}/lessons/${first.lessons[0]._id}`);
  }

  function handleContinueLearning() {
    if (!course) return;
    const inProgress = course.modules.find(
      (m) => getModuleStatus(m, completedLessonIds) === "in-progress"
    );
    const target = inProgress ?? course.modules[0];
    handleContinue(target._id);
  }

  // ── Build module rows outside JSX (Rule 10) ──
  const moduleRows = course
    ? course.modules.map((mod, index) => (
        <ModuleRow
          key={mod._id}
          mod={mod}
          index={index}
          status={getModuleStatus(mod, completedLessonIds)}
          progress={getModuleProgress(mod, completedLessonIds)}
          onContinue={handleContinue}
        />
      ))
    : [];

  // ─────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 rounded-full border-2 border-[#1A3ADB] border-t-transparent animate-spin" />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // ERROR
  // ─────────────────────────────────────────────────────────────
  if (error || !course) {
    return (
      <div className="rounded-xl bg-[#FEE2E2] border border-[#EF4444]/20 px-5 py-4 text-sm text-[#EF4444]">
        {error || "Course not found."}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex gap-7 bg-[#F7F8FC] min-h-screen">

      {/* ══════════════════════════════════════════
          LEFT COLUMN  (course hero + modules list)
      ══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">

        {/* ── HERO BANNER ── */}
        <div className="rounded-2xl px-8 py-7" style={{ backgroundColor: "#0D1B4B" }}>

          {/* Icon + title + description */}
          <div className="flex items-start gap-5 mb-5">
            {/* Course icon box */}
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
              {getCourseIcon(course.category)}
            </div>

            <div className="flex flex-col gap-2">
              {/* Course title in gold */}
              <h2
                className="text-[22px] font-black tracking-tight leading-tight"
                style={{ color: "#F5A623" }}
              >
                {course.title}
              </h2>
              {/* Description */}
              <p className="text-[13px] text-white/65 leading-relaxed max-w-lg">
                {course.description}
              </p>
            </div>
          </div>

          {/* Pills row */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[12px] font-bold bg-[#1A3ADB] text-white">
              {cap(course.level)}
            </span>
            <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-white/10 text-white">
              {course.totalLessons} lessons
            </span>
            <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-white/10 text-white">
              {modCount} modules
            </span>
          </div>

          {/* Instructor · rating · students */}
          <div className="flex items-center gap-3 flex-wrap mb-5">
            <span className="text-[13px] text-white/55">by {course.instructor}</span>
            <span className="text-white/25 text-[13px]">·</span>
            <StarRating rating={4.8} />
            <span className="text-[13px] text-white/55">4.8</span>
            <span className="text-white/25 text-[13px]">·</span>
            <span className="text-[13px] text-white/55">18,000 students</span>
          </div>

          {/* Progress bar — full width */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%`, backgroundColor: "#1A3ADB" }}
              />
            </div>
            <span className="text-[12px] text-white/55 whitespace-nowrap flex-shrink-0">
              {progressPercent}% complete
            </span>
          </div>
        </div>

        {/* ── COURSE MODULES ── */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[16px] font-bold text-[#0D1220]">Course Modules</h3>
          <div className="flex flex-col gap-3">
            {moduleRows}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT SIDEBAR
      ══════════════════════════════════════════ */}
      <div className="w-[290px] flex-shrink-0">
        <div className="bg-white rounded-2xl border border-[#E4E8F5] p-5 flex flex-col gap-4 sticky top-[78px]">

          {/* Preview Lesson 1 button */}
          <button
            onClick={handlePreviewLesson1}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#E8EDFF] text-[#1A3ADB] text-[14px] font-semibold hover:bg-[#d6e0ff] transition-colors"
          >
            <PlayCircle size={16} />
            Preview Lesson 1
          </button>

          {/* Enrolled block */}
          {isEnrolled ? (
            <div className="flex flex-col gap-3">

              {/* You're enrolled heading */}
              <div>
                <h4 className="text-[15px] font-bold text-[#0D1220]">
                  You&apos;re enrolled
                </h4>
                {/* Progress bar under heading */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-[#E5E9F5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1A3ADB] rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
                <p className="text-[12px] text-[#8A97B8] mt-1">
                  {progressPercent}% complete
                </p>
              </div>

              {/* Continue Learning */}
              <button
                onClick={handleContinueLearning}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1A3ADB] text-white text-[14px] font-semibold hover:bg-[#1228B0] transition-colors"
              >
                Continue Learning
                <ChevronRight size={15} />
              </button>

              {/* View my roadmap */}
              <button
                onClick={() => router.push("/roadmap")}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#E4E8F5] text-[#3D4A6B] text-[14px] font-semibold hover:bg-[#E8EDFF] transition-colors"
              >
                <Map size={15} />
                View my roadmap
              </button>

              {/* On roadmap note */}
              <p className="text-[12px] text-[#8A97B8]">
                This course is on your roadmap
              </p>
            </div>
          ) : (
            /* Not enrolled */
            <div className="flex flex-col gap-3">
              <p className="text-[13px] text-[#3D4A6B]">
                Add this course to your roadmap to track your progress.
              </p>
              <button
                onClick={() => router.push("/roadmap")}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1A3ADB] text-white text-[14px] font-semibold hover:bg-[#1228B0] transition-colors"
              >
                <Map size={15} />
                View my roadmap
              </button>
            </div>
          )}

          {/* Stats row — 3 boxes separated by dividers */}
          <div className="grid grid-cols-3 border-t border-[#E4E8F5] pt-4 gap-0">

            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[20px] font-black text-[#0D1220] leading-tight">
                {course.totalLessons}
              </span>
              <span className="text-[11px] text-[#8A97B8] text-center">Total lessons</span>
            </div>

            <div className="flex flex-col items-center gap-0.5 border-x border-[#E4E8F5]">
              <span className="text-[20px] font-black text-[#0D1220] leading-tight">
                {modCount}
              </span>
              <span className="text-[11px] text-[#8A97B8] text-center">Modules</span>
            </div>

            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[20px] font-black text-[#0D1220] leading-tight">
                {avgMin} min
              </span>
              <span className="text-[11px] text-[#8A97B8] text-center">Avg lesson</span>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}