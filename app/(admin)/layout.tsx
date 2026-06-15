"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  Settings,
} from "lucide-react";

const adminNav = [
  { label: "Overview",     href: "/admin",           icon: LayoutDashboard },
  { label: "Users",        href: "/admin/users",      icon: Users           },
  { label: "Courses",      href: "/admin/courses",    icon: BookOpen        },
  { label: "Quiz Builder", href: "/admin/quiz",       icon: ClipboardList   },
  { label: "Settings",     href: "/admin/settings",   icon: Settings        },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [adminName] = useState("Admin User");

  return (
    <div className="flex min-h-screen bg-[#F7F8FC]">

      {/* ── SIDEBAR ── */}
      <aside className="w-[220px] min-h-screen bg-white border-r border-[#E4E8F5] flex flex-col fixed top-0 left-0 z-40">

        {/* Logo */}
        <div className="px-5 py-4 border-b border-[#E4E8F5] flex items-center gap-2">
          <div style={{ backgroundColor: "#F5A623" }} className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            <Image src="/logo.png" alt="SkillPath AI" width={20} height={20} className="object-contain" />
          </div>
          <div>
            <p className="font-black text-[#0D1220] text-[13px] leading-tight tracking-tight">
              SKILL<span style={{ color: "#F5A623" }}>PATH</span> AI
            </p>
            <p className="text-[10px] font-bold text-[#1A3ADB]">AI Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {adminNav.map((item) => {
            const Icon     = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
                  isActive
                    ? "bg-[#E8EDFF] text-[#1A3ADB] border-l-4 border-[#1A3ADB]"
                    : "text-[#3D4A6B] hover:bg-[#F7F8FC] hover:text-[#0D1220]"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Admin user strip */}
        <div className="border-t border-[#E4E8F5] px-4 py-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1A3ADB] flex items-center justify-center text-white font-bold text-[12px]">
            AD
          </div>
          <div>
            <p className="text-[12px] font-bold text-[#0D1220] leading-tight">{adminName}</p>
            <p className="text-[10px] text-[#8A97B8]">Superadmin</p>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="ml-[220px] flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}