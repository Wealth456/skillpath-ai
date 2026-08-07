"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Map,
  BookOpen,
  FileText,
  User,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { getProfile } from "@/lib/api/user";
// import { login } from "@/lib/api/auth";
import { verifyPassword } from "@/lib/api/auth";

const navItems = [
  { label: "Dashboard",  href: "/dashboard", icon: LayoutDashboard },
  { label: "My Roadmap", href: "/roadmap",   icon: Map },
  { label: "Courses",    href: "/courses",   icon: BookOpen },
  { label: "PDF Tool",   href: "/pdf",       icon: FileText },
  { label: "Profile",    href: "/profile",   icon: User },
];

function getDefaultMeta(path: string): { title: string; subtitle: string } {
  if (path === "/courses")              return { title: "Course Catalogue",  subtitle: "Browse 200+ tech courses" };
  if (path.startsWith("/courses/"))     return { title: "Course Detail",     subtitle: "Course Detail" };
  if (path.startsWith("/dashboard"))    return { title: "Dashboard",         subtitle: "Welcome back" };
  if (path.startsWith("/roadmap"))      return { title: "My Roadmap",        subtitle: "Your personalised learning path" };
  if (path.startsWith("/profile")) {
  return { title: "My Profile", subtitle: "Manage your account and preferences" };
}
  if (path.startsWith("/pdf")) {
    return { title: "PDF Summariser", subtitle: "Upload a PDF and get AI-powered notes instantly" };
}
  return { title: "SkillPath AI", subtitle: "" };
}

const SIDEBAR_WIDTH_EXPANDED = 240;
const SIDEBAR_WIDTH_COLLAPSED = 76;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  const [userName, setUserName]         = useState("Learner");
  const [userInitials, setUserInitials] = useState("L");
  const [userEmail, setUserEmail]       = useState("");
  const [pageTitle, setPageTitle]       = useState("");
  const [pageSubtitle, setPageSubtitle] = useState("");

  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // ── SIDEBAR COLLAPSE ─────────────────────────────────────────────────────
  // Persisted so the user's preference survives a page refresh/navigation,
  // not just component state.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("skillpath_sidebar_collapsed");
    if (saved === "true") setSidebarCollapsed(true);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");

useEffect(() => {
  const saved = sessionStorage.getItem("skillpath_search_query");
  if (saved) setSearchQuery(saved);
}, []);

function handleSearchChange(value: string) {
  setSearchQuery(value);
  sessionStorage.setItem("skillpath_search_query", value);
  window.dispatchEvent(
    new CustomEvent("skillpath-search-update", { detail: { query: value } })
  );
}

