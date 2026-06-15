"use client";

import { useState } from "react";
import {
  Search, Edit2, Archive, BarChart2, Eye,
  BookOpen, TrendingUp,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type CourseStatus = "published" | "draft" | "archived";
type FilterTab    = "all" | "published" | "draft" | "archived";

interface AdminCourse {
  id: string;
  title: string;
  category: string;
  instructor: string;
  students: number;
  rating: number | null;
  status: CourseStatus;
}

interface MonthlyStat {
  month: string;
  enrollments: number;
}

// ─────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────

const COURSES: AdminCourse[] = [
  { id: "1", title: "Python for Beginners",  category: "Web Dev",  instructor: "Sarah Okafor",    students: 3214, rating: 4.8, status: "published" },
  { id: "2", title: "Web Dev Bootcamp",      category: "Web Dev",  instructor: "John Adeyemi",    students: 2841, rating: 4.9, status: "published" },
  { id: "3", title: "Data Science Pro",      category: "Data",     instructor: "Emeka Nwachukwu", students: 1920, rating: 4.7, status: "published" },
  { id: "4", title: "UI/UX Mastery",         category: "Design",   instructor: "Tolu Bello",      students: 1402, rating: 4.8, status: "published" },
  { id: "5", title: "Advanced JS",           category: "Web Dev",  instructor: "Femi Olusanya",   students: 1108, rating: 4.9, status: "published" },
  { id: "6", title: "Cloud Foundations",     category: "Cloud",    instructor: "Kemi Adeleke",    students: 876,  rating: 4.6, status: "published" },
  { id: "7", title: "Nodejs Crash Course",   category: "Backend",  instructor: "Chidi Obi",       students: 234,  rating: null, status: "draft"    },
];

const MONTHLY_ENROLLMENTS: MonthlyStat[] = [
  { month: "Jan", enrollments: 120 },
  { month: "Feb", enrollments: 180 },
  { month: "Mar", enrollments: 210 },
  { month: "Apr", enrollments: 290 },
  { month: "May", enrollments: 380 },
  { month: "Jun", enrollments: 520 },
  { month: "Jul", enrollments: 640 },
];

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all",       label: "All (203)"  },
  { key: "published", label: "Published"  },
  { key: "draft",     label: "Draft"      },
  { key: "archived",  label: "Archived"   },
];

// ─────────────────────────────────────────────────────────────
// MINI BAR CHART for Monthly Enrollments
// ─────────────────────────────────────────────────────────────

