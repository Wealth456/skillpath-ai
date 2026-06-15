"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen } from "lucide-react";

const QUICK_LINKS = [
  { label: "My Roadmap",       href: "/roadmap"  },
  { label: "PDF Summariser",   href: "/pdf"      },
  { label: "My Profile",       href: "/profile"  },
  { label: "Course Catalogue", href: "/courses"  },
];

export default function NotFoundPage() {
  const router = useRouter();

  const quickLinkPills = QUICK_LINKS.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      className="px-5 py-2.5 rounded-full border border-[#E4E8F5] bg-white text-[13px] font-semibold text-[#3D4A6B] hover:bg-[#E8EDFF] hover:border-[#1A3ADB] hover:text-[#1A3ADB] transition-all"
    >
      {link.label}
    </Link>
  ));

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FC] relative overflow-hidden">

      {/* Blobs */}
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ backgroundColor: "#E8EDFF", opacity: 0.7 }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ backgroundColor: "#FFF8E7", opacity: 0.85 }}
      />

      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-4 bg-white border-b border-[#E4E8F5]">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#F5A623" }}
          >
            <Image src="/logo.png" alt="SkillPath AI" width={22} height={22} className="object-contain" />
          </div>
          <span className="font-black text-[#0D1220] tracking-tight text-[15px]">
            SKILL<span style={{ color: "#F5A623" }}>PATH</span> AI
          </span>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A3ADB] text-white text-[13px] font-bold hover:bg-[#1228B0] transition-colors"
        >
          <LayoutDashboard size={14} />
          Go to dashboard
        </button>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 gap-8">

        {/* 404 */}
        <div className="flex items-center justify-center select-none" style={{ lineHeight: 1 }}>
          <span className="text-[180px] font-black leading-none" style={{ color: "#C5CFFF" }}>
            4
          </span>

          <div className="relative flex items-center justify-center">
            <span className="text-[200px] font-black leading-none" style={{ color: "#1A3ADB" }}>
              0
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-lg border-2 border-[#0D1220] bg-white flex items-center justify-center">
                <div className="w-10 h-10 border border-[#0D1220] relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 w-full origin-top-left border-t border-[#0D1220]"
                    style={{ transform: "rotate(45deg) scaleX(1.5)" }}
                  />
                  <div
                    className="absolute top-0 right-0 w-full origin-top-right border-t border-[#0D1220]"
                    style={{ transform: "rotate(-45deg) scaleX(1.5)" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <span className="text-[180px] font-black leading-none" style={{ color: "#C5CFFF" }}>
            4
          </span>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-3 text-center max-w-md">
          <h1 className="text-[28px] font-black text-[#0D1220] tracking-tight">
            Oops! This page doesn&apos;t exist.
          </h1>
          <p className="text-[14px] text-[#3D4A6B] leading-relaxed">
            Looks like you took a wrong turn on your learning path.
            <br />
            Don&apos;t worry — your roadmap is still on track. Let&apos;s get you back.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 px-7 py-3 rounded-full bg-[#1A3ADB] text-white text-[14px] font-bold hover:bg-[#1228B0] transition-colors"
          >
            <LayoutDashboard size={15} />
            Back to Dashboard
          </button>
          <button
            onClick={() => router.push("/courses")}
            className="flex items-center gap-2 px-7 py-3 rounded-full border-2 border-[#1A3ADB] text-[#1A3ADB] text-[14px] font-bold hover:bg-[#E8EDFF] transition-colors"
          >
            <BookOpen size={15} />
            Browse Courses
          </button>
        </div>

        {/* Quick links */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-[13px] text-[#8A97B8]">Or try one of these:</p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {quickLinkPills}
          </div>
        </div>

        {/* Support */}
       
<p className="text-[12px] text-[#8A97B8]">
  If you believe this is an error, contact{" "}
  <span
    onClick={() => window.location.href = "mailto:support@skillpath.ai"}
    className="text-[#1A3ADB] font-semibold hover:underline cursor-pointer"
  >
    support@skillpath.ai
  </span>
</p>

      </main>

      {/* Footer */}
      <footer
        className="relative z-10 py-4 text-center"
        style={{ backgroundColor: "#0D1B4B" }}
      >
        <p className="text-[12px] text-white/60">
          © 2025 SkillPath AI · Built with ❤️ for Africa
        </p>
      </footer>

    </div>
  );
}