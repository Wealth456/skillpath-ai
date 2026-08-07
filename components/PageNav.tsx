"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function PageNav() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 mb-5">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 bg-white border border-[#E4E8F5] text-[#3D4A6B] text-[13px] font-semibold px-4 py-2 rounded-full shadow-sm hover:bg-[#F7F8FC] hover:border-[#1A3ADB]/30 hover:text-[#1A3ADB] transition-all"
      >
        <ArrowLeft size={15} />
        Back
      </button>

      <button
        onClick={() => router.forward()}
        className="flex items-center gap-1.5 bg-white border border-[#E4E8F5] text-[#3D4A6B] text-[13px] font-semibold px-4 py-2 rounded-full shadow-sm hover:bg-[#F7F8FC] hover:border-[#1A3ADB]/30 hover:text-[#1A3ADB] transition-all"
      >
        Next
        <ArrowRight size={15} />
      </button>
    </div>
  );
}