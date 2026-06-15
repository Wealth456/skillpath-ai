"use client";

import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Share2 } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface ReviewItem {
  id: number;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
}

interface SkillBar {
  label: string;
  percent: number;
}

// ─────────────────────────────────────────────────────────────
// STATIC MOCK DATA
// Replace with real data passed via sessionStorage when quiz
// page is updated to store answers before navigating here
// ─────────────────────────────────────────────────────────────

const MOCK_REVIEW: ReviewItem[] = [
  { id: 1, question: "What keyword starts a loop?",      correctAnswer: "for",              userAnswer: "for",          isCorrect: true  },
  { id: 2, question: "What does range(5) return?",       correctAnswer: "0,1,2,3,4",        userAnswer: "0,1,2,3,4",    isCorrect: true  },
  { id: 3, question: "How to exit a loop early?",        correctAnswer: "break",            userAnswer: "continue",     isCorrect: false },
  { id: 4, question: "Correct for loop syntax?",         correctAnswer: "for i in range(16)", userAnswer: "for i in range(16)", isCorrect: true },
  { id: 5, question: "Loop runs while condition True?",  correctAnswer: "while",            userAnswer: "while",        isCorrect: true  },
  { id: 6, question: "What does 'continue' do?",        correctAnswer: "Skips iteration",  userAnswer: "Stops loop",   isCorrect: false },
  { id: 7, question: "Can you nest loops?",              correctAnswer: "Yes",              userAnswer: "Yes",          isCorrect: true  },
  { id: 8, question: "Print 1 to 10?",                   correctAnswer: "for i in range(1,11)", userAnswer: "for i in range(1,11)", isCorrect: true },
];

const SKILL_BARS: SkillBar[] = [
  { label: "For Loops",    percent: 100 },
  { label: "While Loops",  percent: 75  },
  { label: "Functions",    percent: 80  },
];

// ─────────────────────────────────────────────────────────────
// DONUT CHART — pure SVG, no library
// ─────────────────────────────────────────────────────────────

