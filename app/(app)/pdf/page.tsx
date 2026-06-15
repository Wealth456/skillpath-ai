"use client";

import { useState, useRef } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  ChevronRight,
  Copy,
  Download,
  Share2,
  ClipboardList,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type UploadStatus = "done" | "processing" | "error";
type ActiveTab    = "summary" | "keypoints" | "glossary" | "quizme";

interface RecentFile {
  id: string;
  name: string;
  size: string;
  time: string;
  status: UploadStatus;
}

interface SummarySection {
  emoji: string;
  heading: string;
  type: "paragraph" | "bullets" | "code";
  content: string;
}

// ─────────────────────────────────────────────────────────────
// STATIC MOCK DATA
// Replace with real Anthropic PDF summariser API call
// when the backend sends the endpoint
// ─────────────────────────────────────────────────────────────

const RECENT_FILES: RecentFile[] = [
  { id: "1", name: "Python_Textbook_Ch4.pdf",   size: "2.4 MB", time: "5 min ago",  status: "done"       },
  { id: "2", name: "Data_Structures_Notes.pdf", size: "1.8 MB", time: "Yesterday",  status: "done"       },
  { id: "3", name: "ML_Research_Paper.pdf",     size: "3.1 MB", time: "Just now",   status: "processing" },
  { id: "4", name: "Web_Dev_Slides.pdf",        size: "890 kB", time: "2 days ago", status: "done"       },
  { id: "5", name: "Algorithms_Guide.pdf",      size: "2.0 MB", time: "3 days ago", status: "done"       },
];

const SUMMARY_SECTIONS: SummarySection[] = [
  {
    emoji: "📖",
    heading: "Chapter Overview",
    type: "paragraph",
    content:
      "Chapter 4 covers Python functions — reusable blocks of code that perform a specific task. Functions improve code organisation and reduce repetition.",
  },
  {
    emoji: "📌",
    heading: "Key Concepts",
    type: "bullets",
    content: [
      "def keyword — used to define a function",
      "Parameters — inputs a function accepts",
      "Return values — output produced",
      "Scope — where variables are accessible",
    ].join("\n"),
  },
  {
    emoji: "💻",
    heading: "Important Syntax",
    type: "code",
    content:
      "def greet(name):\n    return f'Hello, {name}!'\nresult = greet('Amaka')  # → Hello, Amaka!",
  },
  {
    emoji: "⚠️",
    heading: "Common Mistakes",
    type: "paragraph",
    content:
      "Forgetting the return statement, confusing local vs global scope, and not handling default parameter values correctly.",
  },
];

const KEY_POINTS_SECTIONS: SummarySection[] = [
  {
    emoji: "✅",
    heading: "Top Takeaways",
    type: "bullets",
    content: [
      "Functions are defined with the def keyword",
      "Use return to send a value back to the caller",
      "Arguments are passed inside parentheses",
      "Default parameter values simplify function calls",
    ].join("\n"),
  },
];

const GLOSSARY_SECTIONS: SummarySection[] = [
  {
    emoji: "📚",
    heading: "Glossary",
    type: "bullets",
    content: [
      "Function — a named block of reusable code",
      "Parameter — a variable listed in the function definition",
      "Argument — the actual value passed to the function",
      "Return — keyword that exits a function and returns a value",
      "Scope — the region of code where a variable is accessible",
    ].join("\n"),
  },
];

// Tab → sections mapping
const TAB_CONTENT: Record<ActiveTab, SummarySection[]> = {
  summary:   SUMMARY_SECTIONS,
  keypoints: KEY_POINTS_SECTIONS,
  glossary:  GLOSSARY_SECTIONS,
  quizme:    [], // navigates away
};

// ─────────────────────────────────────────────────────────────
// SECTION RENDERER
// ─────────────────────────────────────────────────────────────

