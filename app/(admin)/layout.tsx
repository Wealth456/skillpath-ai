"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { getProfile } from "@/lib/api/user";
import { login } from "@/lib/api/auth";
import PageNav from "@/components/PageNav";
import { verifyPassword } from "@/lib/api/auth";


const adminNav = [
  { label: "Overview",     href: "/admin",          icon: LayoutDashboard },
  { label: "Users",        href: "/admin/users",     icon: Users           },
  { label: "Courses",      href: "/admin/courses",   icon: BookOpen        },
  { label: "Quiz Builder", href: "/admin/quiz",      icon: ClipboardList   },
  { label: "Settings",     href: "/admin/settings",  icon: Settings        },
];

const SIDEBAR_WIDTH_EXPANDED = 220;
const SIDEBAR_WIDTH_COLLAPSED = 76;

type GuardState = "checking" | "authorized" | "denied";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // ── ACCESS GUARD — strictly API-verified, never cached ──
  const [guardState, setGuardState] = useState<GuardState>("checking");

  // ── DISPLAY DATA — may show a cached value briefly for fast paint,
  //     always overwritten by the live getProfile() response below ──
  const [adminName, setAdminName]   = useState("Admin");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminInitials, setAdminInitials] = useState("AD");

  function applyName(name: string) {
    setAdminName(name);
    const parts = name.trim().split(" ");
    const initials = parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase();
    setAdminInitials(initials || "AD");
  }

  // Fast-paint from cache (display only — not used for the access decision)
  useEffect(() => {
    const cachedName = localStorage.getItem("skillpath_name");
    if (cachedName) applyName(cachedName);
  }, []);

  // ── SIDEBAR COLLAPSE — UI preference only, no security implication ──
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("skillpath_admin_sidebar_collapsed");
    if (saved === "true") setSidebarCollapsed(true);
  }, []);

  function toggleSidebar() {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("skillpath_admin_sidebar_collapsed", String(next));
      return next;
    });
  }

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  // ── AVATAR DROPDOWN ──
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── LOGOUT CONFIRMATION MODAL — re-verifies password via a real login() call ──
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [logoutPassword, setLogoutPassword]   = useState("");
  const [showLogoutPassword, setShowLogoutPassword] = useState(false);
  const [logoutError, setLogoutError]         = useState("");
  const [logoutLoading, setLogoutLoading]     = useState(false);

  function requestLogout() {
    setDropdownOpen(false);
    setLogoutPassword("");
    setLogoutError("");
    setLogoutModalOpen(true);
  }

 async function confirmLogout() {
    if (!logoutPassword) {
      setLogoutError("Please enter your password.");
      return;
    }
    if (!adminEmail) {
      setLogoutError("Could not verify your account. Please refresh and try again.");
      return;
    }

    setLogoutLoading(true);
    setLogoutError("");

    const isValid = await verifyPassword(adminEmail, logoutPassword);

    if (!isValid) {
      setLogoutError("Incorrect password. Please try again.");
      setLogoutLoading(false);
      return;
    }

    localStorage.removeItem("skillpath_token");
    localStorage.removeItem("skillpath_role");
    localStorage.removeItem("skillpath_name");
    localStorage.removeItem("skillpath_email");
    localStorage.removeItem("skillpath_user_id");
    localStorage.removeItem("skillpath_preferences");
    localStorage.removeItem("skillpath_roadmap");

    router.push("/login");
    setLogoutLoading(false);
  }

  // ── ROUTE GUARD — the only thing that decides access is this live API call ──
  useEffect(() => {
    let cancelled = false;

    async function verifyAdmin() {
      try {
        const res = await getProfile();
        const user = res.data.data.user;

        if (cancelled) return;

        if (user.role !== "admin") {
          setGuardState("denied");
          router.replace("/login");
          return;
        }

        applyName(user.name);
        setAdminEmail(user.email);
        localStorage.setItem("skillpath_name", user.name);
        localStorage.setItem("skillpath_email", user.email);

        setGuardState("authorized");
      } catch {
        if (cancelled) return;
        setGuardState("denied");
        router.replace("/login");
      }
    }

    verifyAdmin();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (guardState !== "authorized") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC]">
        <div className="w-8 h-8 rounded-full border-4 border-[#1A3ADB] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F7F8FC]">
      {/* ── SIDEBAR ── */}
      <aside
        style={{ width: `${sidebarWidth}px` }}
        className="min-h-screen bg-white border-r border-[#E4E8F5] flex flex-col fixed top-0 left-0 z-40 transition-all duration-200"
      >
        {/* Logo */}
        <div className="px-5 py-4 border-b border-[#E4E8F5] flex items-center gap-2">
          <div style={{ backgroundColor: "#F5A623" }} className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            <Image src="/logo.png" alt="SkillPath AI" width={20} height={20} className="object-contain" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="font-black text-[#0D1220] text-[13px] leading-tight tracking-tight truncate">
                SKILL<span style={{ color: "#F5A623" }}>PATH</span> AI
              </p>
              <p className="text-[10px] font-bold text-[#1A3ADB]">AI Admin</p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-white border border-[#E4E8F5] shadow-sm flex items-center justify-center text-[#8A97B8] hover:text-[#1A3ADB] hover:border-[#1A3ADB] transition-colors z-50"
        >
          {sidebarCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {adminNav.map((item) => {
            const Icon     = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={sidebarCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
                  sidebarCollapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-[#E8EDFF] text-[#1A3ADB]" + (sidebarCollapsed ? "" : " border-l-4 border-[#1A3ADB]")
                    : "text-[#3D4A6B] hover:bg-[#F7F8FC] hover:text-[#0D1220]"
                }`}
              >
                <Icon size={16} className="flex-shrink-0" />
                {!sidebarCollapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* Admin strip — display only, logout lives in the topbar dropdown */}
        <div className={`border-t border-[#E4E8F5] px-4 py-3 flex items-center gap-2 ${
          sidebarCollapsed ? "justify-center px-2" : ""
        }`}>
          <div className="w-8 h-8 rounded-full bg-[#1A3ADB] flex items-center justify-center text-white font-bold text-[12px] flex-shrink-0">
            {adminInitials}
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-[#0D1220] leading-tight truncate">{adminName}</p>
              <p className="text-[10px] text-[#8A97B8]">Admin</p>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div
        style={{ marginLeft: `${sidebarWidth}px` }}
        className="flex-1 flex flex-col min-h-screen transition-all duration-200"
      >
        {/* Topbar */}
        <header className="h-[62px] bg-white border-b border-[#E4E8F5] flex items-center justify-end px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full bg-[#F7F8FC] border border-[#E4E8F5] flex items-center justify-center text-[#8A97B8] hover:text-[#0D1220] transition-colors">
              <Bell size={16} />
            </button>

            {/* Avatar dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((open) => !open)}
                className="flex items-center gap-1.5 hover:bg-[#F7F8FC] rounded-full pr-1.5 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#1A3ADB] flex items-center justify-center text-white font-bold text-[12px]">
                  {adminInitials}
                </div>
                <ChevronDown
                  size={14}
                  className={`text-[#8A97B8] transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#E4E8F5] rounded-2xl shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-[#E4E8F5]">
                    <p className="text-[13px] font-bold text-[#0D1220] truncate">{adminName}</p>
                    {adminEmail && (
                      <p className="text-[11px] text-[#8A97B8] truncate">{adminEmail}</p>
                    )}
                  </div>

                  <div className="py-1.5">
                    <Link
                      href="/admin/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-[#0D1220] hover:bg-[#F7F8FC] transition-colors"
                    >
                      <Settings size={15} className="text-[#8A97B8]" />
                      Settings
                    </Link>
                  </div>

                  <div className="py-1.5 border-t border-[#E4E8F5]">
                    <button
                      onClick={requestLogout}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-[#EF4444] hover:bg-[#FEE2E2] w-full transition-colors"
                    >
                      <LogOut size={15} />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <PageNav />
          {children}
        </main>
      </div>

      {/* ── LOGOUT CONFIRMATION MODAL ── */}
      {logoutModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-[17px] font-black text-[#0D1220] mb-1">Confirm logout</h3>
            <p className="text-[13px] text-[#8A97B8] mb-5">
              For your security, please re-enter your password to log out.
            </p>

            <label className="block text-[12px] font-semibold text-[#0D1220] mb-1.5">
              Password
            </label>
            <div className="relative mb-2">
              <input
                type={showLogoutPassword ? "text" : "password"}
                value={logoutPassword}
                onChange={(e) => setLogoutPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmLogout();
                }}
                placeholder="Enter your password"
                autoFocus
                className="w-full h-11 pl-3 pr-10 border border-[#E4E8F5] rounded-lg text-[14px] text-[#0D1220] placeholder:text-[#8A97B8] focus:outline-none focus:border-[#1A3ADB] focus:ring-2 focus:ring-[#1A3ADB]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowLogoutPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A97B8] hover:text-[#0D1220] transition-colors"
              >
                {showLogoutPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {logoutError && (
              <p className="text-[12px] text-[#EF4444] mb-3">{logoutError}</p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setLogoutModalOpen(false)}
                disabled={logoutLoading}
                className="flex-1 py-2.5 rounded-full border border-[#E4E8F5] text-[13px] font-semibold text-[#0D1220] hover:bg-[#F7F8FC] transition-all disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                disabled={logoutLoading}
                className="flex-1 py-2.5 rounded-full bg-[#EF4444] hover:opacity-90 text-white text-[13px] font-bold transition-all disabled:opacity-60"
              >
                {logoutLoading ? "Verifying..." : "Log out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}