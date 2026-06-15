"use client";

import { Search, Plus, TrendingUp } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface StatCard {
  label: string;
  value: string;
  badge: string;
  badgeColor: string; // only blue shades — no green/purple/yellow
}

interface SignupUser {
  initials: string;
  name: string;
  location: string;
  track: string;
  time: string;
  avatarBg: string; // blue shades only
}

interface ActivityItem {
  initials: string;
  text: string;
  time: string;
  avatarBg: string;
}

interface TopCourse {
  rank: number;
  name: string;
  rating: string;
  students: string;
}

// ─────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────

const STATS: StatCard[] = [
  { label: "Total Users",   value: "12,847", badge: "+234 this week",  badgeColor: "#E8EDFF" },
  { label: "Active Courses", value: "203",   badge: "+12 this month",  badgeColor: "#E8EDFF" },
  { label: "Lessons Done",  value: "48,291", badge: "+1,204 today",    badgeColor: "#E8EDFF" },
  // { label: "Revenue",       value: "₦2.4M",  badge: "+180% this week", badgeColor: "#E8EDFF" },
];

const SIGNUPS: SignupUser[] = [
  { initials: "Am", name: "Amaka O.",  location: "Lagos",  track: "Web Dev",  time: "2 min ago",  avatarBg: "#1A3ADB" },
  { initials: "Kw", name: "Kwame A.",  location: "Accra",  track: "Data Sci", time: "15 min ago", avatarBg: "#1228B0" },
  { initials: "Fa", name: "Fatima M.", location: "Abuja",  track: "Python",   time: "1 h ago",    avatarBg: "#3D5AE8" },
  { initials: "Tu", name: "Tunde B.",  location: "Lagos",  track: "UI/UX",    time: "2 h ago",    avatarBg: "#0D1B4B" },
  { initials: "Ng", name: "Ngozi E.",  location: "PH",     track: "Web Dev",  time: "3 h ago",    avatarBg: "#2244CC" },
  { initials: "Ko", name: "Kofi A.",   location: "Accra",  track: "Python",   time: "5 h ago",    avatarBg: "#1A3ADB" },
];

const ACTIVITY: ActivityItem[] = [
  { initials: "A", text: "Amaka completed Python Module 4",          time: "2 min ago",   avatarBg: "#1A3ADB" },
  { initials: "B", text: "New 5-star review on Web Dev Bootcamp",    time: "8 min ago",   avatarBg: "#1228B0" },
  { initials: "C", text: "12 new users signed up today",             time: "15 min ago",  avatarBg: "#0D1B4B" },
  { initials: "D", text: "Fatima uploaded and summarised a PDF",     time: "22 min ago",  avatarBg: "#3D5AE8" },
  { initials: "E", text: "Kwame earned 'Data Pro' badge",            time: "1 h ago",     avatarBg: "#1A3ADB" },
  { initials: "F", text: "New course 'Node.js' published",           time: "2 h ago",     avatarBg: "#2244CC" },
  { initials: "G", text: "Server response time spike detected",      time: "3 h ago",     avatarBg: "#EF4444" },
  { initials: "H", text: "3 support tickets opened",                 time: "4 h ago",     avatarBg: "#8A97B8" },
];

const TOP_COURSES: TopCourse[] = [
  { rank: 1, name: "Python Basics",    rating: "4.9★", students: "32k students" },
  { rank: 2, name: "Web Dev Bootcamp", rating: "4.8★", students: "2.8k students" },
  { rank: 3, name: "Data Science",     rating: "4.7★", students: "1.9k students" },
  { rank: 4, name: "UI/UX Design",     rating: "4.8★", students: "1.4k students" },
  { rank: 5, name: "JS Deep Dive",     rating: "4.9★", students: "1.1k students" },
];

// ─────────────────────────────────────────────────────────────
// AREA CHART — pure SVG, no library
// ─────────────────────────────────────────────────────────────

function UserGrowthChart() {
  // 6 months of user growth data points
  const dataPoints = [320, 420, 480, 550, 670, 700];
  const labels     = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const width      = 440;
  const height     = 160;
  const padX       = 20;
  const padY       = 20;
  const maxVal     = Math.max(...dataPoints);
  const minVal     = Math.min(...dataPoints);

  // Map data to SVG coordinates
  const points = dataPoints.map((val, i) => {
    const x = padX + (i / (dataPoints.length - 1)) * (width - padX * 2);
    const y = height - padY - ((val - minVal) / (maxVal - minVal)) * (height - padY * 2);
    return { x, y, val };
  });

  // Build SVG polyline string
  const lineStr = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Build filled area path
  const areaPath =
    `M ${points[0].x},${height - padY} ` +
    points.map((p) => `L ${p.x},${p.y}`).join(" ") +
    ` L ${points[points.length - 1].x},${height - padY} Z`;

  // Build dot elements outside JSX — Rule 10
  const dots = points.map((p, i) => (
    <circle key={i} cx={p.x} cy={p.y} r={4} fill="#1A3ADB" stroke="white" strokeWidth={2} />
  ));

  // Build label elements outside JSX — Rule 10
  const xLabels = labels.map((label, i) => {
    const x = padX + (i / (labels.length - 1)) * (width - padX * 2);
    return (
      <text key={label} x={x} y={height + 14} textAnchor="middle" fontSize={11} fill="#8A97B8">
        {label}
      </text>
    );
  });

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height + 20}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1A3ADB" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#1A3ADB" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {/* Filled area */}
      <path d={areaPath} fill="url(#areaGrad)" />
      {/* Line */}
      <polyline points={lineStr} fill="none" stroke="#1A3ADB" strokeWidth={2.5} strokeLinejoin="round" />
      {/* Dots */}
      {dots}
      {/* X labels */}
      {xLabels}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// DONUT CHART — completion rate
