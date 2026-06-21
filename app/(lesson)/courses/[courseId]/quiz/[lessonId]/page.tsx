"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { generateQuiz, getQuizForLesson, submitQuiz } from "@/lib/api/quiz";
import type { Quiz } from "@/lib/api/quiz";

// ─────────────────────────────────────────────────────────────
// TIMER HOOK
// ─────────────────────────────────────────────────────────────

function useTimer(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const minutes = Math.floor(seconds / 60);
  const secs    = seconds % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return { display, seconds, elapsed };
}

// ─────────────────────────────────────────────────────────────
// OPTION CARD
// ─────────────────────────────────────────────────────────────

interface OptionCardProps {
  letter: string;
  text: string;
  selected: boolean;
  onSelect: () => void;
}

function OptionCard({ letter, text, selected, onSelect }: OptionCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-start gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-150 ${
        selected
          ? "border-[#1A3ADB] bg-[#E8EDFF]"
          : "border-[#E4E8F5] bg-white hover:border-[#1A3ADB]/40 hover:bg-[#F7F8FF]"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[14px] ${
          selected ? "bg-[#1A3ADB] text-white" : "bg-[#E5E9F5] text-[#8A97B8]"
        }`}
      >
        {letter}
      </div>
      <p className="text-[14px] text-[#0D1220] font-medium leading-relaxed pt-1.5">
        {text}
      </p>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function QuizPage() {
  const params   = useParams();
  const router   = useRouter();
  const courseId = typeof params.courseId === "string" ? params.courseId : "";
  const lessonId = typeof params.lessonId === "string" ? params.lessonId : "";

  const [quiz, setQuiz]               = useState<Quiz | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers]         = useState<Record<number, string>>({});
  const [submitting, setSubmitting]   = useState(false);

  const { display: timerDisplay, elapsed } = useTimer(15 * 60);

  // ── Load or generate quiz on mount ──
  useEffect(() => {
    if (!lessonId || !courseId) return;

    async function load() {
      try {
        setLoading(true);

        // Try fetching an existing quiz first
        try {
          const existing = await getQuizForLesson(lessonId);
          setQuiz(existing.data.data.quiz);
        } catch {
          // No quiz yet — generate one via AI
          const generated = await generateQuiz({ lessonId, courseId });
          setQuiz(generated.data.data.quiz);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load quiz";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [lessonId, courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#F7F8FC]">
        <div className="w-8 h-8 rounded-full border-2 border-[#1A3ADB] border-t-transparent animate-spin" />
        <p className="text-[13px] text-[#8A97B8]">Generating your quiz...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC]">
        <div className="rounded-xl bg-[#FEE2E2] px-5 py-4 text-sm text-[#EF4444]">
          {error || "Quiz not available."}
        </div>
      </div>
    );
  }

  const total            = quiz.questions.length;
  const currentQuestion  = quiz.questions[currentIndex];
  const currentAnswer    = answers[currentIndex];
  const answeredCount    = Object.keys(answers).length;
  const optionLetters    = ["A", "B", "C", "D"];

  function handleSelect(optionText: string) {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionText }));
  }

  function handleNext() {
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  }

  function handlePrev() {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  }

  function handleExit() {
    router.push(`/courses/${courseId}/lessons/${lessonId}`);
  }

  // ── Submit quiz ──
  async function handleSubmit() {
    if (submitting || !quiz) return;
    try {
      setSubmitting(true);

      // Build answers array in question order — answers must be exact option text
      const answersArray = quiz.questions.map((_, i) => answers[i] ?? "");

      const response = await submitQuiz(quiz._id, {
        answers: answersArray,
        timeTaken: elapsed,
      });

      // Store the result so the results page can read it
      sessionStorage.setItem(
        `skillpath_quiz_result_${quiz._id}`,
        JSON.stringify(response.data.data)
      );

      router.push(`/courses/${courseId}/quiz/${lessonId}/results?quizId=${quiz._id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit quiz";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  // Build progress dots — Rule 10
  const dots = quiz.questions.map((q, i) => {
    const status =
      i < currentIndex ? "completed" :
      i === currentIndex ? "active" : "upcoming";
    return (
      <button key={q._id} onClick={() => setCurrentIndex(i)} className="flex-shrink-0">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] transition-all ${
            status === "completed" ? "bg-[#1A3ADB] text-white" :
            status === "active"    ? "bg-[#1A3ADB] text-white ring-4 ring-[#1A3ADB]/25" :
            "border-2 border-[#E4E8F5] bg-white text-[#8A97B8]"
          }`}
        >
          {i + 1}
        </div>
      </button>
    );
  });

  // Build option cards — Rule 10
  const optionCards = currentQuestion.options.map((opt, i) => (
    <OptionCard
      key={i}
      letter={optionLetters[i] ?? String(i + 1)}
      text={opt}
      selected={currentAnswer === opt}
      onSelect={() => handleSelect(opt)}
    />
  ));

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FC]">

      {/* Top navbar */}
      <nav
        className="flex items-center justify-between px-6 py-3 sticky top-0 z-50 flex-shrink-0"
        style={{ backgroundColor: "#0D1B4B" }}
      >
        <button
          onClick={handleExit}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/25 text-white text-[13px] font-semibold hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={15} />
          Exit quiz
        </button>

        <p className="text-white font-bold text-[15px] absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
          Lesson Quiz
        </p>

        <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
          <Clock size={14} style={{ color: "#F5A623" }} />
          <span className="font-bold text-[14px]" style={{ color: "#F5A623" }}>
            {timerDisplay}
          </span>
        </div>
      </nav>

      {/* Progress dots */}
      <div className="flex flex-col items-center gap-2 py-5">
        <div className="flex items-center gap-2">{dots}</div>
        <p className="text-[12px] text-[#8A97B8] font-medium">
          Question {currentIndex + 1} of {total}
        </p>
      </div>

      {/* Question card */}
      <div className="flex-1 flex flex-col items-center px-6 pb-28">
        <div className="w-full max-w-[720px] bg-white rounded-2xl border border-[#E4E8F5] shadow-sm p-8 flex flex-col gap-5">
          <span className="self-start px-3 py-1 rounded-full bg-[#F7F8FC] border border-[#E4E8F5] text-[12px] font-semibold text-[#8A97B8]">
            Question {currentIndex + 1}
          </span>

          <h2 className="text-[18px] font-black text-[#0D1220] leading-snug">
            {currentQuestion.question}
          </h2>

          <div className="flex flex-col gap-3 mt-1">
            {optionCards}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E4E8F5] px-8 py-4 flex items-center justify-between z-40">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] font-semibold transition-colors ${
            currentIndex === 0 ? "opacity-40 cursor-not-allowed text-[#8A97B8]" : "text-[#3D4A6B] hover:bg-[#F7F8FC]"
          }`}
        >
          <ChevronLeft size={14} /> Previous
        </button>

        <p className="text-[13px] text-[#8A97B8] font-medium">
          {answeredCount} of {total} answered
        </p>

        <button
          onClick={handleNext}
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1A3ADB] text-white text-[13px] font-bold hover:bg-[#1228B0] transition-colors disabled:opacity-60"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : currentIndex === total - 1 ? (
            "Finish quiz"
          ) : (
            "Next question"
          )}
          {!submitting && <ChevronRight size={14} />}
        </button>
      </div>
    </div>
  );
}