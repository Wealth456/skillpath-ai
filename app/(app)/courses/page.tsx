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
import PageNav from "@/components/PageNav";

// ─────────────────────────────────────────────────────────────
// STATIC MOCK CARDS
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
  headerBg: string;
}

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
// ROADMAP TYPES
// ─────────────────────────────────────────────────────────────

interface RoadmapTopic {
  name: string;
}

interface RoadmapStage {
  title: string;
  topics: RoadmapTopic[];
}

interface Roadmap {
  stages: RoadmapStage[];
}

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
// REAL COURSE CARD
// ─────────────────────────────────────────────────────────────

interface RealCardProps {
  course: Course;
  enrolled: boolean;
  roadmapMatch: boolean;
  enrolling: boolean;
  progressPercent: number;
  onView: (id: string) => void;
  onEnroll: (id: string) => void;
  onStartRoadmapCourse: (id: string) => void;
}

function RealCourseCard({
  course,
  enrolled,
  roadmapMatch,
  enrolling,
  progressPercent,
  onView,
  onEnroll,
  onStartRoadmapCourse,
}: RealCardProps) {
  const { icon, bg } = getCourseIcon(course.category);
  const displayRating = 4.8;
  const displayStudents = enrolled ? "23k" : "12k";

  return (
    <div className="bg-white rounded-2xl border border-[#E4E8F5] overflow-hidden flex flex-col">
      <div className="bg-[#F0F3FF] px-5 pt-5 pb-4 flex items-start justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
          {icon}
        </div>
        {enrolled ? (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#1A3ADB] text-white">
            Enrolled
          </span>
        ) : roadmapMatch ? (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#E8EDFF] text-[#1A3ADB] border border-[#1A3ADB]/20">
            Roadmap generated
          </span>
        ) : null}
      </div>

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

        {enrolled ? (
          <button
            onClick={() => onView(course._id)}
            className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold bg-[#1A3ADB] text-white hover:bg-[#1228B0] transition-colors duration-150"
          >
            <PlayCircle size={14} />
            Continue
          </button>
        ) : roadmapMatch ? (
          <button
            onClick={() => onStartRoadmapCourse(course._id)}
            disabled={enrolling}
            className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold bg-[#1A3ADB] text-white hover:bg-[#1228B0] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <PlayCircle size={14} />
            {enrolling ? "Starting..." : "Start Learning"}
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
// MOCK COURSE CARD
// ─────────────────────────────────────────────────────────────

interface MockCardProps {
  course: MockCourse;
}

function MockCourseCard({ course }: MockCardProps) {
  const { icon } = getCourseIcon(course.category);

  return (
    <div className="bg-white rounded-2xl border border-[#E4E8F5] overflow-hidden flex flex-col opacity-90">
      <div className="px-5 pt-5 pb-4 flex items-start justify-between" style={{ backgroundColor: course.headerBg }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "#fff", opacity: 0.9 }}
        >
          {icon}
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-[#8A97B8] border border-[#E4E8F5]">
          Coming soon
        </span>
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
          disabled
          className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold border border-[#E4E8F5] text-[#8A97B8] cursor-not-allowed"
        >
          Coming soon
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// KEYWORD MATCHING
// ─────────────────────────────────────────────────────────────

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

  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [enrollError, setEnrollError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("skillpath_search_query");
    if (saved) setSearchQuery(saved);

    function handleSearchUpdate(e: Event) {
      const custom = e as CustomEvent<{ query: string }>;
      setSearchQuery(custom.detail.query);
    }
    window.addEventListener("skillpath-search-update", handleSearchUpdate);
    return () => window.removeEventListener("skillpath-search-update", handleSearchUpdate);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const coursesRes = await getCourses();
        const list: Course[] = coursesRes.data.data.courses ?? [];
        setCourses(list);
        setFiltered(list);

        const savedRoadmap = localStorage.getItem("skillpath_roadmap");
        if (savedRoadmap) {
          try {
            setRoadmap(JSON.parse(savedRoadmap));
          } catch {
            // ignore malformed cache
          }
        }

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

  // ── Re-filter when tab OR search query changes ──
  useEffect(() => {
    let result = courses;

    if (activeTab !== "All") {
      const tab = activeTab.toLowerCase();
      result = result.filter((c) => {
        const cat = (c.category ?? "").toLowerCase();
        if (tab === "web dev") return cat.includes("web") || cat.includes("javascript");
        if (tab === "data science") return cat.includes("data") || cat.includes("science");
        if (tab === "ui/ux") return cat.includes("ui") || cat.includes("ux") || cat.includes("design");
        if (tab === "python") return cat.includes("python");
        if (tab === "cloud") return cat.includes("cloud") || cat.includes("aws");
        if (tab === "mobile") return cat.includes("mobile");
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (c) =>
          (c.title ?? "").toLowerCase().includes(q) ||
          (c.category ?? "").toLowerCase().includes(q) ||
          (c.instructor ?? "").toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [activeTab, searchQuery, courses]);

  function handleView(id: string) {
    router.push(`/courses/${id}`);
  }

  async function handleEnroll(id: string) {
    try {
      setEnrollingId(id);
      setEnrollError("");

      await enrollInCourse(id);
      setEnrolledIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setProgressMap((prev) => ({ ...prev, [id]: 0 }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to enroll in course";
      setEnrollError(message);
    } finally {
      setEnrollingId(null);
    }
  }

  // Roadmap-generated course — auto-enroll (if needed) then go straight
  // into the course. No separate manual enroll step for a course the
  // system already recommended.
  async function handleStartRoadmapCourse(id: string) {
    try {
      setEnrollingId(id);
      setEnrollError("");
      await enrollInCourse(id);
      setEnrolledIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setProgressMap((prev) => ({ ...prev, [id]: 0 }));
    } catch {
      // Already enrolled or a transient error — still proceed to the course.
    } finally {
      setEnrollingId(null);
      router.push(`/courses/${id}`);
    }
  }

  function isEnrolled(courseId: string): boolean {
    return enrolledIds.includes(courseId);
  }

  function isRoadmapMatch(course: Course): boolean {
    if (!roadmap) return false;

    const courseKeywords = new Set([
      ...extractKeywords(course.category ?? ""),
      ...extractKeywords(course.title ?? ""),
      ...(course.modules ?? []).flatMap((m) => Array.from(extractKeywords(m.title ?? ""))),
    ]);

    return roadmap.stages.some((stage) => {
      const stageKeywords = new Set([
        ...extractKeywords(stage.title),
        ...stage.topics.flatMap((t) => Array.from(extractKeywords(t.name))),
      ]);

      let sharedCount = 0;
      for (const word of stageKeywords) {
        if (courseKeywords.has(word)) sharedCount++;
      }
      return sharedCount >= 2;
    });
  }

  const continueLearning = filtered.filter((c) => isEnrolled(c._id));

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

  const continueLearningCards = continueLearning.map((course) => (
    <RealCourseCard
      key={course._id}
      course={course}
      enrolled={true}
      roadmapMatch={isRoadmapMatch(course)}
      enrolling={enrollingId === course._id}
      progressPercent={progressMap[course._id] ?? 0}
      onView={handleView}
      onEnroll={handleEnroll}
      onStartRoadmapCourse={handleStartRoadmapCourse}
    />
  ));

  const allCoursesCards = filtered.map((course) => (
    <RealCourseCard
      key={course._id}
      course={course}
      enrolled={isEnrolled(course._id)}
      roadmapMatch={isRoadmapMatch(course)}
      enrolling={enrollingId === course._id}
      progressPercent={progressMap[course._id] ?? 0}
      onView={handleView}
      onEnroll={handleEnroll}
      onStartRoadmapCourse={handleStartRoadmapCourse}
    />
  ));

  const mockCards = searchQuery.trim()
    ? []
    : MOCK_COURSES.map((course) => (
        <MockCourseCard key={course._id} course={course} />
      ));

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-[#F7F8FC]">
      <PageNav />

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

      {!loading && !error && (
        <>
          {/* ── CONTINUE LEARNING ── */}
          {continueLearning.length > 0 && (
            <section className="flex flex-col gap-4">
              <div>
                <h2 className="text-base font-bold text-[#0D1220]">Continue Learning</h2>
                <p className="text-xs text-[#8A97B8] mt-0.5">
                  Courses you&apos;re currently enrolled in
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {continueLearningCards}
              </div>
            </section>
          )}

          {/* ── ALL COURSES ── */}
          <section className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-bold text-[#0D1220]">
                {searchQuery.trim() ? `Results for "${searchQuery.trim()}"` : "All Courses"}
              </h2>
              <p className="text-xs text-[#8A97B8] mt-0.5">
                {searchQuery.trim()
                  ? `${allCoursesCards.length} course${allCoursesCards.length === 1 ? "" : "s"} found`
                  : "Every course available on SkillPath AI"}
              </p>
            </div>
            {allCoursesCards.length > 0 || mockCards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {allCoursesCards}
                {mockCards}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-[#8A97B8]">
                  No courses match &quot;{searchQuery.trim()}&quot;. Try a different search term.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}