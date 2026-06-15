"use client";

import { useState } from "react";
import { Search, Filter, MoreHorizontal, Mail, BookOpen, Calendar } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type UserStatus = "active" | "inactive" | "suspended";
type FilterTab  = "all" | "active" | "inactive" | "suspended";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  level: string;
  goal: string;
  location: string;
  joined: string;
  courses: number;
  status: UserStatus;
  initials: string;
  avatarBg: string;
}

// ─────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────

const USERS: AdminUser[] = [
  { id: "1",  name: "Amaka Okonkwo",   email: "amaka@gmail.com",    level: "Beginner",     goal: "Web Dev",   location: "Lagos, NG",   joined: "May 2025",  courses: 3,  status: "active",    initials: "AO", avatarBg: "#1A3ADB" },
  { id: "2",  name: "Kwame Asante",    email: "kwame@gmail.com",    level: "Intermediate", goal: "Data Sci",  location: "Accra, GH",   joined: "Apr 2025",  courses: 5,  status: "active",    initials: "KA", avatarBg: "#1228B0" },
  { id: "3",  name: "Fatima Musa",     email: "fatima@gmail.com",   level: "Beginner",     goal: "Python",    location: "Abuja, NG",   joined: "May 2025",  courses: 2,  status: "active",    initials: "FM", avatarBg: "#0D1B4B" },
  { id: "4",  name: "Tunde Bakare",    email: "tunde@gmail.com",    level: "Advanced",     goal: "UI/UX",     location: "Lagos, NG",   joined: "Mar 2025",  courses: 7,  status: "active",    initials: "TB", avatarBg: "#3D5AE8" },
  { id: "5",  name: "Ngozi Eze",       email: "ngozi@gmail.com",    level: "Intermediate", goal: "Web Dev",   location: "PH, NG",      joined: "Apr 2025",  courses: 4,  status: "inactive",  initials: "NE", avatarBg: "#2244CC" },
  { id: "6",  name: "Kofi Acheampong", email: "kofi@gmail.com",     level: "Beginner",     goal: "Python",    location: "Accra, GH",   joined: "Jun 2025",  courses: 1,  status: "active",    initials: "KA", avatarBg: "#1A3ADB" },
  { id: "7",  name: "Chisom Obi",      email: "chisom@gmail.com",   level: "Intermediate", goal: "Backend",   location: "Enugu, NG",   joined: "Feb 2025",  courses: 6,  status: "active",    initials: "CO", avatarBg: "#1228B0" },
  { id: "8",  name: "Ayo Adeleke",     email: "ayo@gmail.com",      level: "Beginner",     goal: "Web Dev",   location: "Ibadan, NG",  joined: "Jun 2025",  courses: 2,  status: "suspended", initials: "AA", avatarBg: "#8A97B8" },
  { id: "9",  name: "Zainab Yusuf",    email: "zainab@gmail.com",   level: "Advanced",     goal: "Data Sci",  location: "Kano, NG",    joined: "Jan 2025",  courses: 9,  status: "active",    initials: "ZY", avatarBg: "#0D1B4B" },
  { id: "10", name: "Emeka Nwosu",     email: "emeka@gmail.com",    level: "Intermediate", goal: "Cloud",     location: "Onitsha, NG", joined: "Mar 2025",  courses: 4,  status: "inactive",  initials: "EN", avatarBg: "#3D5AE8" },
];

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all",       label: `All (${USERS.length})` },
  { key: "active",    label: "Active"                 },
  { key: "inactive",  label: "Inactive"               },
  { key: "suspended", label: "Suspended"              },
];

// Status badge styles — blue palette only
const STATUS_STYLES: Record<UserStatus, string> = {
  active:    "bg-[#E8EDFF] text-[#1A3ADB]",
  inactive:  "bg-[#E5E9F5] text-[#8A97B8]",
  suspended: "bg-[#FEE2E2] text-[#EF4444]",
};

// ─────────────────────────────────────────────────────────────
// USER DETAIL PANEL
// ─────────────────────────────────────────────────────────────

