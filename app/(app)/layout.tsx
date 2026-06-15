"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

const navItems = [
  { label: "Dashboard",  href: "/dashboard", icon: LayoutDashboard },
  { label: "My Roadmap", href: "/roadmap",   icon: Map },
  { label: "Courses",    href: "/courses",   icon: BookOpen },
  { label: "PDF Tool",   href: "/pdf",       icon: FileText },
  { label: "Profile",    href: "/profile",   icon: User },
];

// Default titles for each route — used as fallback before the page
// overrides them via sessionStorage
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  const [userName, setUserName]         = useState("Learner");
  const [userInitials, setUserInitials] = useState("L");
  const [pageTitle, setPageTitle]       = useState("");
  const [pageSubtitle, setPageSubtitle] = useState("");

  // Read user name from localStorage on mount
  useEffect(() => {
    const name     = localStorage.getItem("skillpath_name") || "Learner";
    setUserName(name);
    const parts    = name.trim().split(" ");
    const initials = parts.map((p: string) => p[0]).join("").slice(0, 2).toUpperCase();
    setUserInitials(initials);
  }, []);

  // Every time the route changes, read the page title from sessionStorage.
  // Pages set "skillpath_page_title" and "skillpath_page_subtitle" in their
  // own useEffect. We fall back to getDefaultMeta while the page loads.
  useEffect(() => {
    // Small timeout lets the page's useEffect run first and write to sessionStorage
    const timer = setTimeout(() => {
      const storedTitle    = sessionStorage.getItem("skillpath_page_title");
      const storedSubtitle = sessionStorage.getItem("skillpath_page_subtitle");
      const defaults       = getDefaultMeta(pathname);
      setPageTitle(storedTitle       || defaults.title);
      setPageSubtitle(storedSubtitle || defaults.subtitle);
    }, 80);

    // Also set defaults immediately so we don't show empty topbar
    const defaults = getDefaultMeta(pathname);
    setPageTitle(defaults.title);
    setPageSubtitle(defaults.subtitle);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Listen for a custom "skilpath-title-update" event that pages dispatch
  // when they have dynamic data (e.g. course name from API)
  useEffect(() => {
    function handleTitleUpdate(e: Event) {
      const custom = e as CustomEvent<{ title: string; subtitle: string }>;
      setPageTitle(custom.detail.title);
      setPageSubtitle(custom.detail.subtitle);
    }
    window.addEventListener("skillpath-title-update", handleTitleUpdate);
    return () => window.removeEventListener("skillpath-title-update", handleTitleUpdate);
  }, []);

  function handleLogout() {
    localStorage.removeItem("skillpath_token");
    localStorage.removeItem("skillpath_name");
    localStorage.removeItem("skillpath_roadmap");
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-surface">

      {/* ── SIDEBAR ── */}
      <aside className="w-[240px] min-h-screen bg-sidebar flex flex-col fixed top-0 left-0 z-40">

        {/* Logo */}
        <div className="bg-sidebar-header px-5 py-4 flex items-center gap-2">
          <div style={{ backgroundColor: "#F5A623" }} className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            <Image src="/logo.png" alt="SkillPath AI" width={24} height={24} className="object-contain" />
          </div>
          <span className="font-black text-white tracking-tight text-[14px] whitespace-nowrap">
            SKILL<span style={{ color: "#F5A623" }}>PATH</span> AI
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon     = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-[14px] font-semibold ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-ink-faint hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User strip */}
        <div className="bg-sidebar-header px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[12px]">
              {userInitials}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white leading-tight">{userName}</p>
              <p className="text-[11px] text-ink-faint">Free plan</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-ink-faint hover:text-white transition-colors"
            title="Log out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="ml-[240px] flex-1 flex flex-col min-h-screen">

        {/* Topbar */}
        <header className="h-[62px] bg-white border-b border-border flex items-center justify-between px-8 sticky top-0 z-30">

          {/* LEFT — dynamic page title + subtitle */}
          <div className="flex flex-col justify-center">
            <h1 className="text-[18px] font-black text-[#0D1220] tracking-tight leading-tight">
              {pageTitle}
            </h1>
            {pageSubtitle && (
              <p className="text-[12px] text-[#8A97B8] leading-tight">{pageSubtitle}</p>
            )}
          </div>

          {/* RIGHT — search + filter icon + avatar */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                type="text"
                placeholder="Search courses..."
                className="h-9 pl-9 pr-4 bg-surface border border-border rounded-full text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-light transition-all w-48"
              />
            </div>
            {/* Filter/bell icon button */}
            <button className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-ink-muted hover:text-ink transition-colors">
              <Bell size={16} />
            </button>
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[12px]">
              {userInitials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}