function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === "Enter" && !pathname.startsWith("/courses")) {
    router.push("/courses");
  }
}

  function toggleSidebar() {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("skillpath_sidebar_collapsed", String(next));
      return next;
    });
  }

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  // ── AVATAR DROPDOWN ──────────────────────────────────────────────────────
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── LOGOUT CONFIRMATION MODAL ────────────────────────────────────────────
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [logoutPassword, setLogoutPassword]   = useState("");
  const [showLogoutPassword, setShowLogoutPassword] = useState(false);
  const [logoutError, setLogoutError]         = useState("");
  const [logoutLoading, setLogoutLoading]     = useState(false);

  // Read user info from localStorage on mount
  useEffect(() => {
    const cachedName  = localStorage.getItem("skillpath_name");
    const cachedEmail = localStorage.getItem("skillpath_email");

    function applyName(name: string) {
      setUserName(name);
      const parts    = name.trim().split(" ");
      const initials = parts.map((p: string) => p[0]).join("").slice(0, 2).toUpperCase();
      setUserInitials(initials);
    }

    if (cachedName) {
      applyName(cachedName);
    }
    if (cachedEmail) {
      setUserEmail(cachedEmail);
    }

    if (!cachedName || !cachedEmail) {
      getProfile()
        .then((res) => {
          const user = res.data?.data?.user;
          if (!user) return;

          if (user.name) {
            applyName(user.name);
            localStorage.setItem("skillpath_name", user.name);
          }
          if (user.email) {
            setUserEmail(user.email);
            localStorage.setItem("skillpath_email", user.email);
          }
        })
        .catch(() => {
          // Leave whatever fallback is already showing —
          // confirmLogout() handles a missing email gracefully.
        });
    }
  }, []);

  // Close the dropdown when clicking outside it
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── ONBOARDING GUARD ──────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("skillpath_token");
    if (!token) {
      router.push("/login");
      return;
    }

    async function checkOnboarding() {
      try {
        const res = await getProfile();
        const preferences = res.data?.data?.user?.preferences;

        if (!preferences?.goal || preferences.goal === "") {
          router.push("/onboarding/goal");
          return;
        }
        setCheckingOnboarding(false);
      } catch {
        router.push("/login");
      }
    }

    checkOnboarding();
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const storedTitle    = sessionStorage.getItem("skillpath_page_title");
      const storedSubtitle = sessionStorage.getItem("skillpath_page_subtitle");
      const defaults       = getDefaultMeta(pathname);
      setPageTitle(storedTitle       || defaults.title);
      setPageSubtitle(storedSubtitle || defaults.subtitle);
    }, 80);

    const defaults = getDefaultMeta(pathname);
    setPageTitle(defaults.title);
    setPageSubtitle(defaults.subtitle);

    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    function handleTitleUpdate(e: Event) {
      const custom = e as CustomEvent<{ title: string; subtitle: string }>;
      setPageTitle(custom.detail.title);
      setPageSubtitle(custom.detail.subtitle);
    }
    window.addEventListener("skillpath-title-update", handleTitleUpdate);
    return () => window.removeEventListener("skillpath-title-update", handleTitleUpdate);
  }, []);

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
    if (!userEmail) {
      setLogoutError("Could not verify your account. Please refresh and try again.");
      return;
    }

    setLogoutLoading(true);
    setLogoutError("");

    const isValid = await verifyPassword(userEmail, logoutPassword);

    if (!isValid) {
      setLogoutError("Incorrect password. Please try again.");
      setLogoutLoading(false);
      return;
    }

    localStorage.removeItem("skillpath_token");
    localStorage.removeItem("skillpath_name");
    localStorage.removeItem("skillpath_email");
    localStorage.removeItem("skillpath_user_id");
    localStorage.removeItem("skillpath_preferences");
    localStorage.removeItem("skillpath_roadmap");

    router.push("/login");
    setLogoutLoading(false);
  }

  if (checkingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface">

      {/* ── SIDEBAR ── */}
      <aside
        style={{ width: `${sidebarWidth}px` }}
        className="min-h-screen bg-sidebar flex flex-col fixed top-0 left-0 z-40 transition-all duration-200"
      >
        {/* Logo + collapse toggle */}
        <div className="bg-sidebar-header px-5 py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div style={{ backgroundColor: "#F5A623" }} className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
              <Image src="/logo.png" alt="SkillPath AI" width={24} height={24} className="object-contain" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-black text-white tracking-tight text-[14px] whitespace-nowrap">
                SKILL<span style={{ color: "#F5A623" }}>PATH</span> AI
              </span>
            )}
          </div>
        </div>

        {/* Collapse/expand toggle button — sits on the sidebar's edge */}
        <button
          onClick={toggleSidebar}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-white border border-border shadow-card-default flex items-center justify-center text-ink-muted hover:text-primary hover:border-primary transition-colors z-50"
        >
          {sidebarCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon     = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                title={sidebarCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-[14px] font-semibold ${
                  sidebarCollapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-ink-faint hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon size={17} className="flex-shrink-0" />
                {!sidebarCollapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* User strip — display only, logout moved to topbar dropdown */}
        <div className={`bg-sidebar-header px-4 py-3 flex items-center gap-2 ${
          sidebarCollapsed ? "justify-center px-2" : ""
        }`}>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[12px] flex-shrink-0">
            {userInitials}
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white leading-tight truncate">{userName}</p>
              <p className="text-[11px] text-ink-faint">Free plan</p>
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
        <header className="h-[62px] bg-white border-b border-border flex items-center justify-between px-8 sticky top-0 z-30">

          <div className="flex flex-col justify-center">
            <h1 className="text-[18px] font-black text-[#0D1220] tracking-tight leading-tight">
              {pageTitle}
            </h1>
            {pageSubtitle && (
              <p className="text-[12px] text-[#8A97B8] leading-tight">{pageSubtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search courses..."
                className="h-9 pl-9 pr-4 bg-surface border border-border rounded-full text-[13px] text-ink placeholder:text-grey-300 placeholder:font-normal focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-light transition-all w-48"
              />
            </div>

            {/* Bell */}
            <button className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-ink-muted hover:text-ink transition-colors">
              <Bell size={16} />
            </button>

            {/* Avatar dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((open) => !open)}
                className="flex items-center gap-1.5 hover:bg-surface rounded-full pr-1.5 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[12px]">
                  {userInitials}
                </div>
                <ChevronDown
                  size={14}
                  className={`text-ink-faint transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-2xl shadow-card-hover overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-[13px] font-bold text-ink truncate">{userName}</p>
                    {userEmail && (
                      <p className="text-[11px] text-ink-faint truncate">{userEmail}</p>
                    )}
                  </div>

                  <div className="py-1.5">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-ink hover:bg-surface transition-colors"
                    >
                      <User size={15} className="text-ink-faint" />
                      View Profile
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-ink hover:bg-surface transition-colors"
                    >
                      <Bell size={15} className="text-ink-faint" />
                      Notification Settings
                    </Link>
                  </div>

                  <div className="py-1.5 border-t border-border">
                    <button
                      onClick={requestLogout}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-error hover:bg-error-light w-full transition-colors"
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
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>

      {/* ── LOGOUT CONFIRMATION MODAL ── */}
      {logoutModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-card-hover">
            <h3 className="text-[17px] font-black text-ink mb-1">Confirm logout</h3>
            <p className="text-[13px] text-ink-muted mb-5">
              For your security, please re-enter your password to log out.
            </p>

            <label className="block text-[12px] font-semibold text-ink mb-1.5">
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
                className="w-full h-11 pl-3 pr-10 border border-grey-200 rounded-lg text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
              />
              <button
                type="button"
                onClick={() => setShowLogoutPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors"
              >
                {showLogoutPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {logoutError && (
              <p className="text-[12px] text-error mb-3">{logoutError}</p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setLogoutModalOpen(false)}
                disabled={logoutLoading}
                className="flex-1 py-2.5 rounded-full border border-border text-[13px] font-semibold text-ink hover:bg-grey-100 transition-all disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                disabled={logoutLoading}
                className="flex-1 py-2.5 rounded-full bg-error hover:opacity-90 text-white text-[13px] font-bold transition-all disabled:opacity-60"
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