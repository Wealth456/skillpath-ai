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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  const [userName, setUserName]       = useState("Learner");
  const [userInitials, setUserInitials] = useState("L");

  useEffect(() => {
    const name = localStorage.getItem("skillpath_name") || "Learner";
    setUserName(name);
    const parts    = name.trim().split(" ");
    const initials = parts.map((p: string) => p[0]).join("").slice(0, 2).toUpperCase();
    setUserInitials(initials);
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
        <header className="h-[62px] bg-white border-b border-border flex items-center px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3 ml-auto">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                type="text"
                placeholder="Search courses..."
                className="h-9 pl-9 pr-4 bg-surface border border-border rounded-full text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-light transition-all w-48"
              />
            </div>
            <button className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-ink-muted hover:text-ink transition-colors relative">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary border border-white" />
            </button>
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