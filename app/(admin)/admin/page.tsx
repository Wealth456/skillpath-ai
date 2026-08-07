"use client";

import { useEffect, useState } from "react";
import { Search, Plus, TrendingUp, FileText, CheckCircle2, ClipboardCheck, Activity as ActivityIcon } from "lucide-react";
import {
  getOverviewStats,
  getUserGrowth,
  getRecentActivity,
  getTopCourses,
  getRecentSignups,
  OverviewStats,
  GrowthPoint,
  ActivityItem,
  TopCourse,
  RecentSignup,
} from "@/lib/api/admin";
import { timeAgo, initialsFromName } from "@/lib/utils/time";

// ─────────────────────────────────────────────────────────────
// AVATAR COLOR CYCLE — blue shades only, per design system
// ─────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#1A3ADB", "#1228B0", "#3D5AE8", "#0D1B4B", "#2244CC"];
function colorForIndex(i: number) {
  return AVATAR_COLORS[i % AVATAR_COLORS.length];
}

// icon + color per activity type, with a safe fallback for unknown types
function activityMeta(type: string) {
  switch (type) {
    case "lesson_complete":
      return { Icon: CheckCircle2, bg: "#1A3ADB" };
    case "pdf_upload":
      return { Icon: FileText, bg: "#1228B0" };
    case "quiz_attempt":
      return { Icon: ClipboardCheck, bg: "#3D5AE8" };
    default:
      return { Icon: ActivityIcon, bg: "#8A97B8" };
  }
}

// ─────────────────────────────────────────────────────────────
// USER GROWTH CHART — pure SVG, now driven by real (variable-length) data
// ─────────────────────────────────────────────────────────────
function UserGrowthChart({ growth }: { growth: GrowthPoint[] }) {
  const width = 440;
  const height = 160;
  const padX = 20;
  const padY = 20;

  if (growth.length === 0) {
    return <p className="text-[12px] text-[#8A97B8] py-10 text-center">No growth data yet.</p>;
  }

  const dataPoints = growth.map((g) => g.count);
  const labels = growth.map((g) => g.month);
  const maxVal = Math.max(...dataPoints);
  const minVal = Math.min(...dataPoints);
  const range = maxVal - minVal || 1; // avoid divide-by-zero when all values are equal

  const points = dataPoints.map((val, i) => {
    const x =
      dataPoints.length === 1
        ? width / 2
        : padX + (i / (dataPoints.length - 1)) * (width - padX * 2);
    const y = height - padY - ((val - minVal) / range) * (height - padY * 2);
    return { x, y, val };
  });

  const lineStr = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath =
    `M ${points[0].x},${height - padY} ` +
    points.map((p) => `L ${p.x},${p.y}`).join(" ") +
    ` L ${points[points.length - 1].x},${height - padY} Z`;

  const dots = points.map((p, i) => (
    <circle key={i} cx={p.x} cy={p.y} r={4} fill="#1A3ADB" stroke="white" strokeWidth={2} />
  ));

  const xLabels = labels.map((label, i) => {
    const x =
      labels.length === 1 ? width / 2 : padX + (i / (labels.length - 1)) * (width - padX * 2);
    return (
      <text key={`${label}-${i}`} x={x} y={height + 14} textAnchor="middle" fontSize={11} fill="#8A97B8">
        {label}
      </text>
    );
  });

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height + 20}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A3ADB" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#1A3ADB" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#areaGrad)" />
      <polyline points={lineStr} fill="none" stroke="#1A3ADB" strokeWidth={2.5} strokeLinejoin="round" />
      {dots}
      {xLabels}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// DONUT CHART — completion rate, now real
