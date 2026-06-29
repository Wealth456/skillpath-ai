"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, History } from "lucide-react";
import { getQuizAttempts } from "@/lib/api/quiz";
import type { QuizResult, QuizAttempt } from "@/lib/api/quiz";
import { getCourse } from "@/lib/api/learning";
import type { Course, Lesson } from "@/lib/api/learning";

export default function QuizResultsPage() {
  const params       = useParams();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const courseId = typeof params.courseId === "string" ? params.courseId : "";
  const lessonId = typeof params.lessonId === "string" ? params.lessonId : "";
  const quizId   = searchParams.get("quizId") ?? "";

  const [result, setResult]             = useState<QuizResult | null>(null);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [attempts, setAttempts]         = useState<QuizAttempt[]>([]);
  const [showAttempts, setShowAttempts] = useState(false);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // ── Read result from sessionStorage (set by the quiz page on submit) ──
  useEffect(() => {
    if (!quizId) return;
    const stored = sessionStorage.getItem(`skillpath_quiz_result_${quizId}`);
    if (stored) {
      setResult(JSON.parse(stored));
    }
  }, [quizId]);

  // ── Find the next lesson's ID so "Continue" goes to the right place ──
  useEffect(() => {
    if (!courseId || !lessonId) return;

    async function findNextLesson() {
      try {
        const response = await getCourse(courseId);
        const course: Course = response.data.data.course;

        // Flatten all lessons across all modules, in order
        const allLessons: Lesson[] = [];
        course.modules.forEach((mod) => mod.lessons.forEach((l) => allLessons.push(l)));

        const currentIndex = allLessons.findIndex((l) => l._id === lessonId);
        const next = currentIndex >= 0 && currentIndex < allLessons.length - 1
          ? allLessons[currentIndex + 1]
          : null;

        setNextLessonId(next ? next._id : null);
      } catch {
        // If this fails, "Continue" will safely fall back to the course page
        setNextLessonId(null);
      }
    }

    findNextLesson();
  }, [courseId, lessonId]);

  // ── Load past attempts for this quiz (lazy — only when user opens the panel) ──
  async function handleToggleAttempts() {
    const opening = !showAttempts;
    setShowAttempts(opening);

    // Only fetch the first time the panel is opened
    if (opening && attempts.length === 0 && quizId) {
      try {
        setLoadingAttempts(true);
        const response = await getQuizAttempts(quizId);
        setAttempts(response.data.data.attempts);
      } catch {
        setAttempts([]);
      } finally {
        setLoadingAttempts(false);
      }
    }
  }

  // ── Continue button — goes to the real next lesson, or back to course if none ──
  function handleContinue() {
    if (nextLessonId) {
      router.push(`/courses/${courseId}/lessons/${nextLessonId}`);
    } else {
      router.push(`/courses/${courseId}`);
    }
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1B4B]">
        <div className="rounded-xl bg-white px-6 py-4 text-sm text-[#3D4A6B]">
          No quiz result found. Please retake the quiz.
        </div>
      </div>
    );
  }

  // Build review cards — Rule 10
  const reviewCards = result.breakdown.map((item, i) => (
    <div
      key={i}
      className={`rounded-2xl border p-5 flex items-start gap-4 ${
        item.isCorrect ? "bg-white border-[#1A3ADB]/30" : "border-[#EF4444]/30"
      }`}
      style={item.isCorrect ? {} : { backgroundColor: "#FEE2E2" }}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
          item.isCorrect ? "bg-[#1A3ADB]" : "bg-[#EF4444]"
        }`}
      >
        {item.isCorrect ? <CheckCircle2 size={16} color="#fff" /> : <XCircle size={16} color="#fff" />}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[13px] font-bold text-[#0D1220]">
          Q{i + 1}: {item.question}
        </p>
        <p className="text-[12px] text-[#1A3ADB] font-medium">
          Correct: {item.correctAnswer}
        </p>
        {!item.isCorrect && (
          <p className="text-[12px] text-[#EF4444] font-medium">
            Your answer: {item.yourAnswer}
          </p>
        )}
        {item.explanation && (
          <p className="text-[12px] text-[#3D4A6B] mt-1 leading-relaxed">
            💡 {item.explanation}
          </p>
        )}
      </div>
    </div>
  ));

  // Build past attempt rows — Rule 10
  const attemptRows = attempts.map((attempt) => {
    const date = new Date(attempt.createdAt);
    const dateDisplay = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const timeDisplay = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const mins = Math.floor(attempt.timeTaken / 60);
    const secs = attempt.timeTaken % 60;

    return (
      <div
        key={attempt._id}
        className="flex items-center justify-between py-3 border-b border-[#E4E8F5] last:border-0"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              attempt.passed ? "bg-[#E8EDFF]" : "bg-[#FEE2E2]"
            }`}
          >
            {attempt.passed ? (
              <CheckCircle2 size={14} color="#1A3ADB" />
            ) : (
              <XCircle size={14} color="#EF4444" />
            )}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#0D1220]">
              {attempt.score}% · {attempt.passed ? "Passed" : "Failed"}
            </p>
            <p className="text-[11px] text-[#8A97B8]">
              {dateDisplay} at {timeDisplay}
            </p>
          </div>
        </div>
        <span className="text-[12px] text-[#8A97B8] flex-shrink-0">
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </span>
      </div>
    );
  });

  const minutes = Math.floor(result.timeTaken / 60);
  const seconds = result.timeTaken % 60;
  const timeDisplay = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FC]">

      {/* Top navbar */}
      <nav
        className="flex items-center justify-between px-8 py-4 sticky top-0 z-50 flex-shrink-0"
        style={{ backgroundColor: "#0D1B4B" }}
      >
        <p className="text-white font-black text-[15px] absolute left-1/2 -translate-x-1/2">
          Quiz Complete!
        </p>
        <button
          onClick={() => router.push(`/courses/${courseId}/lessons/${lessonId}`)}
          className="ml-auto text-white text-[13px] font-semibold hover:text-white/80 transition-colors"
        >
          Back to lesson
        </button>
      </nav>

      <div className="flex-1 px-8 py-8 max-w-[1000px] mx-auto w-full flex flex-col gap-8">

        {/* Score card */}
        <div className="bg-white rounded-2xl border border-[#E4E8F5] p-8 flex flex-col gap-5">

          {/* Pass/fail badge */}
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
              result.passed ? "bg-[#E8EDFF]" : "bg-[#FEE2E2]"
            }`}>
              {result.passed ? (
                <CheckCircle2 size={30} color="#1A3ADB" />
              ) : (
                <XCircle size={30} color="#EF4444" />
              )}
            </div>
            <div>
              <h2 className="text-[24px] font-black text-[#0D1220]">{result.score}%</h2>
              <p className="text-[13px] text-[#8A97B8]">
                {result.passed
                  ? "Great work! You passed the quiz."
                  : `Keep practising — pass mark is ${result.passMark}%.`}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 flex flex-col items-center py-3 rounded-xl border border-[#E4E8F5] min-w-[90px]">
              <span className="text-[18px] font-black text-[#0D1220]">{result.totalQuestions}</span>
              <span className="text-[11px] text-[#8A97B8]">Questions</span>
            </div>
            <div className="flex-1 flex flex-col items-center py-3 rounded-xl border border-[#E4E8F5] min-w-[90px]">
              <span className="text-[18px] font-black text-[#1A3ADB]">{result.correctCount}</span>
              <span className="text-[11px] text-[#8A97B8]">Correct</span>
            </div>
            <div className="flex-1 flex flex-col items-center py-3 rounded-xl border border-[#E4E8F5] min-w-[90px]">
              <span className="text-[18px] font-black text-[#EF4444]">{result.wrongCount}</span>
              <span className="text-[11px] text-[#8A97B8]">Wrong</span>
            </div>
            <div className="flex-1 flex flex-col items-center py-3 rounded-xl border border-[#E4E8F5] min-w-[90px]">
              <span className="text-[18px] font-black text-[#0D1220]">{timeDisplay}</span>
              <span className="text-[11px] text-[#8A97B8]">Time</span>
            </div>
          </div>

          {/* Score bar */}
          <div className="w-full h-2.5 bg-[#E5E9F5] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${result.passed ? "bg-[#1A3ADB]" : "bg-[#EF4444]"}`}
              style={{ width: `${result.score}%` }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            {result.passed ? (
              <button
                onClick={handleContinue}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A3ADB] text-white text-[13px] font-bold hover:bg-[#1228B0] transition-colors"
              >
                {nextLessonId ? "Continue to next lesson" : "Back to course"}
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={() => router.push(`/courses/${courseId}/quiz/${lessonId}`)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A3ADB] text-white text-[13px] font-bold hover:bg-[#1228B0] transition-colors"
              >
                <RotateCcw size={13} /> Retake quiz
              </button>
            )}

            {/* Past attempts toggle */}
            <button
              onClick={handleToggleAttempts}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E4E8F5] text-[#3D4A6B] text-[13px] font-semibold hover:bg-[#F7F8FC] transition-colors"
            >
              <History size={13} />
              {showAttempts ? "Hide past attempts" : "View past attempts"}
            </button>
          </div>

          {/* Past attempts panel — only renders when toggled open */}
          {showAttempts && (
            <div className="rounded-xl border border-[#E4E8F5] px-4 py-2 mt-1">
              {loadingAttempts ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-5 h-5 rounded-full border-2 border-[#1A3ADB] border-t-transparent animate-spin" />
                </div>
              ) : attempts.length > 0 ? (
                <div className="flex flex-col">{attemptRows}</div>
              ) : (
                <p className="text-[12px] text-[#8A97B8] text-center py-4">
                  No past attempts found for this quiz.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Review section */}
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-[16px] font-black text-[#0D1220]">Review Your Answers</h3>
            <p className="text-[13px] text-[#8A97B8] mt-0.5">See where you went right and wrong</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {reviewCards}
          </div>
        </div>
      </div>
    </div>
  );
}