function MiniBarChart({ data }: { data: MonthlyStat[] }) {
  const max = Math.max(...data.map((d) => d.enrollments));
  const CHART_H = 60;

  const bars = data.map((d, i) => {
    const heightPct = (d.enrollments / max) * 100;
    const isLast    = i === data.length - 1;
    return (
      <div key={d.month} className="flex flex-col items-center gap-1 flex-1">
        <div className="w-full flex items-end" style={{ height: `${CHART_H}px` }}>
          <div
            className="w-full rounded-t-md transition-all duration-500"
            style={{
              height: `${heightPct}%`,
              backgroundColor: isLast ? "#1A3ADB" : "#C5CFFF",
            }}
          />
        </div>
      </div>
    );
  });

  return (
    <div className="flex items-end gap-1.5 w-full" style={{ height: `${CHART_H}px` }}>
      {bars}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function AdminCoursesPage() {
  const [activeTab, setActiveTab]         = useState<FilterTab>("all");
  const [search, setSearch]               = useState("");
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse>(COURSES[0]);

  // Filter courses
  const filtered = COURSES.filter((c) => {
    const matchTab    = activeTab === "all" || c.status === activeTab;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  // Build filter tabs — Rule 10
  const tabButtons = FILTER_TABS.map((tab) => (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key)}
      className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
        activeTab === tab.key
          ? "bg-[#1A3ADB] text-white"
          : "border border-[#E4E8F5] text-[#3D4A6B] hover:bg-[#E8EDFF]"
      }`}
    >
      {tab.label}
    </button>
  ));

  // Build course table rows — Rule 10
  const courseRows = filtered.map((course) => {
    const isSelected = selectedCourse.id === course.id;
    return (
      <tr
        key={course.id}
        onClick={() => setSelectedCourse(course)}
        className={`border-b border-[#E4E8F5] cursor-pointer transition-colors ${
          isSelected ? "bg-[#E8EDFF]" : "hover:bg-[#F7F8FC]"
        }`}
      >
        <td className="py-3 px-4">
          {isSelected && (
            <span className="inline-block w-1 h-5 bg-[#1A3ADB] rounded-full mr-2 align-middle" />
          )}
          <span className={`text-[13px] font-semibold ${isSelected ? "text-[#1A3ADB]" : "text-[#0D1220]"}`}>
            {course.title}
          </span>
        </td>
        <td className="py-3 px-4 text-[13px] text-[#3D4A6B]">{course.category}</td>
        <td className="py-3 px-4 text-[13px] text-[#3D4A6B]">{course.instructor}</td>
        <td className="py-3 px-4 text-[13px] text-[#3D4A6B]">{course.students.toLocaleString()}</td>
        <td className="py-3 px-4 text-[13px] font-bold" style={{ color: "#F5A623" }}>
          {course.rating ? `${course.rating}★` : "—"}
        </td>
      </tr>
    );
  });

  return (
    <div className="flex gap-5 min-h-screen">

      {/* ── LEFT — course table ── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">

        {/* Topbar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-black text-[#0D1220]">Course Management</h1>
            <p className="text-[12px] text-[#8A97B8]">Create, edit and manage all platform courses</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A97B8]" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-4 py-2 rounded-xl border border-[#E4E8F5] bg-white text-[12px] text-[#0D1220] placeholder-[#8A97B8] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20 w-40"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A3ADB] text-white text-[12px] font-bold hover:bg-[#1228B0] transition-colors">
              + New Course
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          {tabButtons}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E4E8F5] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E4E8F5] bg-[#F7F8FC]">
                <th className="py-3 px-4 text-left text-[12px] font-bold text-[#1A3ADB]">Course Title</th>
                <th className="py-3 px-4 text-left text-[12px] font-bold text-[#1A3ADB]">Category</th>
                <th className="py-3 px-4 text-left text-[12px] font-bold text-[#1A3ADB]">Instructor</th>
                <th className="py-3 px-4 text-left text-[12px] font-bold text-[#1A3ADB]">Students</th>
                <th className="py-3 px-4 text-left text-[12px] font-bold text-[#1A3ADB]">Rating</th>
              </tr>
            </thead>
            <tbody>{courseRows}</tbody>
          </table>
        </div>
      </div>

      {/* ── RIGHT — course details panel ── */}
      <div className="w-[300px] flex-shrink-0 bg-white rounded-2xl border border-[#E4E8F5] p-5 flex flex-col gap-4 h-fit sticky top-6">

        <h3 className="text-[14px] font-bold text-[#1A3ADB]">Course Details</h3>

        {/* Course title + instructor */}
        <div>
          <h4 className="text-[16px] font-black text-[#0D1220]">{selectedCourse.title}</h4>
          <p className="text-[12px] text-[#8A97B8] mt-0.5">by {selectedCourse.instructor}</p>
        </div>

        {/* Meta pills */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#F7F8FC] border border-[#E4E8F5]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-[#1A3ADB] text-white text-[11px] font-bold">Beginner</span>
            <span className="text-[11px] text-[#8A97B8]">32 lessons · 8 modules</span>
          </div>
          <p className="text-[11px] text-[#8A97B8]">
            ★ {selectedCourse.rating ?? "—"} · {selectedCourse.students.toLocaleString()} students enrolled
          </p>
        </div>

        {/* Revenue */}
        {/* <div>
          <p className="text-[11px] text-[#8A97B8] mb-0.5">Revenue</p>
          <p className="text-[22px] font-black text-[#0D1220]">₦482,100</p>
        </div> */}

        {/* Completion rate */}
        <div>
          <p className="text-[11px] text-[#8A97B8] mb-1.5">Completion rate</p>
          <div className="w-full h-2 bg-[#E5E9F5] rounded-full overflow-hidden mb-1">
            <div className="h-full bg-[#1A3ADB] rounded-full" style={{ width: "68%" }} />
          </div>
          <p className="text-[11px] font-bold text-[#1A3ADB]">68% avg</p>
        </div>

        {/* Monthly enrollments mini chart */}
        {/* <div>
          <p className="text-[11px] text-[#8A97B8] mb-2">Monthly Enrollments</p>
          <MiniBarChart data={MONTHLY_ENROLLMENTS} />
        </div> */}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#1A3ADB] text-white text-[12px] font-bold hover:bg-[#1228B0] transition-colors">
            <Edit2 size={12} /> Edit course
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[#EF4444]/40 text-[#EF4444] text-[12px] font-bold hover:bg-[#FEE2E2] transition-colors">
            <Archive size={12} /> Archive
          </button>
        </div>

        <button className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[#E4E8F5] text-[#3D4A6B] text-[12px] font-semibold hover:bg-[#F7F8FC] transition-colors">
          <BarChart2 size={12} /> View analytics
        </button>

        <button className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[#E4E8F5] text-[#1A3ADB] text-[12px] font-semibold hover:bg-[#E8EDFF] transition-colors">
          <Eye size={12} /> Preview course
        </button>
      </div>
    </div>
  );
}