function SummaryBlock({ section }: { section: SummarySection }) {
  if (section.type === "paragraph") {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-[13px] font-bold text-[#0D1220]">
          {section.emoji} {section.heading}
        </p>
        <p className="text-[13px] text-[#3D4A6B] leading-relaxed">
          {section.content}
        </p>
      </div>
    );
  }

  if (section.type === "bullets") {
    const lines = section.content.split("\n");
    const bulletItems = lines.map((line, i) => (
      <p key={i} className="text-[13px] text-[#3D4A6B] leading-relaxed">
        • {line}
      </p>
    ));
    return (
      <div className="flex flex-col gap-1">
        <p className="text-[13px] font-bold text-[#0D1220]">
          {section.emoji} {section.heading}
        </p>
        <div className="flex flex-col gap-0.5 pl-1">{bulletItems}</div>
      </div>
    );
  }

  // code
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[13px] font-bold text-[#0D1220]">
        {section.emoji} {section.heading}
      </p>
      <pre
        className="rounded-xl px-4 py-3 text-[12px] font-mono text-white leading-relaxed overflow-x-auto"
        style={{ backgroundColor: "#0D1117" }}
      >
        {section.content}
      </pre>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RECENT FILE ROW
// ─────────────────────────────────────────────────────────────

function FileRow({
  file,
  isFirst,
  onView,
}: {
  file: RecentFile;
  isFirst: boolean;
  onView: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-2xl border border-[#E4E8F5] bg-white">
      {/* PDF icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor:
            file.status === "processing" ? "#FFF8E7" : "#E8EDFF",
        }}
      >
        <FileText
          size={18}
          color={file.status === "processing" ? "#F5A623" : "#1A3ADB"}
        />
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#0D1220] truncate">
          {file.name}
        </p>
        <p className="text-[11px] text-[#8A97B8]">
          {file.size} · {file.time}
        </p>
      </div>

      {/* Status + view */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {file.status === "done" && (
          <span className="px-3 py-1 rounded-full border border-[#E4E8F5] text-[11px] font-semibold text-[#3D4A6B]">
            Done
          </span>
        )}
        {file.status === "processing" && (
          <span
            className="px-3 py-1 rounded-full border text-[11px] font-semibold"
            style={{ borderColor: "#F5A623", color: "#F5A623" }}
          >
            Processing...
          </span>
        )}
        {isFirst && file.status === "done" && (
          <button
            onClick={() => onView(file.id)}
            className="flex items-center gap-1 text-[12px] font-semibold text-[#1A3ADB] hover:underline"
          >
            View <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function PDFPage() {
  const [activeTab, setActiveTab]   = useState<ActiveTab>("summary");
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied]         = useState(false);
  const fileInputRef                = useRef<HTMLInputElement>(null);

  // Active file — the first in the list (Python_Textbook_Ch4.pdf)
  const activeFile = RECENT_FILES[0];

  // ── Drag handlers ──
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }
  function handleDragLeave() { setIsDragging(false); }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    // When real API is ready: handle e.dataTransfer.files[0]
  }
  function handleBrowse() { fileInputRef.current?.click(); }

  // ── Copy summary ──
  function handleCopy() {
    const text = SUMMARY_SECTIONS.map(
      (s) => `${s.emoji} ${s.heading}\n${s.content}`
    ).join("\n\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Tab sections ──
  const sections = TAB_CONTENT[activeTab];

  // Build section blocks outside JSX — Rule 10
  const sectionBlocks = sections.map((section, i) => (
    <SummaryBlock key={i} section={section} />
  ));

  // Build recent file rows outside JSX — Rule 10
  const fileRows = RECENT_FILES.map((file, i) => (
    <FileRow
      key={file.id}
      file={file}
      isFirst={i === 0}
      onView={() => {}}
    />
  ));

  // Build tab buttons outside JSX — Rule 10
  const tabs: { key: ActiveTab; label: string }[] = [
    { key: "summary",   label: "Summary"    },
    { key: "keypoints", label: "Key Points" },
    { key: "glossary",  label: "Glossary"   },
    { key: "quizme",    label: "Quiz me"    },
  ];

  const tabButtons = tabs.map((tab) => (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key)}
      className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-colors ${
        activeTab === tab.key
          ? "bg-[#1A3ADB] text-white"
          : "text-[#3D4A6B] hover:bg-[#E8EDFF]"
      }`}
    >
      {tab.label}
    </button>
  ));

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex gap-6 min-h-screen bg-[#F7F8FC]">

      {/* ══════════════════════════════
          LEFT COLUMN — upload + history
      ══════════════════════════════ */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">

        {/* Upload zone */}
        <div>
          <h2 className="text-[15px] font-bold text-[#0D1220] mb-0.5">Upload PDF</h2>
          <p className="text-[12px] text-[#8A97B8] mb-3">
            Supports textbooks, articles, lecture notes
          </p>

          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-10 px-6 transition-colors cursor-pointer ${
              isDragging
                ? "border-[#1A3ADB] bg-[#E8EDFF]"
                : "border-[#C8D0E7] bg-white hover:border-[#1A3ADB]/50 hover:bg-[#F7F8FF]"
            }`}
            onClick={handleBrowse}
          >
            <Upload size={32} color="#8A97B8" className="mb-3" />
            <p className="text-[15px] font-bold text-[#0D1220] mb-1">
              Drag &amp; drop your PDF here
            </p>
            <p className="text-[12px] text-[#8A97B8] mb-4">
              or click to browse — max 20MB
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); handleBrowse(); }}
              className="px-5 py-2 rounded-xl bg-[#1A3ADB] text-white text-[13px] font-bold hover:bg-[#1228B0] transition-colors"
            >
              Browse files
            </button>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={() => {
                // When real API ready: handle fileInputRef.current?.files?.[0]
              }}
            />
          </div>
        </div>

        {/* Recent uploads */}
        <div>
          <h2 className="text-[15px] font-bold text-[#0D1220] mb-3">
            Recent Uploads
          </h2>
          <div className="flex flex-col gap-3">
            {fileRows}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
          RIGHT COLUMN — summary panel
      ══════════════════════════════ */}
      <div className="w-[520px] flex-shrink-0 flex flex-col bg-white rounded-2xl border border-[#E4E8F5] overflow-hidden">

        {/* File header */}
        <div className="px-5 pt-5 pb-4 border-b border-[#E4E8F5]">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <FileText size={16} color="#1A3ADB" />
              <span className="text-[14px] font-bold text-[#1A3ADB]">
                {activeFile.name}
              </span>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A3ADB] text-white text-[12px] font-bold">
              <CheckCircle2 size={12} />
              Done
            </span>
          </div>
          <p className="text-[11px] text-[#8A97B8]">
            42 pages · Summarised in 8 seconds · Chapter 4
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 py-3 border-b border-[#E4E8F5]">
          {tabButtons}
        </div>

        {/* AI banner */}
        <div
          className="mx-4 mt-4 mb-3 rounded-xl px-4 py-2.5 flex items-center gap-3"
          style={{ backgroundColor: "#0D1B4B" }}
        >
          <span className="w-6 h-6 rounded-md bg-[#1A3ADB] flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
            AI
          </span>
          <p className="text-[12px] text-white/80 font-medium">
            AI-generated summary · Python Textbook Chapter 4
          </p>
        </div>

        {/* Summary content — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col gap-5">
          {activeTab === "quizme" ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <ClipboardList size={32} color="#1A3ADB" />
              <p className="text-[14px] font-bold text-[#0D1220]">
                Quiz coming soon
              </p>
              <p className="text-[12px] text-[#8A97B8] text-center">
                AI-generated quiz based on this PDF will appear here.
              </p>
            </div>
          ) : sectionBlocks.length > 0 ? (
            sectionBlocks
          ) : (
            <p className="text-[13px] text-[#8A97B8] py-8 text-center">
              No content yet.
            </p>
          )}
        </div>

        {/* Bottom action bar */}
        <div className="border-t border-[#E4E8F5] px-4 py-3 flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#E4E8F5] text-[#3D4A6B] text-[12px] font-semibold hover:bg-[#F7F8FC] transition-colors"
          >
            <Copy size={13} />
            {copied ? "Copied!" : "Copy summary"}
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#E4E8F5] text-[#3D4A6B] text-[12px] font-semibold hover:bg-[#F7F8FC] transition-colors">
            <Download size={13} />
            Download
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#E4E8F5] text-[#3D4A6B] text-[12px] font-semibold hover:bg-[#F7F8FC] transition-colors">
            <Share2 size={13} />
            Share
          </button>
          <button
            onClick={() => setActiveTab("quizme")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-[12px] font-bold transition-colors"
            style={{ backgroundColor: "#0D1B4B" }}
          >
            <ClipboardList size={13} />
            Quiz me
          </button>
        </div>
      </div>
    </div>
  );
}