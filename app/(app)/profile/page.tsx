"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProfile } from "@/lib/api/user";
import { getEnrollments, getCourses, enrollInCourse } from "@/lib/api/learning";
import type { Enrollment, Course } from "@/lib/api/learning";
import { getRoadmap } from "@/lib/api/roadmap";
import PageNav from "@/components/PageNav";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type ProfileTab = "overview" | "courses" | "achievements" | "settings";

interface CourseProgress {
  emoji: string;
  name: string;
  moduleText: string;
  percent: number;
  color: "blue" | "gold" | "none";
  courseId: string;
  isRoadmapGenerated?: boolean;
}

interface SettingRow {
  label: string;
  value: string;
  highlight: boolean;
}

interface RoadmapTopic {
  name: string;
}

interface RoadmapStage {
  title: string;
  topics: RoadmapTopic[];
}

interface Roadmap {
  title: string;
  stages: RoadmapStage[];
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

// ─────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────

const SETTINGS: SettingRow[] = [
  { label: "Email notifications", value: "On",         highlight: true  },
  { label: "Daily reminder",      value: "7:00 PM",    highlight: false },
  { label: "Study goal",          value: "30 min/day", highlight: false },
  { label: "Language",            value: "English",    highlight: false },
];

// ─────────────────────────────────────────────────────────────
// COURSE ROW
// ─────────────────────────────────────────────────────────────

function CourseRow({ course }: { course: CourseProgress }) {
  const router = useRouter();

  async function handleClick(e: React.MouseEvent) {
    if (!course.isRoadmapGenerated || course.percent > 0) return; // already enrolled/has progress, plain link is fine
    e.preventDefault();
    try {
      await enrollInCourse(course.courseId);
    } catch {
      // Already enrolled or transient error — proceed regardless.
    } finally {
      router.push(`/courses/${course.courseId}`);
    }
  }

  return (
    <Link
      href={`/courses/${course.courseId}`}
      onClick={handleClick}
      className="flex flex-col gap-1.5 p-3 rounded-xl border border-transparent hover:border-[#E4E8F5] hover:bg-[#F7F8FC] transition-colors"
    >
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-bold text-[#0D1220]">
          {course.emoji} {course.name}
        </p>
        {course.color !== "none" && (
          <span className="text-[12px] font-bold text-[#1A3ADB]">
            {course.percent}%
          </span>
        )}
      </div>
      <p className="text-[11px] text-[#8A97B8]">{course.moduleText}</p>
      {course.color === "none" ? (
        <span className="px-3 py-1 rounded-full bg-[#E5E9F5] text-[11px] font-semibold text-[#8A97B8] w-fit">
          Not started
        </span>
      ) : (
        <div className="w-full h-1.5 bg-[#E5E9F5] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${course.percent}%`,
              backgroundColor: course.color === "gold" ? "#F5A623" : "#1A3ADB",
            }}
          />
        </div>
      )}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [activeTab, setActiveTab]     = useState<ProfileTab>("overview");
  const [userName, setUserName]       = useState("Learner");
  const [initials, setInitials]       = useState("L");
  const [email, setEmail]             = useState("");
  const [goal, setGoal]               = useState("");
  const [level, setLevel]             = useState("");
  const [memberSince, setMemberSince] = useState("");

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [roadmap, setRoadmap]       = useState<Roadmap | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await getProfile();
        const user = response.data.data.user;

        setUserName(user.name);
        const parts = user.name.trim().split(" ");
        setInitials(parts.map((p: string) => p[0]).join("").slice(0, 2).toUpperCase());

        setEmail(user.email);
        setGoal(user.preferences?.goal || "");
        setLevel(user.preferences?.currentLevel || "");

        const date = new Date(user.createdAt);
        setMemberSince(date.toLocaleDateString("en-GB", { month: "long", year: "numeric" }));
      } catch {
        const name = localStorage.getItem("skillpath_name") || "Learner";
        setUserName(name);
        const parts = name.trim().split(" ");
        setInitials(parts.map((p: string) => p[0]).join("").slice(0, 2).toUpperCase());
      }
    }
    loadProfile();

    async function loadCourses() {
      try {
        const enrollRes = await getEnrollments();
        setEnrollments(enrollRes.data.data.enrollments ?? []);
      } catch {
        setEnrollments([]);
      }
    }
    loadCourses();

    async function loadRoadmapAndAllCourses() {
      try {
        const coursesRes = await getCourses();
        setAllCourses(coursesRes.data?.data?.courses ?? []);
      } catch {
        setAllCourses([]);
      }

      const saved = localStorage.getItem("skillpath_roadmap");
      if (saved) {
        try {
          setRoadmap(JSON.parse(saved));
          return;
        } catch {
          localStorage.removeItem("skillpath_roadmap");
        }
      }

      const userId = localStorage.getItem("skillpath_user_id");
      if (userId) {
        try {
          const res = await getRoadmap(userId);
          const fetched = res.data?.data?.roadmap;
          if (fetched) setRoadmap(fetched);
        } catch {
          // No roadmap yet
        }
      }
    }
    loadRoadmapAndAllCourses();

    window.dispatchEvent(
      new CustomEvent("skillpath-title-update", {
        detail: { title: "My Profile", subtitle: "Manage your account and preferences" },
      })
    );
  }, []);

  // Roadmap-matched courses — ALWAYS live here, whether enrolled or not.
  // Shows real progress once the user starts. This is a permanent
  // grouping by "how the user found this course", not by current
  // enrollment status.
  const roadmapMatchedIds = new Set<string>();
  const roadmapRows: CourseProgress[] = (() => {
    if (!roadmap || allCourses.length === 0) return [];
    const seen = new Set<string>();
    const rows: CourseProgress[] = [];

    roadmap.stages.forEach((stage) => {
      const matched = matchCourseForStage(stage, allCourses);
      if (!matched || seen.has(matched._id)) return;
      seen.add(matched._id);
      roadmapMatchedIds.add(matched._id);

      const enrollment = enrollments.find((e) => e.course._id === matched._id);
      const percent = enrollment?.progress?.progressPercent ?? 0;

      rows.push({
        emoji: "🗺️",
        name: matched.title,
        moduleText: enrollment
          ? `${enrollment.progress?.completedLessons.length ?? 0} of ${matched.totalLessons} lessons`
          : `Matches: ${stage.title}`,
        percent,
        color: percent > 0 ? "blue" : "none",
        courseId: matched._id,
        isRoadmapGenerated: true,
      });
    });

    return rows;
  })();

  // Enrolled courses — EXCLUDES any course already shown under
  // "Roadmap Generated" above, so nothing appears twice.
  const enrolledRows: CourseProgress[] = enrollments
    .filter((e) => !roadmapMatchedIds.has(e.course._id))
    .map((e) => ({
      emoji: "📘",
      name: e.course.title,
      moduleText: `${e.progress?.completedLessons.length ?? 0} of ${e.course.totalLessons} lessons`,
      percent: e.progress?.progressPercent ?? 0,
      color: (e.progress?.progressPercent ?? 0) > 0 ? "blue" : "none",
      courseId: e.course._id,
    }));

  const learningGoalCourseId = roadmapRows.length > 0
    ? roadmapRows[0].courseId
    : enrolledRows.length > 0
    ? enrolledRows[0].courseId
    : null;

  const lastEngaged = (() => {
    if (enrollments.length === 0) return null;
    const sorted = [...enrollments].sort((a, b) => {
      const aTime = a.progress?.lastAccessedAt ? new Date(a.progress.lastAccessedAt).getTime() : 0;
      const bTime = b.progress?.lastAccessedAt ? new Date(b.progress.lastAccessedAt).getTime() : 0;
      return bTime - aTime;
    });
    return sorted[0];
  })();

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: "overview",     label: "Overview"     },
    { key: "courses",      label: "Courses"      },
    { key: "achievements", label: "Achievements" },
    { key: "settings",     label: "Settings"     },
  ];

  const tabButtons = tabs.map((tab) => {
    const isActive = activeTab === tab.key;
    return (
      <button
        key={tab.key}
        onClick={() => setActiveTab(tab.key)}
        style={isActive ? { backgroundColor: "#0D1B4B" } : undefined}
        className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-150 shadow-sm ${
          isActive
            ? "text-white shadow-md"
            : "bg-[#F7F8FC] border border-[#E4E8F5] text-[#3D4A6B] hover:bg-[#E8EDFF] hover:text-[#1A3ADB] hover:shadow-md"
        }`}
      >
        {tab.label}
      </button>
    );
  });

  const settingRows = SETTINGS.map((row) => (
    <div
      key={row.label}
      className="flex items-center justify-between py-3 border-b border-[#E4E8F5] last:border-0"
    >
      <span className="text-[13px] text-[#3D4A6B]">{row.label}</span>
      <span
        className={`text-[13px] font-semibold ${
          row.highlight ? "text-[#1A3ADB]" : "text-[#0D1220]"
        }`}
      >
        {row.value}
      </span>
    </div>
  ));

  const totalCourseCount = roadmapRows.length + enrolledRows.length;

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <PageNav />

      <div className="flex gap-6 items-start">

        {/* ══════════════════════════
            LEFT CARD
        ══════════════════════════ */}
        <div className="w-[380px] flex-shrink-0 bg-white rounded-2xl border border-[#E4E8F5] overflow-hidden">

          <div className="h-[110px]" style={{ backgroundColor: "#0D1B4B" }} />

          <div className="flex flex-col items-center -mt-10 px-6 pb-6">
            <div className="w-20 h-20 rounded-full bg-[#1A3ADB] flex items-center justify-center text-white text-[22px] font-black border-4 border-white mb-3">
              {initials}
            </div>

            <h2 className="text-[18px] font-black text-[#0D1220]">{userName}</h2>
            {email && <p className="text-[13px] text-[#8A97B8] mb-2">{email}</p>}

            {level && (
              <span className="px-3 py-1 rounded-full bg-[#F7F8FC] border border-[#E4E8F5] text-[12px] font-semibold text-[#3D4A6B] mb-4 capitalize">
                🎯 {level}
              </span>
            )}

            <div className="flex items-center gap-3 w-full mb-5">
              <div className="flex-1 flex flex-col items-center py-3 rounded-xl border border-[#E4E8F5]">
                <span className="text-[18px] font-black text-[#0D1220]">{totalCourseCount}</span>
                <span className="text-[11px] text-[#8A97B8]">Courses</span>
              </div>
            </div>

            <div className="flex items-center gap-1 mb-5 flex-wrap">
              {tabButtons}
            </div>

            {/* ── OVERVIEW TAB ── */}
            {activeTab === "overview" && (
              <div className="w-full flex flex-col gap-5">

                <div>
                  <p className="text-[13px] font-bold text-[#0D1220] mb-1">About me</p>
                  <p className="text-[13px] text-[#3D4A6B] leading-relaxed">
                    CS final year student passionate about tech and building real-world software solutions.
                  </p>
                </div>

                {goal && (
                  <div>
                    <p className="text-[13px] font-bold text-[#0D1220] mb-2">Learning Goal</p>
                    <Link
                      href={learningGoalCourseId ? `/courses/${learningGoalCourseId}` : "/roadmap"}
                      className="block rounded-xl border border-[#1A3ADB]/30 bg-[#E8EDFF] px-4 py-3 hover:bg-[#DCE4FF] hover:border-[#1A3ADB]/50 transition-colors"
                    >
                      <p className="text-[13px] font-bold text-[#1A3ADB]">🎯 {goal}</p>
                      <p className="text-[11px] text-[#3D4A6B] mt-0.5">
                        {learningGoalCourseId ? "Continue learning →" : "View your roadmap →"}
                      </p>
                    </Link>
                  </div>
                )}

                {memberSince && (
                  <div className="flex flex-col gap-1 pt-1">
                    <p className="text-[12px] text-[#8A97B8]">Member since {memberSince}</p>
                  </div>
                )}

                {(lastEngaged || roadmap) && (
                  <Link
                    href={lastEngaged ? `/courses/${lastEngaged.course._id}` : "/roadmap"}
                    className="block text-center py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] font-semibold text-[#3D4A6B] hover:bg-[#F7F8FC] transition-colors"
                  >
                    {lastEngaged
                      ? `Continue "${lastEngaged.course.title}" →`
                      : "Continue your roadmap →"}
                  </Link>
                )}
              </div>
            )}

            {/* ── COURSES TAB ── */}
            {activeTab === "courses" && (
              <div className="w-full flex flex-col gap-6">

                <div>
                  <p className="text-[12px] font-bold text-[#8A97B8] uppercase tracking-wide mb-2">
                    Roadmap Generated
                  </p>
                  {roadmapRows.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {roadmapRows.map((course) => (
                        <CourseRow key={course.courseId} course={course} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-[#8A97B8] py-3">
                      No matching course found for your roadmap yet.
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-[12px] font-bold text-[#8A97B8] uppercase tracking-wide mb-2">
                    Enrolled Courses
                  </p>
                  {enrolledRows.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {enrolledRows.map((course) => (
                        <CourseRow key={course.courseId} course={course} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-[#8A97B8] py-3">
                      No enrolled courses yet.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── ACHIEVEMENTS TAB ── */}
            {activeTab === "achievements" && (
              <div className="w-full flex flex-col items-center gap-3 py-8">
                <span className="text-[36px]">🏆</span>
                <p className="text-[14px] font-bold text-[#0D1220]">Your achievements</p>
                <p className="text-[12px] text-[#8A97B8] text-center">
                  Complete lessons and quizzes to earn badges and unlock achievements.
                </p>
              </div>
            )}

            {/* ── SETTINGS TAB ── */}
            {activeTab === "settings" && (
              <div className="w-full flex flex-col">
                {settingRows}
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════
            RIGHT COLUMN
        ══════════════════════════ */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">

          <div className="bg-white rounded-2xl border border-[#E4E8F5] p-6">
            <h3 className="text-[15px] font-bold text-[#0D1220] mb-4">My Courses</h3>

            <div className="flex flex-col gap-6">
              <div>
                <p className="text-[12px] font-bold text-[#8A97B8] uppercase tracking-wide mb-2">
                  Roadmap Generated
                </p>
                {roadmapRows.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {roadmapRows.map((course) => (
                      <CourseRow key={course.courseId} course={course} />
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-[#8A97B8] py-3">
                    No matching course found for your roadmap yet.
                  </p>
                )}
              </div>

              <div>
                <p className="text-[12px] font-bold text-[#8A97B8] uppercase tracking-wide mb-2">
                  Enrolled Courses
                </p>
                {enrolledRows.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {enrolledRows.map((course) => (
                      <CourseRow key={course.courseId} course={course} />
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-[#8A97B8] py-3">
                    No enrolled courses yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E4E8F5] p-6">
            <h3 className="text-[15px] font-bold text-[#0D1220] mb-2">Quick Settings</h3>
            <div className="flex flex-col">
              {settingRows}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}