function UserDetailPanel({ user }: { user: AdminUser }) {
  return (
    <div className="w-[280px] flex-shrink-0 bg-white rounded-2xl border border-[#E4E8F5] p-5 flex flex-col gap-4 h-fit sticky top-6">

      <h3 className="text-[14px] font-bold text-[#1A3ADB]">User Details</h3>

      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-2 py-4 border-b border-[#E4E8F5]">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-[20px] font-black"
          style={{ backgroundColor: user.avatarBg }}
        >
          {user.initials}
        </div>
        <p className="text-[15px] font-black text-[#0D1220]">{user.name}</p>
        <p className="text-[12px] text-[#8A97B8]">{user.email}</p>
        <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${STATUS_STYLES[user.status]}`}>
          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </span>
      </div>

      {/* Info rows */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E8EDFF] flex items-center justify-center flex-shrink-0">
            <BookOpen size={14} color="#1A3ADB" />
          </div>
          <div>
            <p className="text-[11px] text-[#8A97B8]">Level · Goal</p>
            <p className="text-[12px] font-bold text-[#0D1220]">{user.level} · {user.goal}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E8EDFF] flex items-center justify-center flex-shrink-0">
            <Mail size={14} color="#1A3ADB" />
          </div>
          <div>
            <p className="text-[11px] text-[#8A97B8]">Location</p>
            <p className="text-[12px] font-bold text-[#0D1220]">{user.location}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E8EDFF] flex items-center justify-center flex-shrink-0">
            <Calendar size={14} color="#1A3ADB" />
          </div>
          <div>
            <p className="text-[11px] text-[#8A97B8]">Joined</p>
            <p className="text-[12px] font-bold text-[#0D1220]">{user.joined}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 border-t border-[#E4E8F5] pt-4">
        <div className="flex flex-col items-center py-3 rounded-xl bg-[#F7F8FC] border border-[#E4E8F5]">
          <span className="text-[18px] font-black text-[#1A3ADB]">{user.courses}</span>
          <span className="text-[10px] text-[#8A97B8]">Courses</span>
        </div>
        <div className="flex flex-col items-center py-3 rounded-xl bg-[#F7F8FC] border border-[#E4E8F5]">
          <span className="text-[18px] font-black text-[#1A3ADB]">68%</span>
          <span className="text-[10px] text-[#8A97B8]">Avg progress</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 border-t border-[#E4E8F5] pt-3">
        <button className="w-full py-2.5 rounded-xl bg-[#1A3ADB] text-white text-[12px] font-bold hover:bg-[#1228B0] transition-colors">
          Send message
        </button>
        <button className="w-full py-2.5 rounded-xl border border-[#E4E8F5] text-[#3D4A6B] text-[12px] font-semibold hover:bg-[#F7F8FC] transition-colors">
          View activity
        </button>
        {user.status !== "suspended" ? (
          <button className="w-full py-2.5 rounded-xl border border-[#EF4444]/30 text-[#EF4444] text-[12px] font-semibold hover:bg-[#FEE2E2] transition-colors">
            Suspend user
          </button>
        ) : (
          <button className="w-full py-2.5 rounded-xl border border-[#1A3ADB]/30 text-[#1A3ADB] text-[12px] font-semibold hover:bg-[#E8EDFF] transition-colors">
            Reactivate user
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [activeTab, setActiveTab]           = useState<FilterTab>("all");
  const [search, setSearch]                 = useState("");
  const [selectedUser, setSelectedUser]     = useState<AdminUser>(USERS[0]);

  // Filter users
  const filtered = USERS.filter((u) => {
    const matchTab    = activeTab === "all" || u.status === activeTab;
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
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

  // Build table rows — Rule 10
  const userRows = filtered.map((user) => {
    const isSelected = selectedUser.id === user.id;
    return (
      <tr
        key={user.id}
        onClick={() => setSelectedUser(user)}
        className={`border-b border-[#E4E8F5] cursor-pointer transition-colors ${
          isSelected ? "bg-[#E8EDFF]" : "hover:bg-[#F7F8FC]"
        }`}
      >
        {/* Name + avatar */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            {isSelected && (
              <span className="w-1 h-5 bg-[#1A3ADB] rounded-full flex-shrink-0" />
            )}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
              style={{ backgroundColor: user.avatarBg }}
            >
              {user.initials}
            </div>
            <div>
              <p className={`text-[13px] font-semibold ${isSelected ? "text-[#1A3ADB]" : "text-[#0D1220]"}`}>
                {user.name}
              </p>
              <p className="text-[11px] text-[#8A97B8]">{user.email}</p>
            </div>
          </div>
        </td>
        <td className="py-3 px-4 text-[12px] text-[#3D4A6B]">{user.level}</td>
        <td className="py-3 px-4 text-[12px] text-[#3D4A6B]">{user.goal}</td>
        <td className="py-3 px-4 text-[12px] text-[#3D4A6B]">{user.location}</td>
        <td className="py-3 px-4 text-[12px] text-[#3D4A6B]">{user.joined}</td>
        <td className="py-3 px-4 text-[12px] text-center text-[#3D4A6B]">{user.courses}</td>
        <td className="py-3 px-4">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_STYLES[user.status]}`}>
            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
          </span>
        </td>
        <td className="py-3 px-4">
          <button className="text-[#8A97B8] hover:text-[#1A3ADB] transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </td>
      </tr>
    );
  });

  return (
    <div className="flex gap-5 min-h-screen">

      {/* ── LEFT — users table ── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">

        {/* Topbar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-black text-[#0D1220]">User Management</h1>
            <p className="text-[12px] text-[#8A97B8]">View and manage all platform learners</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A97B8]" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-4 py-2 rounded-xl border border-[#E4E8F5] bg-white text-[12px] placeholder-[#8A97B8] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20 w-44"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E4E8F5] text-[#3D4A6B] text-[12px] font-semibold hover:bg-[#F7F8FC] transition-colors">
              <Filter size={13} /> Filter
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          {tabButtons}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E4E8F5] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E4E8F5] bg-[#F7F8FC]">
                <th className="py-3 px-4 text-left text-[12px] font-bold text-[#1A3ADB]">User</th>
                <th className="py-3 px-4 text-left text-[12px] font-bold text-[#1A3ADB]">Level</th>
                <th className="py-3 px-4 text-left text-[12px] font-bold text-[#1A3ADB]">Goal</th>
                <th className="py-3 px-4 text-left text-[12px] font-bold text-[#1A3ADB]">Location</th>
                <th className="py-3 px-4 text-left text-[12px] font-bold text-[#1A3ADB]">Joined</th>
                <th className="py-3 px-4 text-center text-[12px] font-bold text-[#1A3ADB]">Courses</th>
                <th className="py-3 px-4 text-left text-[12px] font-bold text-[#1A3ADB]">Status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>{userRows}</tbody>
          </table>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-[#8A97B8] text-[13px]">
              No users match your search.
            </div>
          )}
        </div>

        {/* Footer count */}
        <p className="text-[12px] text-[#8A97B8]">
          Showing {filtered.length} of {USERS.length} users
        </p>
      </div>

      {/* ── RIGHT — user detail panel ── */}
      <UserDetailPanel user={selectedUser} />
    </div>
  );
}