"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

interface Badge {
  emoji: string;
  label: string;
}

interface ActivityDay {
  day: string;
  lessons: number;
}

interface SettingRow {
  label: string;
  value: string;
  highlight: boolean;
}

// ─────────────────────────────────────────────────────────────
// STATIC DATA — replace with real API calls when available
// ─────────────────────────────────────────────────────────────

const ACTIVITY: ActivityDay[] = [
  { day: "Mon", lessons: 4 },
  { day: "Tue", lessons: 6 },
  { day: "Wed", lessons: 3 },
  { day: "Thu", lessons: 8 },
  { day: "Fri", lessons: 5 },
  { day: "Sat", lessons: 0 },
  { day: "Sun", lessons: 0 },
];

const COURSES: CourseProgress[] = [
  { emoji: "🐍", name: "Python for Beginners",   moduleText: "Module 4 of 8", percent: 68, color: "blue" },
  { emoji: "⚡", name: "JavaScript Essentials",  moduleText: "Module 1 of 6", percent: 12, color: "gold" },
  { emoji: "🎨", name: "UI/UX Design",           moduleText: "Not started",   percent: 0,  color: "none" },
];

const BADGES: Badge[] = [
  { emoji: "🏅", label: "First Login"    },
  { emoji: "🔥", label: "7 Day Streak"  },
  { emoji: "📚", label: "Module 3"      },
  { emoji: "⚡", label: "Quick Learner" },
];

const SETTINGS: SettingRow[] = [
  { label: "Email notifications", value: "On",          highlight: true  },
  { label: "Daily reminder",      value: "7:00 PM",     highlight: false },
  { label: "Study goal",          value: "30 min/day",  highlight: false },
  { label: "Language",            value: "English",     highlight: false },
];

const MAX_LESSONS = Math.max(...ACTIVITY.map((d) => d.lessons));
const CHART_HEIGHT = 80; // px height of tallest bar

// ─────────────────────────────────────────────────────────────
// BAR CHART COMPONENT
// ─────────────────────────────────────────────────────────────