function DonutChart({ percent }: { percent: number }) {
  const radius       = 70;
  const stroke       = 12;
  const normalRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalRadius;
  const offset       = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={radius * 2} height={radius * 2} className="-rotate-90">
        {/* Track */}
        <circle
          cx={radius}
          cy={radius}
          r={normalRadius}
          fill="none"
          stroke="#E5E9F5"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={radius}
          cy={radius}
          r={normalRadius}
          fill="none"
          stroke="#1A3ADB"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {/* Centre text */}
      <div className="absolute flex flex-col items-center">
        <span className="text-[24px] font-black text-[#0D1220]">{percent}%</span>
        <span className="text-[11px] text-[#8A97B8]">Score</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STAT BOX
// ─────────────────────────────────────────────────────────────

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center border border-[#E4E8F5] rounded-xl px-5 py-3 min-w-[90px]">
      <span className="text-[18px] font-black text-[#0D1220] leading-tight">{value}</span>
      <span className="text-[11px] text-[#8A97B8] mt-0.5">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// REVIEW CARD
// ─────────────────────────────────────────────────────────────

function ReviewCard({ item }: { item: ReviewItem }) {
  return (
    <div
      className={`rounded-2xl border p-5 flex items-start gap-4 ${
        item.isCorrect
          ? "bg-white border-[#1A3ADB]/30"
          : "border-[#EF4444]/30"
      }`}
      style={item.isCorrect ? {} : { backgroundColor: "#FEE2E2" }}
    >
      {/* Icon circle */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
          item.isCorrect ? "bg-[#1A3ADB]" : "bg-[#EF4444]"
        }`}
      >
        {item.isCorrect
          ? <CheckCircle2 size={16} color="#fff" />
          : <XCircle      size={16} color="#fff" />
        }
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1">
        <p className="text-[13px] font-bold text-[#0D1220]">
          Q{item.id}: {item.question}
        </p>
        <p className="text-[12px] text-[#1A3ADB] font-medium">
          Correct: {item.correctAnswer}
        </p>
        {!item.isCorrect && (
          <p className="text-[12px] text-[#EF4444] font-medium">
            Your answer: {item.userAnswer}
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function QuizResultsPage() {
  const params   = useParams();
  const router   = useRouter();
  const courseId = typeof params.courseId === "string" ? params.courseId : "";
  const moduleId = typeof params.moduleId === "string" ? params.moduleId : "";

  const total   = MOCK_REVIEW.length;
  const correct = MOCK_REVIEW.filter((r) => r.isCorrect).length;
  const wrong   = total - correct;
  const percent = Math.round((correct / total) * 100);
  const userName = typeof window !== "undefined"
    ? localStorage.getItem("skillpath_name") || "Amaka"
    : "Amaka";
  // First name only
  const firstName = userName.split(" ")[0];

  // Build stat boxes outside JSX — Rule 10
  const statBoxes = [
    { value: String(total),           label: "Questions" },
    { value: `${correct}/${total}`,   label: "Correct"   },
    { value: `${wrong}/${total}`,     label: "Wrong"     },
    { value: "04:28",                 label: "Time"      },
  ];

  const statElements = statBoxes.map((s) => (
    <StatBox key={s.label} value={s.value} label={s.label} />
  ));

  // Build skill bars outside JSX — Rule 10
  const skillBarElements = SKILL_BARS.map((bar) => (
    <div key={bar.label} className="flex items-center gap-3">
      <span className="text-[12px] text-[#3D4A6B] w-24 flex-shrink-0">{bar.label}</span>
      <div className="flex-1 h-2.5 bg-[#E5E9F5] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1A3ADB] rounded-full transition-all duration-700"
          style={{ width: `${bar.percent}%` }}
        />
      </div>
      <span className="text-[12px] font-bold text-[#1A3ADB] w-10 text-right">
        {bar.percent}%
      </span>
    </div>
  ));

  // Build review cards outside JSX — Rule 10
  const reviewCards = MOCK_REVIEW.map((item) => (
    <ReviewCard key={item.id} item={item} />
  ));

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FC]">

      {/* ── TOP NAVBAR ── */}
      <nav
        className="flex items-center justify-between px-8 py-4 sticky top-0 z-50 flex-shrink-0"
        style={{ backgroundColor: "#0D1B4B" }}
      >
        {/* Centre — module name + Quiz Complete! */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
          <span className="text-white/50 text-[14px]">Module 4: Functions &amp; Loo...</span>
          <span className="text-white font-black text-[15px]">Quiz Complete!</span>
        </div>

        {/* Right — back to course */}
        <div className="ml-auto">
          <button
            onClick={() => router.push(`/courses/${courseId}`)}
            className="text-white text-[13px] font-semibold hover:text-white/80 transition-colors"
          >
            Back to course
          </button>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 px-8 py-8 max-w-[1000px] mx-auto w-full flex flex-col gap-8">

        {/* ── SCORE CARD ── */}
        <div className="bg-white rounded-2xl border border-[#E4E8F5] p-8">
          <div className="flex items-start gap-10">

            {/* Left — donut + Great job pill */}
            <div className="flex flex-col items-center gap-3 flex-shrink-0">
              <DonutChart percent={percent} />
              <span
                className="px-3 py-1 rounded-full text-[12px] font-bold"
                style={{ backgroundColor: "#FFF8E7", color: "#F5A623" }}
              >
                🏆 Great job!
              </span>
            </div>

            {/* Right — stats + message + skill breakdown + actions */}
            <div className="flex-1 flex flex-col gap-5">

              {/* Stat boxes row */}
              <div className="flex items-center gap-3 flex-wrap">
                {statElements}
              </div>

              {/* Message */}
              <div>
                <h2 className="text-[18px] font-black text-[#0D1220] mb-1">
                  Well done, {firstName}! 🎉
                </h2>
                <p className="text-[13px] text-[#3D4A6B] leading-relaxed">
                  You scored {percent}% — above the 72% class average.<br />
                  You&apos;re making great progress on your Python path.
                </p>
              </div>

              {/* Skill breakdown */}
              <div className="flex flex-col gap-2">
                <p className="text-[13px] font-bold text-[#0D1220]">Skill Breakdown</p>
                {skillBarElements}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => router.push(`/courses/${courseId}`)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A3ADB] text-white text-[13px] font-bold hover:bg-[#1228B0] transition-colors"
                >
                  Continue to next lesson
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => router.push(`/courses/${courseId}/quiz/${moduleId}`)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#1A3ADB] text-[#1A3ADB] text-[13px] font-bold hover:bg-[#E8EDFF] transition-colors"
                >
                  <RotateCcw size={13} />
                  Retake quiz
                </button>
                <button
                  onClick={() => {}}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E4E8F5] text-[#3D4A6B] text-[13px] font-semibold hover:bg-[#F7F8FC] transition-colors"
                >
                  <Share2 size={13} />
                  Share result
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* ── REVIEW SECTION ── */}
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-[16px] font-black text-[#0D1220]">Review Your Answers</h3>
            <p className="text-[13px] text-[#8A97B8] mt-0.5">See where you went right and wrong</p>
          </div>

          {/* 2-column grid */}
          <div className="grid grid-cols-2 gap-4">
            {reviewCards}
          </div>
        </div>

      </div>
    </div>
  );
}