// ─────────────────────────────────────────────────────────────

function CompletionDonut({ percent }: { percent: number }) {
  const radius      = 70;
  const stroke      = 14;
  const r           = radius - stroke / 2;
  const circ        = 2 * Math.PI * r;
  const offset      = circ - (percent / 100) * circ;

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
          <span className="text-[22px] font-black text-[#0D1220]">{percent}%</span>
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

  // ── Build stat cards outside JSX — Rule 10 ──
  const statCards = STATS.map((stat) => (
    <div key={stat.label} className="flex-1 bg-white rounded-2xl border border-[#E4E8F5] px-5 py-4 flex flex-col gap-2 min-w-0">
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-lg bg-[#E8EDFF] flex items-center justify-center">
          <TrendingUp size={15} color="#1A3ADB" />
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full text-[#1A3ADB]" style={{ backgroundColor: "#E8EDFF" }}>
          {stat.badge}
        </span>
      </div>
      <p className="text-[26px] font-black text-[#1A3ADB] leading-tight">{stat.value}</p>
      <p className="text-[12px] text-[#8A97B8]">{stat.label}</p>
    </div>
  ));

  // ── Build signup rows outside JSX — Rule 10 ──
  const signupRows = SIGNUPS.map((user) => (
    <div key={user.name} className="flex items-center gap-3 py-2.5 border-b border-[#E4E8F5] last:border-0">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
        style={{ backgroundColor: user.avatarBg }}
      >
        {user.initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-[#0D1220]">{user.name}</p>
        <p className="text-[11px] text-[#8A97B8]">{user.location} · {user.track}</p>
      </div>
      <span className="text-[11px] text-[#8A97B8] flex-shrink-0">{user.time}</span>
    </div>
  ));

  // ── Build activity rows outside JSX — Rule 10 ──
  const activityRows = ACTIVITY.map((item) => (
    <div key={item.text} className="flex items-center gap-3 py-2.5 border-b border-[#E4E8F5] last:border-0">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
        style={{ backgroundColor: item.avatarBg }}
      >
        {item.initials}
      </div>
      <p className="flex-1 text-[13px] text-[#3D4A6B] leading-snug">{item.text}</p>
      <span className="text-[11px] text-[#8A97B8] flex-shrink-0 whitespace-nowrap">{item.time}</span>
    </div>
  ));

  // ── Build top course rows outside JSX — Rule 10 ──
  const courseRows = TOP_COURSES.map((course) => (
    <div key={course.name} className="flex items-center gap-3 py-2 border-b border-[#E4E8F5] last:border-0">
      <span className="text-[12px] text-[#8A97B8] w-4 flex-shrink-0">{course.rank}</span>
      <p className="flex-1 text-[13px] font-semibold text-[#0D1220]">{course.name}</p>
      <span className="text-[12px] font-bold" style={{ color: "#F5A623" }}>{course.rating}</span>
      <span className="text-[11px] text-[#8A97B8]">{course.students}</span>
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
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A97B8]" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-8 pr-4 py-2 rounded-xl border border-[#E4E8F5] bg-white text-[13px] text-[#0D1220] placeholder-[#8A97B8] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20 w-44"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A3ADB] text-white text-[13px] font-bold hover:bg-[#1228B0] transition-colors">
            <Plus size={14} />
            New Course
          </button>
          <div className="w-9 h-9 rounded-full bg-[#1A3ADB] flex items-center justify-center text-white font-bold text-[12px]">
            AD
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="flex gap-4">
        {statCards}
      </div>

      {/* ── ROW 2: Chart + Completion + Top Courses ── */}
      <div className="flex gap-5">

        {/* User Growth chart */}
        <div className="flex-1 bg-white rounded-2xl border border-[#E4E8F5] p-5 min-w-0">
          <h3 className="text-[14px] font-bold text-[#0D1220] mb-0.5">User Growth</h3>
          <p className="text-[11px] text-[#8A97B8] mb-4">Last 6 months</p>
          <UserGrowthChart />
        </div>

        {/* Completion Rate donut */}
        <div className="w-[220px] flex-shrink-0 bg-white rounded-2xl border border-[#E4E8F5] p-5 flex flex-col items-center justify-center gap-2">
          <h3 className="text-[14px] font-bold text-[#0D1220] self-start">Completion Rate</h3>
          <CompletionDonut percent={78} />
        </div>

        {/* Top Courses */}
        <div className="w-[280px] flex-shrink-0 bg-white rounded-2xl border border-[#E4E8F5] p-5">
          <h3 className="text-[14px] font-bold text-[#0D1220] mb-3">Top Courses</h3>
          <div className="flex flex-col">
            {courseRows}
          </div>
        </div>
      </div>

      {/* ── ROW 3: Recent Signups + Platform Activity ── */}
      <div className="flex gap-5">

        {/* Recent Signups */}
        <div className="flex-1 bg-white rounded-2xl border border-[#E4E8F5] p-5 min-w-0">
          <h3 className="text-[14px] font-bold text-[#0D1220] mb-4">Recent Signups</h3>
          <div className="flex flex-col">
            {signupRows}
          </div>
        </div>

        {/* Platform Activity */}
        <div className="flex-1 bg-white rounded-2xl border border-[#E4E8F5] p-5 min-w-0">
          <h3 className="text-[14px] font-bold text-[#0D1220] mb-4">Platform Activity</h3>
          <div className="flex flex-col">
            {activityRows}
          </div>
        </div>
      </div>
    </div>
  );
}