function ActivityChart() {
  const bestDay = ACTIVITY.reduce((a, b) => (a.lessons > b.lessons ? a : b));

  const bars = ACTIVITY.map((day) => {
    const heightPct = MAX_LESSONS > 0 ? (day.lessons / MAX_LESSONS) * 100 : 0;
    const isBest    = day.day === bestDay.day;
    const isEmpty   = day.lessons === 0;

    return (
      <div key={day.day} className="flex flex-col items-center gap-1 flex-1">
        {/* Number above bar */}
        <span className="text-[11px] text-[#8A97B8] font-medium h-4">
          {day.lessons > 0 ? day.lessons : ""}
        </span>
        {/* Bar */}
        <div className="w-full flex items-end" style={{ height: `${CHART_HEIGHT}px` }}>
          <div
            className="w-full rounded-t-lg transition-all duration-500"
            style={{
              height: isEmpty ? "4px" : `${heightPct}%`,
              backgroundColor: isBest ? "#1A3ADB" : isEmpty ? "#E5E9F5" : "#93A8F4",
            }}
          />
        </div>
        {/* Day label */}
        <span className="text-[11px] text-[#8A97B8]">{day.day}</span>
      </div>
    );
  });

  const totalLessons = ACTIVITY.reduce((a, d) => a + d.lessons, 0);
  const avgPerDay    = (totalLessons / 7).toFixed(1);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-2 px-1">
        {bars}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-[12px] font-semibold text-[#1A3ADB]">
          🔥 Best day: {bestDay.day} — {bestDay.lessons} lessons
        </p>
        <p className="text-[12px] text-[#8A97B8]">
          Total this week: {totalLessons} lessons · Avg: {avgPerDay}/day
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [userName, setUserName]   = useState("Amaka Okonkwo");
  const [initials, setInitials]   = useState("AO");

  useEffect(() => {
    const name = localStorage.getItem("skillpath_name") || "Amaka Okonkwo";
    setUserName(name);
    const parts = name.trim().split(" ");
    setInitials(parts.map((p: string) => p[0]).join("").slice(0, 2).toUpperCase());

    // Update topbar title via layout event
    window.dispatchEvent(
      new CustomEvent("skillpath-title-update", {
        detail: { title: "My Profile", subtitle: "Manage your account and preferences" },
      })
    );
  }, []);

  // ── Build tab buttons outside JSX — Rule 10 ──
  const tabs: { key: ProfileTab; label: string }[] = [
    { key: "overview",      label: "Overview"      },
    { key: "courses",       label: "Courses"       },
    { key: "achievements",  label: "Achievements"  },
    { key: "settings",      label: "Settings"      },
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

  // ── Build badge items outside JSX — Rule 10 ──
  const badgeItems = BADGES.map((badge) => (
    <div
      key={badge.label}
      className="flex flex-col items-center gap-2 px-3 py-3 rounded-xl border-2 flex-1"
      style={{ borderColor: "#F5A623" }}
    >
      <span className="text-[22px]">{badge.emoji}</span>
      <span className="text-[11px] font-semibold text-[#3D4A6B] text-center leading-tight">
        {badge.label}
      </span>
    </div>
  ));

  // ── Build course rows outside JSX — Rule 10 ──
  const courseRows = COURSES.map((course) => (
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
          <p className="text-[13px] text-[#8A97B8] mb-2">amaka@gmail.com</p>

          <span className="px-3 py-1 rounded-full bg-[#F7F8FC] border border-[#E4E8F5] text-[12px] font-semibold text-[#3D4A6B] mb-4">
            🎯 Beginner
          </span>

          {/* Stat boxes */}
          <div className="flex items-center gap-3 w-full mb-5">
            <div className="flex-1 flex flex-col items-center py-3 rounded-xl border border-[#E4E8F5]">
              <span className="text-[18px] font-black text-[#0D1220]">3</span>
              <span className="text-[11px] text-[#8A97B8]">Courses</span>
            </div>
            <div className="flex-1 flex flex-col items-center py-3 rounded-xl border border-[#E4E8F5]">
              <span className="text-[18px] font-black text-[#0D1220]">7 days</span>
              <span className="text-[11px] text-[#8A97B8]">Streak</span>
            </div>
            <div className="flex-1 flex flex-col items-center py-3 rounded-xl border border-[#E4E8F5]">
              <span className="text-[18px] font-black text-[#0D1220]">1,240</span>
              <span className="text-[11px] text-[#8A97B8]">Points</span>
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
              <div>
                <p className="text-[13px] font-bold text-[#0D1220] mb-2">Learning Goal</p>
                <div className="rounded-xl border border-[#1A3ADB]/30 bg-[#E8EDFF] px-4 py-3">
                  <p className="text-[13px] font-bold text-[#1A3ADB]">🎯 Web Development</p>
                  <p className="text-[12px] text-[#3D4A6B] mt-0.5">Beginner → Job-ready</p>
                </div>
              </div>

              {/* Overall progress */}
              <div>
                <p className="text-[13px] font-bold text-[#0D1220] mb-2">Overall Progress</p>
                <div className="w-full h-2 bg-[#E5E9F5] rounded-full overflow-hidden mb-1.5">
                  <div className="h-full bg-[#1A3ADB] rounded-full" style={{ width: "35%" }} />
                </div>
                <p className="text-[12px] text-[#8A97B8]">35% of Web Dev path complete</p>
              </div>

              {/* Recent badges */}
              <div>
                <p className="text-[13px] font-bold text-[#0D1220] mb-2">Recent Badges</p>
                <div className="flex gap-2">{badgeItems}</div>
              </div>

              {/* Member info */}
              <div className="flex flex-col gap-1 pt-1">
                <p className="text-[12px] text-[#8A97B8]">Member since May 2025</p>
                <p className="text-[12px] text-[#8A97B8]">📍 Lagos, Nigeria</p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button className="flex-1 py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] font-semibold text-[#3D4A6B] hover:bg-[#F7F8FC] transition-colors">
                  Edit profile
                </button>
                {/* <button
                  onClick={() => router.push("/onboarding/goal")}
                  className="flex-1 py-2.5 rounded-xl bg-[#1A3ADB] text-white text-[13px] font-bold hover:bg-[#1228B0] transition-colors"
                >
                  Upgrade plan
                </button> */}
              </div>
            </div>
          )}

          {/* ── COURSES TAB ── */}
          {activeTab === "courses" && (
            <div className="w-full flex flex-col gap-4">
              {courseRows}
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
              <div className="flex gap-2 flex-wrap justify-center mt-2">
                {badgeItems}
              </div>
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
          RIGHT COLUMN — 3 cards
      ══════════════════════════ */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">

        {/* Learning Activity card */}
        <div className="bg-white rounded-2xl border border-[#E4E8F5] p-6">
          <h3 className="text-[15px] font-bold text-[#0D1220] mb-0.5">Learning Activity</h3>
          <p className="text-[12px] text-[#8A97B8] mb-5">Last 7 days</p>
          <ActivityChart />
        </div>

        {/* My Courses card */}
        <div className="bg-white rounded-2xl border border-[#E4E8F5] p-6">
          <h3 className="text-[15px] font-bold text-[#0D1220] mb-4">My Courses</h3>
          <div className="flex flex-col gap-4">
            {courseRows}
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