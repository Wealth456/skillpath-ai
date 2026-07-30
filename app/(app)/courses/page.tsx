"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  BookOpen,
  Code2,
  Palette,
  BarChart2,
  Cloud,
  Smartphone,
  PlayCircle,
  ChevronRight,
  Check,
} from "lucide-react";
import { getCourses, getEnrollments, enrollInCourse } from "@/lib/api/learning";
import type { Course, Enrollment } from "@/lib/api/learning";

// ─────────────────────────────────────────────────────────────
// STATIC MOCK CARDS — shown as the bottom row of 3
// The backend only seeds 3 courses; the design shows 6 total.
// These fill the second row with realistic-looking data.
// ─────────────────────────────────────────────────────────────

interface MockCourse {
  _id: string;
  title: string;
  level: string;
  totalLessons: number;
  instructor: string;
  category: string;
  rating: number;
  students: string;
  headerBg: string; // coloured top band unique to each mock card
}

// Written out individually — Rule 10 (no .map in JSX)
const MOCK_COURSES: MockCourse[] = [
  {
    _id: "mock-1",
    title: "Data Science Python",
    level: "Intermediate",
    totalLessons: 40,
    instructor: "Emeka Nwachukwu",
    category: "data",
    rating: 4.8,
    students: "9k",
    headerBg: "#FFF8E7",
  },
  {
    _id: "mock-2",
    title: "AWS Cloud Foundations",
    level: "Beginner",
    totalLessons: 28,
    instructor: "Kemi Adeleke",
    category: "cloud",
    rating: 4.6,
    students: "7k",
    headerBg: "#EAF4FF",
  },
  {
    _id: "mock-3",
    title: "JavaScript Deep Dive",
    level: "Intermediate",
    totalLessons: 44,
    instructor: "Femi Olusanya",
    category: "web",
    rating: 4.9,
    students: "15k",
    headerBg: "#FFF8E7",
  },
];

// ─────────────────────────────────────────────────────────────
// FILTER TABS
// ─────────────────────────────────────────────────────────────

const FILTER_TABS = ["All", "Web Dev", "Data Science", "UI/UX", "Python", "Cloud", "Mobile"];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function getCourseIcon(category: string | undefined | null): { icon: React.ReactNode; bg: string } {
  const cat = (category ?? "").toLowerCase();

  if (cat.includes("python") || cat.includes("data")) {
    return { icon: <BarChart2 size={20} color="#1A3ADB" />, bg: "#E8EDFF" };
  }
  if (cat.includes("web") || cat.includes("javascript") || cat.includes("js")) {
    return { icon: <Code2 size={20} color="#1A3ADB" />, bg: "#E8EDFF" };
  }
  if (cat.includes("ui") || cat.includes("ux") || cat.includes("design")) {
    return { icon: <Palette size={20} color="#1A3ADB" />, bg: "#E8EDFF" };
  }
  if (cat.includes("cloud") || cat.includes("aws")) {
    return { icon: <Cloud size={20} color="#1A3ADB" />, bg: "#E8EDFF" };
  }
  if (cat.includes("mobile")) {
    return { icon: <Smartphone size={20} color="#1A3ADB" />, bg: "#E8EDFF" };
  }
  return { icon: <BookOpen size={20} color="#1A3ADB" />, bg: "#E8EDFF" };
}

function formatLevel(level: string | undefined | null): string {
  if (!level) return "";
  return level.charAt(0).toUpperCase() + level.slice(1);
}

// ─────────────────────────────────────────────────────────────
// STAR RATING COMPONENT
// ─────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  const starList = [1, 2, 3, 4, 5];

  const rendered = starList.map((star) => {
    const filled = rating >= star;
    const partial = !filled && rating > star - 1;
    const fillWidth = filled ? "100%" : partial ? `${(rating - (star - 1)) * 100}%` : "0%";

    return (
      <span key={star} className="relative inline-block w-[14px] h-[14px]">
        <Star size={14} className="text-[#E5E9F5]" fill="currentColor" />
        {(filled || partial) && (
          <span className="absolute inset-0 overflow-hidden" style={{ width: fillWidth }}>
            <Star size={14} style={{ color: "#F5A623" }} fill="currentColor" />
          </span>
        )}
      </span>
    );
  });

  return <div className="flex items-center gap-0.5">{rendered}</div>;
}

// ─────────────────────────────────────────────────────────────
// REAL COURSE CARD (from API)
// ─────────────────────────────────────────────────────────────

interface RealCardProps {
  course: Course;
  enrolled: boolean;
  enrolling: boolean;
  progressPercent: number;
  onView: (id: string) => void;
  onEnroll: (id: string) => void;
}

