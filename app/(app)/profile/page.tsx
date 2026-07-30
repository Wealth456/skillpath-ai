"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "@/lib/api/user";
import { getEnrollments } from "@/lib/api/learning";
import type { Enrollment } from "@/lib/api/learning";

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
}

interface SettingRow {
  label: string;
  value: string;
  highlight: boolean;
}

// ─────────────────────────────────────────────────────────────
// STATIC DATA — Quick Settings has no backend support yet, so this
// stays as clearly-labelled placeholder until that endpoint exists.
// ─────────────────────────────────────────────────────────────

const SETTINGS: SettingRow[] = [
  { label: "Email notifications", value: "On",         highlight: true  },
  { label: "Daily reminder",      value: "7:00 PM",    highlight: false },
  { label: "Study goal",          value: "30 min/day", highlight: false },
  { label: "Language",            value: "English",    highlight: false },
];

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab]     = useState<ProfileTab>("overview");
  const [userName, setUserName]       = useState("Learner");
  const [initials, setInitials]       = useState("L");
  const [email, setEmail]             = useState("");
  const [goal, setGoal]               = useState("");
  const [level, setLevel]             = useState("");
  const [memberSince, setMemberSince] = useState("");
  const [courses, setCourses]         = useState<CourseProgress[]>([]);

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
        // Fall back to whatever's cached locally if the profile fetch fails
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
        const enrollments: Enrollment[] = enrollRes.data.data.enrollments ?? [];

        const rows: CourseProgress[] = enrollments.map((e) => ({
          emoji: "📘",
          name: e.course.title,
          moduleText: `${e.progress?.completedLessons.length ?? 0} of ${e.course.totalLessons} lessons`,
          percent: e.progress?.progressPercent ?? 0,
          color: (e.progress?.progressPercent ?? 0) > 0 ? "blue" : "none",
        }));

        setCourses(rows);
      } catch {
        setCourses([]);
      }
    }
    loadCourses();

    // Update topbar title via layout event
    window.dispatchEvent(
      new CustomEvent("skillpath-title-update", {
        detail: { title: "My Profile", subtitle: "Manage your account and preferences" },
      })
    );
  }, []);

  // ── Build tab buttons outside JSX — Rule 10 ──
  const tabs: { key: ProfileTab; label: string }[] = [
    { key: "overview",     label: "Overview"     },
    { key: "courses",      label: "Courses"      },
    { key: "achievements", label: "Achievements" },
    { key: "settings",     label: "Settings"     },
  ];

  const tabButtons = tabs.map((tab) => (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key)}
      className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-colors ${
        activeTab === tab.key
          ? "bg-[#1A3ADB] text-white"
          : "text-[#3D4A6B] hover:bg-[#E8EDFF]"
      }`}
    >
      {tab.label}
    </button>
  ));

  // ── Build course rows outside JSX — Rule 10 ──
  const courseRows = courses.map((course) => (
    <div key={course.name} className="flex flex-col gap-1.5">
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
    </div>
  ));

  // ── Build setting rows outside JSX — Rule 10 ──
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

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex gap-6 min-h-screen bg-[#F7F8FC] items-start">

      {/* ══════════════════════════
          LEFT CARD — profile info
      ══════════════════════════ */}
      <div className="w-[380px] flex-shrink-0 bg-white rounded-2xl border border-[#E4E8F5] overflow-hidden">

        {/* Navy banner */}
        <div className="h-[110px]" style={{ backgroundColor: "#0D1B4B" }} />

        {/* Avatar + name — overlaps banner */}
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

          {/* Stat box */}
          <div className="flex items-center gap-3 w-full mb-5">
            <div className="flex-1 flex flex-col items-center py-3 rounded-xl border border-[#E4E8F5]">
              <span className="text-[18px] font-black text-[#0D1220]">{courses.length}</span>
              <span className="text-[11px] text-[#8A97B8]">Courses</span>
            </div>
          </div>

          {/* Profile tabs */}
          <div className="flex items-center gap-1 mb-5 flex-wrap">
            {tabButtons}
          </div>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <div className="w-full flex flex-col gap-5">

              {/* About me */}
              <div>
                <p className="text-[13px] font-bold text-[#0D1220] mb-1">About me</p>
                <p className="text-[13px] text-[#3D4A6B] leading-relaxed">
                  CS final year student passionate about tech and building real-world software solutions.
                </p>
              </div>

              {/* Learning goal */}
              {goal && (
                <div>
                  <p className="text-[13px] font-bold text-[#0D1220] mb-2">Learning Goal</p>
                  <div className="rounded-xl border border-[#1A3ADB]/30 bg-[#E8EDFF] px-4 py-3">
                    <p className="text-[13px] font-bold text-[#1A3ADB]">🎯 {goal}</p>
                  </div>
                </div>
              )}

              {/* Member info */}
              {memberSince && (
                <div className="flex flex-col gap-1 pt-1">
                  <p className="text-[12px] text-[#8A97B8]">Member since {memberSince}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button className="flex-1 py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] font-semibold text-[#3D4A6B] hover:bg-[#F7F8FC] transition-colors">
                  Edit profile
                </button>
              </div>
            </div>
          )}

          {/* ── COURSES TAB ── */}
          {activeTab === "courses" && (
            <div className="w-full flex flex-col gap-4">
              {courses.length > 0 ? (
                courseRows
              ) : (
                <p className="text-[13px] text-[#8A97B8] text-center py-6">
                  No enrolled courses yet.
                </p>
              )}
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

        {/* My Courses card */}
        <div className="bg-white rounded-2xl border border-[#E4E8F5] p-6">
          <h3 className="text-[15px] font-bold text-[#0D1220] mb-4">My Courses</h3>
          <div className="flex flex-col gap-4">
            {courses.length > 0 ? (
              courseRows
            ) : (
              <p className="text-[13px] text-[#8A97B8] text-center py-6">
                No enrolled courses yet.
              </p>
            )}
          </div>
        </div>

        {/* Quick Settings card */}
        <div className="bg-white rounded-2xl border border-[#E4E8F5] p-6">
          <h3 className="text-[15px] font-bold text-[#0D1220] mb-2">Quick Settings</h3>
          <div className="flex flex-col">
            {settingRows}
          </div>
        </div>
      </div>
    </div>
  );
}