// ─────────────────────────────────────────────────────────────
function CompletionDonut({ percent }: { percent: number }) {
  const radius = 70;
  const stroke = 14;
  const r = radius - stroke / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center">
        <svg width={radius * 2} height={radius * 2} className="-rotate-90">
          <circle cx={radius} cy={radius} r={r} fill="none" stroke="#E5E9F5" strokeWidth={stroke} />
          <circle
            cx={radius} cy={radius} r={r} fill="none"
            stroke="#1A3ADB" strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-[22px] font-black text-[#0D1220]">{Math.round(percent)}%</span>
          <span className="text-[11px] text-[#8A97B8]">avg</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [growth, setGrowth] = useState<GrowthPoint[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [signups, setSignups] = useState<RecentSignup[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, growthRes, activityRes, coursesRes, signupsRes] = await Promise.all([
          getOverviewStats(),
          getUserGrowth(),
          getRecentActivity(),
          getTopCourses(5),
          getRecentSignups(6),
        ]);
        if (cancelled) return;
        setStats(statsRes);
        setGrowth(growthRes);
        setActivity(activityRes);
        setTopCourses(coursesRes);
        setSignups(signupsRes);
      } catch (err: any) {
        if (cancelled) return;
        const message =
          err?.response?.data?.message || "Failed to load dashboard data. Please try again.";
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── STAT CARDS — built from real fields only ──
  const statCards = stats
    ? [
        {
          label: "Total Users",
          value: stats.totalUsers.toLocaleString(),
          badge: `+${stats.newUsersThisWeek} this week`,
        },
        {
  label: "Total Courses",
  value: stats.totalCourses.toLocaleString(),
  badge: `${stats.totalLessonsCompleted} lessons done`,
},
        {
  label: "Lessons Completed",
  value: stats.totalLessonsCompleted.toLocaleString(),
  badge: `${stats.totalDocuments} PDFs summarized`,
},
        {
          label: "New This Month",
          value: stats.newUsersThisMonth.toLocaleString(),
          badge: `+${stats.newUsersThisWeek} this week`,
        },
      ].map((stat) => (
        <div
          key={stat.label}
          className="flex-1 bg-white rounded-2xl border border-[#E4E8F5] px-5 py-4 flex flex-col gap-2 min-w-0"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#E8EDFF] flex items-center justify-center">
              <TrendingUp size={15} color="#1A3ADB" />
            </div>
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full text-[#1A3ADB]"
              style={{ backgroundColor: "#E8EDFF" }}
            >
              {stat.badge}
            </span>
          </div>
          <p className="text-[26px] font-black text-[#1A3ADB] leading-tight">{stat.value}</p>
          <p className="text-[12px] text-[#8A97B8]">{stat.label}</p>
        </div>
      ))
    : null;

  // ── RECENT SIGNUPS — real fields: name, email, goal, createdAt ──
  const signupRows = signups.map((user, i) => {
    const goal = user.preferences?.goal?.trim();
    return (
      <div
        key={user._id}
        className="flex items-center gap-3 py-2.5 border-b border-[#E4E8F5] last:border-0"
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
          style={{ backgroundColor: colorForIndex(i) }}
        >
          {initialsFromName(user.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-[#0D1220] truncate">{user.name}</p>
          <p className="text-[11px] text-[#8A97B8] truncate">
            {goal ? goal : user.email}
          </p>
        </div>
        <span className="text-[11px] text-[#8A97B8] flex-shrink-0">{timeAgo(user.createdAt)}</span>
      </div>
    );
  });

  // ── PLATFORM ACTIVITY — real fields: type, description, timestamp ──
  const activityRows = activity.map((item, i) => {
    const { Icon, bg } = activityMeta(item.type);
    return (
      <div
        key={`${item.timestamp}-${i}`}
        className="flex items-center gap-3 py-2.5 border-b border-[#E4E8F5] last:border-0"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: bg }}
        >
          <Icon size={14} color="white" />
        </div>
        <p className="flex-1 text-[13px] text-[#3D4A6B] leading-snug">{item.description}</p>
        <span className="text-[11px] text-[#8A97B8] flex-shrink-0 whitespace-nowrap">
          {timeAgo(item.timestamp)}
        </span>
      </div>
    );
  });

  // ── TOP COURSES — real fields: courseTitle, category, enrollmentCount, averageProgress ──
  const courseRows = topCourses.map((course, i) => (
    <div
      key={course.courseTitle}
      className="flex items-center gap-3 py-2 border-b border-[#E4E8F5] last:border-0"
    >
      <span className="text-[12px] text-[#8A97B8] w-4 flex-shrink-0">{i + 1}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#0D1220] truncate">{course.courseTitle}</p>
        <p className="text-[11px] text-[#8A97B8] truncate">{course.category}</p>
      </div>
      <span className="text-[12px] font-bold flex-shrink-0" style={{ color: "#F5A623" }}>
        {course.averageProgress.toFixed(0)}%
      </span>
      <span className="text-[11px] text-[#8A97B8] flex-shrink-0 whitespace-nowrap">
        {course.enrollmentCount} enrolled
      </span>
    </div>
  ));

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* ── TOPBAR ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-black text-[#0D1220] tracking-tight">Admin Overview</h1>
          <p className="text-[12px] text-[#8A97B8]">Platform analytics and management</p>
        </div>
        <div className="flex items-center gap-3">
          {/* <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A97B8]" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-8 pr-4 py-2 rounded-xl border border-[#E4E8F5] bg-white text-[13px] text-[#0D1220] placeholder-[#8A97B8] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20 w-44"
            />
          </div> */}
          {/* <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A3ADB] text-white text-[13px] font-bold hover:bg-[#1228B0] transition-colors">
            <Plus size={14} />
            New Course
          </button> */}
          
        </div>
      </div>

      {/* ── ERROR STATE ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* ── LOADING STATE ── */}
      {loading && !error && (
        <p className="text-[13px] text-[#8A97B8]">Loading dashboard…</p>
      )}

      {!loading && !error && (
        <>
          {/* ── STAT CARDS ── */}
          <div className="flex gap-4">{statCards}</div>

          {/* ── ROW 2: Chart + Completion + Top Courses ── */}
          <div className="flex gap-5">
            <div className="flex-1 bg-white rounded-2xl border border-[#E4E8F5] p-5 min-w-0">
              <h3 className="text-[14px] font-bold text-[#0D1220] mb-0.5">User Growth</h3>
              <p className="text-[11px] text-[#8A97B8] mb-4">Last 6 months</p>
              <UserGrowthChart growth={growth} />
            </div>

            <div className="w-[220px] flex-shrink-0 bg-white rounded-2xl border border-[#E4E8F5] p-5 flex flex-col items-center justify-center gap-2">
              <h3 className="text-[14px] font-bold text-[#0D1220] self-start">Completion Rate</h3>
              <CompletionDonut percent={stats?.averageCompletionRate ?? 0} />
            </div>

            <div className="w-[280px] flex-shrink-0 bg-white rounded-2xl border border-[#E4E8F5] p-5">
              <h3 className="text-[14px] font-bold text-[#0D1220] mb-3">Top Courses</h3>
              <div className="flex flex-col">
                {courseRows.length > 0 ? courseRows : (
                  <p className="text-[12px] text-[#8A97B8] py-4">No course data yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* ── ROW 3: Recent Signups + Platform Activity ── */}
          <div className="flex gap-5">
            <div className="flex-1 bg-white rounded-2xl border border-[#E4E8F5] p-5 min-w-0">
              <h3 className="text-[14px] font-bold text-[#0D1220] mb-4">Recent Signups</h3>
              <div className="flex flex-col">
                {signupRows.length > 0 ? signupRows : (
                  <p className="text-[12px] text-[#8A97B8] py-4">No signups yet.</p>
                )}
              </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl border border-[#E4E8F5] p-5 min-w-0">
              <h3 className="text-[14px] font-bold text-[#0D1220] mb-4">Platform Activity</h3>
              <div className="flex flex-col">
                {activityRows.length > 0 ? activityRows : (
                  <p className="text-[12px] text-[#8A97B8] py-4">No recent activity.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}