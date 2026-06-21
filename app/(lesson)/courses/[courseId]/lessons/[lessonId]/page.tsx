"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  BookOpen,
  Link as LinkIcon,
  Plus,
  ClipboardList,
} from "lucide-react";
import { getCourse, markLessonComplete } from "@/lib/api/learning";
import type { Course, CourseModule, Lesson } from "@/lib/api/learning";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

// Explicit interface fixes the unknown[] ReactNode error
interface ContentBlock {
  type: "heading" | "paragraph" | "code" | "callout";
  text: string;
}

// Explicit interface fixes the resources shorthand error
interface ResourceLink {
  label: string;
  href: string;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function cap(str: string): string {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

function parseContent(raw: string): ContentBlock[] {
  const lines = raw.split("\n");
  const blocks: ContentBlock[] = [];
  let inCode = false;
  let codeLines: string[] = [];

  lines.forEach((line) => {
    if (line.startsWith("```")) {
      if (inCode) {
        blocks.push({ type: "code", text: codeLines.join("\n") });
        codeLines = [];
        inCode = false;
      } else {
        inCode = true;
      }
      return;
    }
    if (inCode) { codeLines.push(line); return; }
    if (line.startsWith("# "))  { blocks.push({ type: "heading",   text: line.slice(2) }); return; }
    if (line.startsWith("💡"))  { blocks.push({ type: "callout",   text: line });          return; }
    if (line.trim())             { blocks.push({ type: "paragraph", text: line }); }
  });

  if (blocks.length === 0 && raw.trim()) {
    blocks.push({ type: "paragraph", text: raw });
  }

  return blocks;
}

// ─────────────────────────────────────────────────────────────
// CODE BLOCK
// ─────────────────────────────────────────────────────────────

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function highlight(raw: string): string {
    return raw
      .replace(/(#[^\n]*)/g, '<span style="color:#4EC9B0">$1</span>')
      .replace(/(['"])(.*?)\1/g, '<span style="color:#F5A623">$1$2$1</span>')
      .replace(
        /\b(for|while|in|if|else|elif|def|return|import|from|print|True|False|None)\b/g,
        '<span style="color:#569CD6">$1</span>'
      );
  }

  return (
    <div className="relative rounded-xl overflow-hidden my-4">
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ backgroundColor: "#1E2433" }}
      >
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#F5A623" }} />
          <div className="w-3 h-3 rounded-full bg-[#10B981]" />
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-white/70 hover:text-white transition-colors"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied!" : "Copy code"}
        </button>
      </div>
      <pre
        className="px-5 py-4 text-[13px] leading-relaxed overflow-x-auto font-mono text-white"
        style={{ backgroundColor: "#0D1117" }}
        dangerouslySetInnerHTML={{ __html: highlight(code) }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CONTENT RENDERER
// Explicit return type React.ReactElement[] fixes unknown[] error
// ─────────────────────────────────────────────────────────────

function LessonContent({ content }: { content: string }) {
  const blocks = parseContent(content);

  const elements: React.ReactElement[] = blocks.map((block, i) => {
    if (block.type === "heading") {
      return (
        <h3 key={i} className="text-[16px] font-bold text-[#0D1220] mt-6 mb-2">
          {block.text}
        </h3>
      );
    }
    if (block.type === "code") {
      return <CodeBlock key={i} code={block.text} />;
    }
    if (block.type === "callout") {
      return (
        <div
          key={i}
          className="rounded-xl px-5 py-4 my-4 border border-[#1A3ADB]/20"
          style={{ backgroundColor: "#EEF2FF" }}
        >
          <p className="text-[14px] font-semibold text-[#1A3ADB] mb-1">
            💡 Try it yourself!
          </p>
          <p className="text-[13px] text-[#3D4A6B]">
            {block.text.replace("💡", "").trim()}
          </p>
        </div>
      );
    }
    return (
      <p key={i} className="text-[14px] text-[#3D4A6B] leading-relaxed mb-3">
        {block.text}
      </p>
    );
  });

  return <div className="flex flex-col">{elements}</div>;
}

// ─────────────────────────────────────────────────────────────
// LESSON SIDEBAR ITEM
// ─────────────────────────────────────────────────────────────

interface LessonItemProps {
  lesson: Lesson;
  moduleIndex: number;
  lessonIndex: number;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

function LessonItem({
  lesson,
  moduleIndex,
  lessonIndex,
  isActive,
  isCompleted,
  onClick,
}: LessonItemProps) {
  const label = `${moduleIndex}.${lessonIndex}`;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
        isActive ? "bg-[#E8EDFF] border border-[#1A3ADB]" : "hover:bg-[#F7F8FC]"
      }`}
    >
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isActive ? "bg-[#1A3ADB]" : isCompleted ? "bg-[#10B981]" : "bg-[#E5E9F5]"
        }`}
      >
        <BookOpen size={13} color={isActive || isCompleted ? "#fff" : "#8A97B8"} />
      </div>
      <div>
        <p className={`text-[12px] font-bold leading-tight ${isActive ? "text-[#1A3ADB]" : "text-[#8A97B8]"}`}>
          {label}
        </p>
        <p className={`text-[13px] font-semibold leading-tight mt-0.5 ${isActive ? "text-[#1A3ADB]" : "text-[#3D4A6B]"}`}>
          {lesson.title}
        </p>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function LessonPage() {
  const params   = useParams();
  const router   = useRouter();

  const courseId = typeof params.courseId === "string" ? params.courseId : "";
  const lessonId = typeof params.lessonId === "string" ? params.lessonId : "";

  const [course, setCourse]                         = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson]           = useState<Lesson | null>(null);
  // Explicit type fixes the 'order' and 'title' does not exist on 'never' error
  const [currentModule, setCurrentModule]           = useState<CourseModule | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [marking, setMarking]                       = useState(false);
  const [loading, setLoading]                       = useState(true);
  const [error, setError]                           = useState("");
  const [notes, setNotes]                           = useState<string[]>([]);
  const [noteInput, setNoteInput]                   = useState("");
  const [addingNote, setAddingNote]                 = useState(false);
  // New state — controls the "Take Quiz" prompt modal shown after marking complete
  const [showQuizPrompt, setShowQuizPrompt]         = useState(false);
  const noteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!courseId || !lessonId) return;

    async function load() {
      try {
        setLoading(true);
        const response        = await getCourse(courseId);
        const fetched: Course = response.data.data.course;
        setCourse(fetched);

        // Locate the lesson and its parent module
        // Typed explicitly to avoid 'never' inference
        let foundLesson: Lesson | null       = null;
        let foundModule: CourseModule | null = null;

        fetched.modules.forEach((mod: CourseModule) => {
          mod.lessons.forEach((les: Lesson) => {
            if (les._id === lessonId) {
              foundLesson = les;
              foundModule = mod;
            }
          });
        });

        setCurrentLesson(foundLesson);
        setCurrentModule(foundModule);

        if (foundModule && foundLesson) {
          // foundModule is CourseModule here — cast to satisfy TS
          const mod = foundModule as CourseModule;
          const les = foundLesson as Lesson;
          window.dispatchEvent(
            new CustomEvent("skillpath-title-update", {
              detail: {
                title:    fetched.title,
                subtitle: `Module ${mod.order} · ${les.title}`,
              },
            })
          );
        }

        const saved = localStorage.getItem(`skillpath_completed_${courseId}`);
        if (saved) setCompletedLessonIds(JSON.parse(saved));

        const savedNotes = localStorage.getItem(`skillpath_notes_${lessonId}`);
        if (savedNotes) setNotes(JSON.parse(savedNotes));

      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load lesson";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [courseId, lessonId]);

  // ── Mark lesson complete, then show the quiz prompt instead of auto-navigating ──
  async function handleMarkComplete() {
    if (!currentLesson || marking) return;
    try {
      setMarking(true);
      await markLessonComplete({ courseId, lessonId });
      const updated = [...completedLessonIds, lessonId];
      setCompletedLessonIds(updated);
      localStorage.setItem(`skillpath_completed_${courseId}`, JSON.stringify(updated));

      // Show the "Take Quiz" modal instead of jumping straight to next lesson
      setShowQuizPrompt(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to mark complete";
      setError(message);
    } finally {
      setMarking(false);
    }
  }

  // ── Navigate to this lesson's quiz ──
  function handleTakeQuiz() {
    setShowQuizPrompt(false);
    router.push(`/courses/${courseId}/quiz/${lessonId}`);
  }

  // ── Skip the quiz and go straight to the next lesson ──
  function handleSkipQuiz() {
    setShowQuizPrompt(false);
    navigateLesson("next");
  }

  function navigateLesson(direction: "prev" | "next") {
    if (!course || !currentLesson) return;
    const allLessons: Lesson[] = [];
    course.modules.forEach((mod) => mod.lessons.forEach((l) => allLessons.push(l)));
    const idx    = allLessons.findIndex((l) => l._id === lessonId);
    const target = direction === "next" ? idx + 1 : idx - 1;
    if (target < 0 || target >= allLessons.length) return;
    router.push(`/courses/${courseId}/lessons/${allLessons[target]._id}`);
  }

  function handleAddNote() {
    if (!noteInput.trim()) return;
    const updated = [...notes, noteInput.trim()];
    setNotes(updated);
    localStorage.setItem(`skillpath_notes_${lessonId}`, JSON.stringify(updated));
    setNoteInput("");
    setAddingNote(false);
  }

  function handleSidebarNav(targetLessonId: string) {
    router.push(`/courses/${courseId}/lessons/${targetLessonId}`);
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-[#1A3ADB] border-t-transparent animate-spin" />
      </div>
    );
  }

  // ── Error / not found ──
  if (error || !course || !currentLesson || !currentModule) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="rounded-xl bg-[#FEE2E2] px-5 py-4 text-sm text-[#EF4444]">
          {error || "Lesson not found."}
        </div>
      </div>
    );
  }

  // ── Derived values (safe — null checks passed above) ──
  const allLessons: Lesson[] = [];
  course.modules.forEach((mod) => mod.lessons.forEach((l) => allLessons.push(l)));

  const currentIndex          = allLessons.findIndex((l) => l._id === lessonId);
  const prevLesson            = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson            = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const moduleIndex           = course.modules.findIndex((m) => m._id === currentModule._id) + 1;
  const moduleLessonIds       = currentModule.lessons.map((l) => l._id);
  const completedInModule     = moduleLessonIds.filter((id) => completedLessonIds.includes(id)).length;
  const moduleProgressPercent = Math.round((completedInModule / currentModule.lessons.length) * 100);
  const totalLessons          = allLessons.length;
  const courseProgressPercent = totalLessons > 0
    ? Math.round((completedLessonIds.length / totalLessons) * 100)
    : 0;

  // ── Build sidebar items (Rule 10 — outside JSX) ──
  const sidebarItems: React.ReactElement[] = currentModule.lessons.map((lesson, idx) => (
    <LessonItem
      key={lesson._id}
      lesson={lesson}
      moduleIndex={moduleIndex}
      lessonIndex={idx + 1}
      isActive={lesson._id === lessonId}
      isCompleted={completedLessonIds.includes(lesson._id)}
      onClick={() => handleSidebarNav(lesson._id)}
    />
  ));

  // ── Build note items (Rule 10 — outside JSX) ──
  const noteItems: React.ReactElement[] = notes.map(
    (note: string, i: number): React.ReactElement => (
      <p
        key={i}
        className="text-[13px] text-[#3D4A6B] py-2 border-b border-[#E4E8F5] last:border-0"
      >
        {note}
      </p>
    )
  );

  // ── Build resource links (Rule 10 — outside JSX) ──
  // Typed as ResourceLink[] to fix the shorthand inference error
  const resources: ResourceLink[] = [
    { label: cap(course.category) + " Docs",           href: "#" },
    { label: cap(course.category) + " Cheatsheet PDF", href: "#" },
    { label: "Practice Exercises",                      href: "#" },
  ];

  const resourceItems: React.ReactElement[] = resources.map(
    (res: ResourceLink, i: number): React.ReactElement => (
      <button
        key={i}
        onClick={() => window.open(res.href, "_blank")}
        className="flex items-center gap-2 text-[13px] text-[#1A3ADB] font-medium hover:underline py-1.5 w-full text-left"
      >
        <LinkIcon size={13} />
        {res.label}
      </button>
    )
  );

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── TOP NAVBAR ── */}
      <nav
        className="flex items-center justify-between px-6 py-3 sticky top-0 z-50"
        style={{ backgroundColor: "#0D1B4B" }}
      >
        <button
          onClick={() => router.push(`/courses/${courseId}`)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/25 text-white text-[13px] font-semibold hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={15} />
          {course.title}
        </button>

        <p className="text-white font-semibold text-[14px] absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
          Module {currentModule.order} · {currentLesson.title}
        </p>

        <button
          onClick={handleMarkComplete}
          disabled={marking || completedLessonIds.includes(lessonId)}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-bold transition-colors ${
            completedLessonIds.includes(lessonId)
              ? "bg-[#10B981] text-white cursor-default"
              : "bg-[#1A3ADB] text-white hover:bg-[#1228B0]"
          }`}
        >
          {marking ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : completedLessonIds.includes(lessonId) ? (
            <>
              <Check size={14} /> Completed
            </>
          ) : (
            <>
              Mark complete <ChevronRight size={14} />
            </>
          )}
        </button>
      </nav>

      {/* ── PROGRESS BAR ── */}
      <div className="h-1 bg-[#E5E9F5] w-full">
        <div
          className="h-full bg-[#1A3ADB] transition-all duration-500"
          style={{ width: `${courseProgressPercent}%` }}
        />
      </div>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar */}
        <aside className="w-[240px] flex-shrink-0 border-r border-[#E4E8F5] flex flex-col overflow-y-auto">
          <div className="px-4 py-4 border-b border-[#E4E8F5]">
            <p className="text-[13px] font-black text-[#0D1220]">
              Module {moduleIndex}: {currentModule.title}
            </p>
          </div>
          <div className="flex-1 px-3 py-3 flex flex-col gap-1">
            {sidebarItems}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-10 py-8 pb-24">
          <h2 className="text-[22px] font-black text-[#0D1220] mb-1">
            {currentLesson.title}
          </h2>
          <p className="text-[13px] text-[#8A97B8] mb-6">
            Estimated time: {currentLesson.estimatedMinutes} min
            <span className="mx-2">·</span>
            {cap(course.level)}
          </p>
          <LessonContent content={currentLesson.content} />
        </main>

        {/* Right panel */}
        <aside className="w-[280px] flex-shrink-0 border-l border-[#E4E8F5] flex flex-col overflow-y-auto px-5 py-6 gap-6">

          {/* Quick Notes */}
          <div>
            <h4 className="text-[14px] font-bold text-[#0D1220] mb-3">Quick Notes</h4>
            <div className="mb-3">
              {notes.length > 0 ? noteItems : (
                <p className="text-[12px] text-[#8A97B8]">No notes yet.</p>
              )}
            </div>
            {addingNote ? (
              <div className="flex flex-col gap-2">
                <input
                  ref={noteRef}
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                  placeholder="Type a note..."
                  className="w-full px-3 py-2 border border-[#E4E8F5] rounded-lg text-[13px] text-[#0D1220] placeholder-[#8A97B8] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddNote}
                    className="flex-1 py-1.5 rounded-lg bg-[#1A3ADB] text-white text-[12px] font-semibold hover:bg-[#1228B0] transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setAddingNote(false); setNoteInput(""); }}
                    className="flex-1 py-1.5 rounded-lg border border-[#E4E8F5] text-[#3D4A6B] text-[12px] font-semibold hover:bg-[#F7F8FC] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingNote(true)}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1A3ADB] hover:underline"
              >
                <Plus size={14} />
                Add note
              </button>
            )}
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-[14px] font-bold text-[#0D1220] mb-2">Resources</h4>
            <div className="flex flex-col">{resourceItems}</div>
          </div>

          {/* Your Progress */}
          <div>
            <h4 className="text-[14px] font-bold text-[#0D1220] mb-3">Your Progress</h4>
            <div className="w-full h-2 bg-[#E5E9F5] rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-[#1A3ADB] rounded-full transition-all duration-500"
                style={{ width: `${moduleProgressPercent}%` }}
              />
            </div>
            <p className="text-[12px] text-[#8A97B8]">
              {completedInModule} of {currentModule.lessons.length} lessons done in Module {moduleIndex}
            </p>
          </div>

        </aside>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E4E8F5] px-10 py-4 flex items-center justify-between z-40">
        {prevLesson ? (
          <button
            onClick={() => navigateLesson("prev")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E4E8F5] text-[#3D4A6B] text-[13px] font-semibold hover:bg-[#F7F8FC] transition-colors"
          >
            <ChevronLeft size={14} />
            Prev: {prevLesson.title}
          </button>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <button
            onClick={() => navigateLesson("next")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A3ADB] text-white text-[13px] font-semibold hover:bg-[#1228B0] transition-colors"
          >
            Next: {nextLesson.title}
            <ChevronRight size={14} />
          </button>
        ) : (
          <button
            onClick={() => router.push(`/courses/${courseId}`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10B981] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
          >
            <Check size={14} />
            Finish Module
          </button>
        )}
      </div>

      {/* ── QUIZ PROMPT MODAL ── */}
      {/* Shown right after marking the lesson complete. Lets the user
          choose to take the AI-generated quiz now or skip to the next lesson. */}
      {showQuizPrompt && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] px-6">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#E8EDFF] flex items-center justify-center">
              <ClipboardList size={26} color="#1A3ADB" />
            </div>
            <h3 className="text-[18px] font-black text-[#0D1220]">
              Lesson complete! 🎉
            </h3>
            <p className="text-[13px] text-[#3D4A6B] leading-relaxed">
              Ready to test what you&apos;ve learned? Take a quick 5-question quiz on this lesson.
            </p>
            <div className="flex flex-col gap-2 w-full mt-2">
              <button
                onClick={handleTakeQuiz}
                className="w-full py-3 rounded-xl bg-[#1A3ADB] text-white text-[14px] font-bold hover:bg-[#1228B0] transition-colors"
              >
                Take Quiz
              </button>
              <button
                onClick={handleSkipQuiz}
                className="w-full py-3 rounded-xl border border-[#E4E8F5] text-[#3D4A6B] text-[14px] font-semibold hover:bg-[#F7F8FC] transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}