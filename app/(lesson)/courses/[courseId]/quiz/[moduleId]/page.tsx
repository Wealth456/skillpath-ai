"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface QuizOption {
  letter: "A" | "B" | "C" | "D";
  text: string;       // can be multiline — split on \n for indented display
  correct: boolean;
}

interface QuizQuestion {
  id: number;
  question: string;
  subtitle: string;
  codeBlock: string;  // empty string if no code block
  options: QuizOption[];
}

// ─────────────────────────────────────────────────────────────
// STATIC QUIZ DATA
// One quiz per module — keyed by moduleId or moduleOrder string.
// When the backend sends a quiz endpoint, replace this with an API call.
// ─────────────────────────────────────────────────────────────

const QUIZ_BANK: Record<string, QuizQuestion[]> = {
  default: [
    {
      id: 1,
      question: "What is the correct way to write a for loop in Python?",
      subtitle: "Choose the best answer below.",
      codeBlock: "# Which of the following prints numbers 1 to 5?\n# Select the correct syntax below.",
      options: [
        { letter: "A", text: "for i in range(1, 6):\n    print(i)", correct: true  },
        { letter: "B", text: "for i = 1 to 5:\n    print(i)",        correct: false },
        { letter: "C", text: "for(i=1; i<=5; i++):\n    print(i)",   correct: false },
        { letter: "D", text: "loop i from 1 to 5:\n    print(i)",    correct: false },
      ],
    },
    {
      id: 2,
      question: "Which keyword is used to define a function in Python?",
      subtitle: "Choose the best answer below.",
      codeBlock: "",
      options: [
        { letter: "A", text: "function",  correct: false },
        { letter: "B", text: "def",       correct: true  },
        { letter: "C", text: "fun",       correct: false },
        { letter: "D", text: "define",    correct: false },
      ],
    },
    {
      id: 3,
      question: "What does the range(5) function return?",
      subtitle: "Choose the best answer below.",
      codeBlock: "# What does this print?\nfor i in range(5):\n    print(i)",
      options: [
        { letter: "A", text: "Numbers 1 to 5",    correct: false },
        { letter: "B", text: "Numbers 0 to 4",    correct: true  },
        { letter: "C", text: "Numbers 0 to 5",    correct: false },
        { letter: "D", text: "Numbers 1 to 4",    correct: false },
      ],
    },
    {
      id: 4,
      question: "What is the correct way to write a for loop in Python?",
      subtitle: "Choose the best answer below.",
      codeBlock: "# Which of the following prints numbers 1 to 5?\n# Select the correct syntax below.",
      options: [
        { letter: "A", text: "for i in range(1, 6):\n    print(i)", correct: true  },
        { letter: "B", text: "for i = 1 to 5:\n    print(i)",        correct: false },
        { letter: "C", text: "for(i=1; i<=5; i++):\n    print(i)",   correct: false },
        { letter: "D", text: "loop i from 1 to 5:\n    print(i)",    correct: false },
      ],
    },
    {
      id: 5,
      question: "Which of the following is a valid Python variable name?",
      subtitle: "Choose the best answer below.",
      codeBlock: "",
      options: [
        { letter: "A", text: "2myVar",   correct: false },
        { letter: "B", text: "my-var",   correct: false },
        { letter: "C", text: "my_var",   correct: true  },
        { letter: "D", text: "my var",   correct: false },
      ],
    },
    {
      id: 6,
      question: "What will print(type(3.14)) output?",
      subtitle: "Choose the best answer below.",
      codeBlock: "print(type(3.14))",
      options: [
        { letter: "A", text: "<class 'int'>",    correct: false },
        { letter: "B", text: "<class 'float'>",  correct: true  },
        { letter: "C", text: "<class 'str'>",    correct: false },
        { letter: "D", text: "<class 'number'>", correct: false },
      ],
    },
    {
      id: 7,
      question: "How do you start a while loop in Python?",
      subtitle: "Choose the best answer below.",
      codeBlock: "",
      options: [
        { letter: "A", text: "loop while condition:",  correct: false },
        { letter: "B", text: "while (condition) do:",  correct: false },
        { letter: "C", text: "while condition:",       correct: true  },
        { letter: "D", text: "do while condition:",    correct: false },
      ],
    },
    {
      id: 8,
      question: "What keyword immediately exits a loop in Python?",
      subtitle: "Choose the best answer below.",
      codeBlock: "for i in range(10):\n    if i == 5:\n        ???\nprint('Done')",
      options: [
        { letter: "A", text: "exit",     correct: false },
        { letter: "B", text: "stop",     correct: false },
        { letter: "C", text: "continue", correct: false },
        { letter: "D", text: "break",    correct: true  },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// TIMER HOOK — counts down from initialSeconds
// ─────────────────────────────────────────────────────────────

function useTimer(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  // Format as MM:SS
  const minutes  = Math.floor(seconds / 60);
  const secs     = seconds % 60;
  const display  = `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return { display, seconds };
}

// ─────────────────────────────────────────────────────────────
// OPTION CARD COMPONENT
// ─────────────────────────────────────────────────────────────

interface OptionCardProps {
  option: QuizOption;
  selected: boolean;
  onSelect: () => void;
}

function OptionCard({ option, selected, onSelect }: OptionCardProps) {
  // Split option text on newline for indented code display
  const lines = option.text.split("\n");
  const firstLine  = lines[0];
  const secondLine = lines[1] ?? "";

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-start gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-150 ${
        selected
          ? "border-[#1A3ADB] bg-[#E8EDFF]"
          : "border-[#E4E8F5] bg-white hover:border-[#1A3ADB]/40 hover:bg-[#F7F8FF]"
      }`}
    >
      {/* Letter circle */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[14px] ${
          selected
            ? "bg-[#1A3ADB] text-white"
            : "bg-[#E5E9F5] text-[#8A97B8]"
        }`}
      >
        {option.letter}
      </div>

      {/* Option text — monospace, two lines */}
      <div className="flex flex-col justify-center font-mono text-[14px] text-[#0D1220]">
        <span>{firstLine}</span>
        {secondLine && (
          <span className="text-[#3D4A6B] pl-6">{secondLine}</span>
        )}
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// PROGRESS DOT COMPONENT
// ─────────────────────────────────────────────────────────────

interface DotProps {
  num: number;
  status: "completed" | "active" | "upcoming";
}

function ProgressDot({ num, status }: DotProps) {
  if (status === "completed") {
    return (
      <div className="w-9 h-9 rounded-full bg-[#1A3ADB] flex items-center justify-center text-white font-bold text-[13px]">
        {num}
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className="w-9 h-9 rounded-full bg-[#1A3ADB] flex items-center justify-center text-white font-bold text-[13px] ring-4 ring-[#1A3ADB]/25">
        {num}
      </div>
    );
  }
  // upcoming
  return (
    <div className="w-9 h-9 rounded-full border-2 border-[#E4E8F5] bg-white flex items-center justify-center text-[#8A97B8] font-semibold text-[13px]">
      {num}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function QuizPage() {
  const params   = useParams();
  const router   = useRouter();

  const courseId = typeof params.courseId === "string" ? params.courseId : "";
  const moduleId = typeof params.moduleId === "string" ? params.moduleId : "";

  // Load questions — use moduleId as key, fall back to default
  const questions = QUIZ_BANK[moduleId] ?? QUIZ_BANK["default"];
  const total     = questions.length;

  // Current question index (0-based)
  const [currentIndex, setCurrentIndex] = useState(0);

  // Map of questionId → selected letter
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // Quiz timer — 15 minutes
  const { display: timerDisplay } = useTimer(15 * 60);

  // Module title — read from sessionStorage if available
  const [moduleTitle, setModuleTitle] = useState("Quiz");
  useEffect(() => {
    const stored = sessionStorage.getItem("skillpath_module_title");
    if (stored) setModuleTitle(stored);
  }, []);

  const currentQuestion = questions[currentIndex];
  const currentAnswer   = answers[currentQuestion.id];
  const answeredCount   = Object.keys(answers).length;

  // ── Select an answer ──
  function handleSelect(letter: string) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: letter }));
  }

  // ── Navigate ──
  function handleNext() {
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Last question — go to results
      router.push(`/courses/${courseId}/quiz/${moduleId}/results`);
    }
  }

  function handlePrev() {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  }

  function handleExit() {
    router.push(`/courses/${courseId}`);
  }

  // ── Build progress dots (Rule 10 — outside JSX) ──
  const dots = questions.map((q, i) => {
    const status =
      i < currentIndex ? "completed" :
      i === currentIndex ? "active" : "upcoming";
    return (
      <button
        key={q.id}
        onClick={() => setCurrentIndex(i)}
        className="flex-shrink-0"
      >
        <ProgressDot num={i + 1} status={status as "completed" | "active" | "upcoming"} />
      </button>
    );
  });

  // ── Build option cards (Rule 10 — outside JSX) ──
  const optionCards = currentQuestion.options.map((opt) => (
    <OptionCard
      key={opt.letter}
      option={opt}
      selected={currentAnswer === opt.letter}
      onSelect={() => handleSelect(opt.letter)}
    />
  ));

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FC]">

      {/* ── TOP NAVBAR ── */}
      <nav
        className="flex items-center justify-between px-6 py-3 sticky top-0 z-50 flex-shrink-0"
        style={{ backgroundColor: "#0D1B4B" }}
      >
        {/* Left — exit quiz */}
        <button
          onClick={handleExit}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/25 text-white text-[13px] font-semibold hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={15} />
          Exit quiz
        </button>

        {/* Centre — quiz title */}
        <p className="text-white font-bold text-[15px] absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
          Module {currentIndex + 1} Quiz: {moduleTitle}
        </p>

        {/* Right — countdown timer */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
        >
          <Clock size={14} style={{ color: "#F5A623" }} />
          <span className="font-bold text-[14px]" style={{ color: "#F5A623" }}>
            {timerDisplay}
          </span>
        </div>
      </nav>

      {/* ── PROGRESS DOTS ── */}
      <div className="flex flex-col items-center gap-2 py-5 bg-[#F7F8FC]">
        <div className="flex items-center gap-2">
          {dots}
        </div>
        <p className="text-[12px] text-[#8A97B8] font-medium">
          Question {currentIndex + 1} of {total}
        </p>
      </div>

      {/* ── QUESTION CARD ── */}
      <div className="flex-1 flex flex-col items-center px-6 pb-28">
        <div className="w-full max-w-[720px] bg-white rounded-2xl border border-[#E4E8F5] shadow-sm p-8 flex flex-col gap-5">

          {/* Question badge */}
          <div>
            <span className="px-3 py-1 rounded-full bg-[#F7F8FC] border border-[#E4E8F5] text-[12px] font-semibold text-[#8A97B8]">
              Question {currentIndex + 1}
            </span>
          </div>

          {/* Question text */}
          <div>
            <h2 className="text-[18px] font-black text-[#0D1220] leading-snug mb-1">
              {currentQuestion.question}
            </h2>
            <p className="text-[13px] text-[#8A97B8]">{currentQuestion.subtitle}</p>
          </div>

          {/* Code block — only shown if codeBlock is not empty */}
          {currentQuestion.codeBlock && (
            <pre
              className="rounded-xl px-5 py-4 text-[13px] font-mono leading-relaxed overflow-x-auto"
              style={{ backgroundColor: "#0D1117", color: "#4EC9B0" }}
            >
              {currentQuestion.codeBlock}
            </pre>
          )}

          {/* Answer options */}
          <div className="flex flex-col gap-3 mt-1">
            {optionCards}
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E4E8F5] px-8 py-4 flex items-center justify-between z-40">

        {/* Previous */}
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] font-semibold transition-colors ${
            currentIndex === 0
              ? "opacity-40 cursor-not-allowed text-[#8A97B8]"
              : "text-[#3D4A6B] hover:bg-[#F7F8FC]"
          }`}
        >
          <ChevronLeft size={14} />
          Previous
        </button>

        {/* Centre — answered count */}
        <p className="text-[13px] text-[#8A97B8] font-medium">
          {answeredCount} of {total} answered
        </p>

        {/* Next */}
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1A3ADB] text-white text-[13px] font-bold hover:bg-[#1228B0] transition-colors"
        >
          {currentIndex === total - 1 ? "Finish quiz" : "Next question"}
          <ChevronRight size={14} />
        </button>
      </div>

    </div>
  );
}