function RealCourseCard({ course, enrolled, enrolling, progressPercent, onView, onEnroll }: RealCardProps) {
  const { icon, bg } = getCourseIcon(course.category);
  const displayRating = 4.8;
  const displayStudents = enrolled ? "23k" : "12k";

  return (
    <div className="bg-white rounded-2xl border border-[#E4E8F5] overflow-hidden flex flex-col">
      {/* Coloured top band with icon + enrolled badge */}
      <div className="bg-[#F0F3FF] px-5 pt-5 pb-4 flex items-start justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
          {icon}
        </div>
        {enrolled && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#1A3ADB] text-white">
            Enrolled
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="px-5 pb-5 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-[#0D1220] text-[15px] leading-snug mt-3">
          {course.title ?? "Untitled course"}
        </h3>

        <p className="text-[12px] text-[#8A97B8]">
          {formatLevel(course.level)} · {course.totalLessons ?? 0} lessons
        </p>

        <p className="text-[12px] text-[#3D4A6B]">by {course.instructor ?? "Unknown instructor"}</p>

        <div className="flex items-center gap-2 mt-1">
          <StarRating rating={displayRating} />
          <span className="text-[12px] font-semibold text-[#0D1220]">{displayRating}</span>
          <span className="text-[12px] text-[#8A97B8]">({displayStudents} students)</span>
        </div>

        {/* Progress bar — enrolled cards only, now reflects real backend progress */}
        {enrolled && (
          <div className="flex flex-col gap-1 mt-2">
            <div className="w-full h-1.5 bg-[#E5E9F5] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1A3ADB] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-[#8A97B8]">{progressPercent}% complete</span>
          </div>
        )}

        <div className="flex-1" />

        {/* Two buttons when not enrolled: View course + Enroll */}
        {enrolled ? (
          <button
            onClick={() => onView(course._id)}
            className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold bg-[#1A3ADB] text-white hover:bg-[#1228B0] transition-colors duration-150"
          >
            <PlayCircle size={14} />
            Continue
          </button>
        ) : (
          <div className="flex flex-col gap-2 mt-3">
            <button
              onClick={() => onView(course._id)}
              className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold border border-[#E4E8F5] text-[#3D4A6B] hover:bg-[#E8EDFF] transition-colors duration-150"
            >
              View course
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => onEnroll(course._id)}
              disabled={enrolling}
              className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold bg-[#1A3ADB] text-white hover:bg-[#1228B0] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Check size={14} />
              {enrolling ? "Enrolling..." : "Enroll now"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MOCK COURSE CARD (static bottom row)
// ─────────────────────────────────────────────────────────────

interface MockCardProps {
  course: MockCourse;
  onView: (id: string) => void;
}

function MockCourseCard({ course, onView }: MockCardProps) {
  const { icon } = getCourseIcon(course.category);

  return (
    <div className="bg-white rounded-2xl border border-[#E4E8F5] overflow-hidden flex flex-col">
      <div className="px-5 pt-5 pb-4 flex items-start" style={{ backgroundColor: course.headerBg }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "#fff", opacity: 0.9 }}
        >
          {icon}
        </div>
      </div>

      <div className="px-5 pb-5 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-[#0D1220] text-[15px] leading-snug mt-3">{course.title}</h3>
        <p className="text-[12px] text-[#8A97B8]">{course.level} · {course.totalLessons} lessons</p>
        <p className="text-[12px] text-[#3D4A6B]">by {course.instructor}</p>

        <div className="flex items-center gap-2 mt-1">
          <StarRating rating={course.rating} />
          <span className="text-[12px] font-semibold text-[#0D1220]">{course.rating}</span>
          <span className="text-[12px] text-[#8A97B8]">({course.students} students)</span>
        </div>

        <div className="flex-1" />

        <button
          onClick={() => onView(course._id)}
          className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold border border-[#E4E8F5] text-[#3D4A6B] hover:bg-[#E8EDFF] transition-colors duration-150"
        >
          View course
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function CoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [filtered, setFiltered] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasRoadmap, setHasRoadmap] = useState(false);

  // Manually enrolled course IDs — now sourced from GET /api/learning/enrollments
  // instead of localStorage. Kept separate from the roadmap-based
  // "enrolled in everything" workaround, so a user can enroll
  // in a SPECIFIC course on top of having a roadmap.
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);

  // Real progress per course — now comes from the `progressPercent`
  // field on each enrollment returned by the backend.
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  // Tracks which course is currently being enrolled in, so we can
  // disable just that one "Enroll now" button and show a spinner state.
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  // Separate error state for enroll failures, so a failed enroll
  // doesn't wipe the whole course catalogue off the screen.
  const [enrollError, setEnrollError] = useState("");

  // ── Fetch all courses + enrollments on mount ──
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const coursesRes = await getCourses();
        const list: Course[] = coursesRes.data.data.courses ?? [];
        setCourses(list);
        setFiltered(list);

        const raw = localStorage.getItem("skillpath_roadmap");
        setHasRoadmap(!!raw);

        // Enrollment data is fetched separately and non-fatally:
        // if this call fails, the catalogue still renders — the
        // user just sees everything as "not enrolled" until it succeeds.
        try {
          const enrollmentsRes = await getEnrollments();
          const enrollments: Enrollment[] = enrollmentsRes.data.data.enrollments ?? [];

          const ids = enrollments.map((enrollment) => enrollment.course._id);
          setEnrolledIds(ids);

          const progress: Record<string, number> = {};
          enrollments.forEach((enrollment) => {
            progress[enrollment.course._id] = enrollment.progress?.progressPercent ?? 0;
          });
          setProgressMap(progress);
        } catch {
          setEnrolledIds([]);
          setProgressMap({});
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load courses";
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Re-filter when tab changes ──
  useEffect(() => {
    if (activeTab === "All") {
      setFiltered(courses);
      return;
    }

    const tab = activeTab.toLowerCase();

    const result = courses.filter((c) => {
      const cat = (c.category ?? "").toLowerCase();
      if (tab === "web dev") return cat.includes("web") || cat.includes("javascript");
      if (tab === "data science") return cat.includes("data") || cat.includes("science");
      if (tab === "ui/ux") return cat.includes("ui") || cat.includes("ux") || cat.includes("design");
      if (tab === "python") return cat.includes("python");
      if (tab === "cloud") return cat.includes("cloud") || cat.includes("aws");
      if (tab === "mobile") return cat.includes("mobile");
      return true;
    });

    setFiltered(result);
  }, [activeTab, courses]);

  function handleView(id: string) {
    if (id.startsWith("mock-")) return;
    router.push(`/courses/${id}`);
  }

  // ── Enroll via the real backend, then update local state from the response ──
  async function handleEnroll(id: string) {
    try {
      setEnrollingId(id);
      setEnrollError("");

      const response = await enrollInCourse(id);
     setEnrolledIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setProgressMap((prev) => ({ ...prev, [id]: 0 }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to enroll in course";
      setEnrollError(message);
    } finally {
      setEnrollingId(null);
    }
  }

  // A course counts as "enrolled" if either:
  // - the user has a roadmap (treated as enrolled in everything), OR
  // - the backend has an enrollment record for that specific course
  function isEnrolled(courseId: string): boolean {
    return hasRoadmap || enrolledIds.includes(courseId);
  }

  const recommended = filtered.filter((c) => isEnrolled(c._id));
  const notEnrolled  = filtered.filter((c) => !isEnrolled(c._id));

  // ── Build tab button elements (Rule 10 — no .map in JSX) ──
  const tabButtons = FILTER_TABS.map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ${
        activeTab === tab
          ? "bg-[#1A3ADB] text-white"
          : "bg-white border border-[#E4E8F5] text-[#3D4A6B] hover:bg-[#E8EDFF]"
      }`}
    >
      {tab}
    </button>
  ));

  // ── Build recommended card elements ──
  const recommendedCards = recommended.map((course) => (
    <RealCourseCard
      key={course._id}
      course={course}
      enrolled={true}
      enrolling={enrollingId === course._id}
      progressPercent={progressMap[course._id] ?? 0}
      onView={handleView}
      onEnroll={handleEnroll}
    />
  ));

  // ── Build not-enrolled real course card elements ──
  const notEnrolledCards = notEnrolled.map((course) => (
    <RealCourseCard
      key={course._id}
      course={course}
      enrolled={false}
      enrolling={enrollingId === course._id}
      progressPercent={0}
      onView={handleView}
      onEnroll={handleEnroll}
    />
  ));

  // ── Build mock card elements ──
  const mockCards = MOCK_COURSES.map((course) => (
    <MockCourseCard key={course._id} course={course} onView={handleView} />
  ));

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-[#F7F8FC]">

      {/* ── FILTER TABS ROW ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {tabButtons}
        </div>
        <span className="text-sm text-[#3D4A6B] font-medium">
          Sort: Most Popular ↕
        </span>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-[#1A3ADB] border-t-transparent animate-spin" />
        </div>
      )}

      {/* ── ERROR ── */}
      {!loading && error && (
        <div className="rounded-xl bg-[#FEE2E2] border border-[#EF4444]/20 px-5 py-4 text-sm text-[#EF4444]">
          {error}
        </div>
      )}

      {/* ── ENROLL ERROR ── */}
      {!loading && !error && enrollError && (
        <div className="rounded-xl bg-[#FEE2E2] border border-[#EF4444]/20 px-5 py-4 text-sm text-[#EF4444]">
          {enrollError}
        </div>
      )}

      {/* ── RECOMMENDED FOR YOU ── */}
      {!loading && !error && (
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-bold text-[#0D1220]">Recommended for you</h2>
            <p className="text-xs text-[#8A97B8] mt-0.5">
              Based on your AI-generated roadmap
            </p>
          </div>

          {/* Row 1 — enrolled real courses (or not-enrolled if none yet) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendedCards.length > 0 ? recommendedCards : notEnrolledCards}
          </div>

          {/* Row 2 — mock courses to fill the second row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mockCards}
          </div>
        </section>
      )}
    </div>
  );
}