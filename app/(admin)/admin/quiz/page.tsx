"use client";

import { useState } from "react";
import { Sparkles, Plus, Save, Eye, GripVertical, Trash2, Check } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type QuestionType = "MCQ" | "T/F" | "Fill";

interface QuizQuestion {
  id: string;
  qNum: string;
  text: string;
  type: QuestionType;
  options: string[];
  correctIndex: number;
}

interface QuizSettings {
  timeLimit: string;
  passMark: string;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showAnswersAfter: boolean;
  questionType: string;
  pointsPerQ: number;
  bonusForSpeed: number;
}

// ─────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────

const INITIAL_QUESTIONS: QuizQuestion[] = [
  { id: "q1", qNum: "Q1", text: "What keyword starts a function?",      type: "MCQ",  options: ["def", "fun", "func", "start"],                                     correctIndex: 0 },
  { id: "q2", qNum: "Q2", text: "What does range(5) return?",            type: "MCQ",  options: ["0–4", "1–5", "0–5", "1–4"],                                       correctIndex: 0 },
  { id: "q3", qNum: "Q3", text: "How to exit a loop early?",             type: "MCQ",  options: ["break", "exit", "stop", "continue"],                              correctIndex: 0 },
  { id: "q4", qNum: "Q4", text: "Correct for loop syntax?",              type: "MCQ",  options: ["for i in range(1, 6):\n    print(i)", "for i = 1 to 5:\n    print(i)", "for(i=1; i<=5; i++):\n    print(i)", "loop i from 1 to 5:\n    print(i)"], correctIndex: 0 },
  { id: "q5", qNum: "Q5", text: "True/False: Python uses {}",            type: "T/F",  options: ["True", "False"],                                                  correctIndex: 1 },
  { id: "q6", qNum: "Q6", text: "What does 'continue' do?",              type: "MCQ",  options: ["Skips iteration", "Stops loop", "Exits function", "None"],         correctIndex: 0 },
  { id: "q7", qNum: "Q7", text: "Can loops be nested?",                  type: "T/F",  options: ["True", "False"],                                                  correctIndex: 0 },
  { id: "q8", qNum: "Q8", text: "Fill: for i in _____(5)",               type: "Fill", options: ["range"],                                                          correctIndex: 0 },
];

const SETTINGS: QuizSettings = {
  timeLimit:        "15 minutes",
  passMark:         "70%",
  maxAttempts:      3,
  shuffleQuestions: true,
  showAnswersAfter: true,
  questionType:     "Multiple choice",
  pointsPerQ:       10,
  bonusForSpeed:    5,
};

// ─────────────────────────────────────────────────────────────
// TYPE BADGE COLOURS — blue palette only, no green/purple/yellow
// ─────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: QuestionType }) {
  const styles: Record<QuestionType, string> = {
    MCQ:  "bg-[#E8EDFF] text-[#1A3ADB]",
    "T/F": "bg-[#0D1B4B] text-white",
    Fill: "bg-[#E5E9F5] text-[#3D4A6B]",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${styles[type]}`}>
      {type}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function QuizBuilderPage() {
  const [questions, setQuestions]           = useState<QuizQuestion[]>(INITIAL_QUESTIONS);
  const [activeQuestionId, setActiveQuestionId] = useState("q4");
  const [generating, setGenerating]         = useState(false);
  const [generated, setGenerated]           = useState(false);

  const activeQuestion = questions.find((q) => q.id === activeQuestionId) ?? questions[0];

  // ── AI Generate Quiz ──
  // When real AI endpoint is ready, replace setTimeout with API call:
  // POST /api/admin/quiz/generate { courseId, moduleId } → returns QuizQuestion[]
  function handleAIGenerate() {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      setTimeout(() => setGenerated(false), 3000);
    }, 2000);
  }

  function handleSetCorrect(optionIndex: number) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === activeQuestionId ? { ...q, correctIndex: optionIndex } : q
      )
    );
  }

  // Build question list items — Rule 10
  const questionItems = questions.map((q) => {
    const isActive = q.id === activeQuestionId;
    return (
      <div
        key={q.id}
        onClick={() => setActiveQuestionId(q.id)}
        className={`flex items-start gap-3 px-3 py-3 rounded-xl cursor-pointer border transition-all ${
          isActive
            ? "border-[#1A3ADB] bg-[#E8EDFF]"
            : "border-[#E4E8F5] bg-white hover:bg-[#F7F8FC]"
        }`}
      >
        <GripVertical size={14} color="#8A97B8" className="mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className={`text-[12px] font-bold mb-0.5 ${isActive ? "text-[#1A3ADB]" : "text-[#8A97B8]"}`}>
            {q.qNum}
          </p>
          <p className="text-[12px] font-semibold text-[#0D1220] leading-snug truncate">
            {q.text}
          </p>
          <div className="mt-1.5">
            <TypeBadge type={q.type} />
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setQuestions((prev) => prev.filter((item) => item.id !== q.id));
          }}
          className="text-[#8A97B8] hover:text-[#EF4444] transition-colors flex-shrink-0 mt-0.5"
        >
          <Trash2 size={13} />
        </button>
      </div>
    );
  });

  // Build answer option rows — Rule 10
  const optionLetters = ["A", "B", "C", "D"];
  const optionRows = activeQuestion.options.map((opt, i) => {
    const isCorrect = activeQuestion.correctIndex === i;
    const letter    = optionLetters[i] ?? String(i + 1);
    return (
      <div
        key={i}
        className={`flex items-start gap-4 px-4 py-3.5 rounded-xl border-2 transition-all ${
          isCorrect
            ? "border-[#1A3ADB] bg-[#E8EDFF]"
            : "border-[#E4E8F5] bg-white"
        }`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] flex-shrink-0 ${
            isCorrect ? "bg-[#1A3ADB] text-white" : "bg-[#E5E9F5] text-[#8A97B8]"
          }`}
        >
          {letter}
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-mono text-[#0D1220] whitespace-pre-line">{opt}</p>
        </div>
        {isCorrect ? (
          <span className="flex items-center gap-1 text-[11px] font-bold text-[#1A3ADB] flex-shrink-0">
            <Check size={12} /> Correct
          </span>
        ) : (
          <button
            onClick={() => handleSetCorrect(i)}
            className="text-[11px] font-semibold text-[#8A97B8] hover:text-[#1A3ADB] flex-shrink-0 transition-colors"
          >
            Set correct
          </button>
        )}
      </div>
    );
  });

  // Build settings rows — Rule 10
  const settingRows = [
    { label: "Time limit",         value: SETTINGS.timeLimit        },
    { label: "Pass mark",          value: SETTINGS.passMark         },
    { label: "Max attempts",       value: String(SETTINGS.maxAttempts) },
    { label: "Shuffle questions",  value: SETTINGS.shuffleQuestions ? "On" : "Off" },
    { label: "Show answers after", value: SETTINGS.showAnswersAfter ? "On" : "Off" },
    { label: "Question type",      value: SETTINGS.questionType     },
  ].map((row) => (
    <div key={row.label} className="flex items-center justify-between py-2 border-b border-[#E4E8F5] last:border-0">
      <span className="text-[12px] text-[#8A97B8]">{row.label}</span>
      <span className="text-[12px] font-bold text-[#0D1220]">{row.value}</span>
    </div>
  ));

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 min-h-screen">

      {/* ── TOPBAR ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-black text-[#0D1220]">Quiz Builder</h1>
          <p className="text-[12px] text-[#8A97B8]">Build and manage quizzes for your courses</p>
        </div>
        <div className="flex items-center gap-3">
          {/* AI Generate — the smart button */}
          <button
            onClick={handleAIGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#1A3ADB] text-[#1A3ADB] text-[12px] font-bold hover:bg-[#E8EDFF] transition-colors disabled:opacity-60"
          >
            {generating ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-[#1A3ADB] border-t-transparent animate-spin" />
                Generating...
              </>
            ) : generated ? (
              <>
                <Check size={13} /> Generated!
              </>
            ) : (
              <>
                <Sparkles size={13} />
                AI Generate Quiz
              </>
            )}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E4E8F5] text-[#3D4A6B] text-[12px] font-semibold hover:bg-[#F7F8FC] transition-colors">
            <Plus size={13} /> Add Question
          </button>
          <button className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1A3ADB] text-white text-[12px] font-bold hover:bg-[#1228B0] transition-colors">
            <Save size={13} /> Save &amp; Publish
          </button>
        </div>
      </div>

      {/* ── Quiz header ── */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#E8EDFF] flex items-center justify-center flex-shrink-0">
          <Sparkles size={15} color="#1A3ADB" />
        </div>
        <div>
          <p className="text-[14px] font-bold text-[#0D1220]">
            Python for Beginners — Module 4 Quiz
          </p>
          <p className="text-[11px] text-[#8A97B8]">
            {questions.length} questions · 15 min time limit · Pass mark: 70%
          </p>
        </div>
      </div>

      {/* ── THREE COLUMN BODY ── */}
      <div className="flex gap-4 flex-1">

        {/* LEFT — question list */}
        <div className="w-[240px] flex-shrink-0 bg-white rounded-2xl border border-[#E4E8F5] p-4 flex flex-col gap-3 overflow-y-auto">
          <div>
            <p className="text-[13px] font-bold text-[#0D1220]">Questions</p>
            <p className="text-[11px] text-[#8A97B8]">Drag to reorder</p>
          </div>
          <div className="flex flex-col gap-2">
            {questionItems}
          </div>
        </div>

        {/* CENTRE — question editor */}
        <div className="flex-1 bg-white rounded-2xl border border-[#E4E8F5] p-6 flex flex-col gap-5 min-w-0">

          {/* Editing header */}
          <div className="flex items-center gap-3">
            <p className="text-[15px] font-bold text-[#0D1220]">
              Editing: {activeQuestion.qNum}
            </p>
            <TypeBadge type={activeQuestion.type} />
          </div>

          {/* Question text input */}
          <div>
            <p className="text-[12px] text-[#8A97B8] mb-2">Question Text</p>
            <div className="w-full px-4 py-3 rounded-xl border border-[#E4E8F5] bg-[#F7F8FC] text-[14px] font-semibold text-[#0D1220]">
              {activeQuestion.text}
            </div>
          </div>

          {/* Answer options */}
          <div>
            <p className="text-[12px] text-[#8A97B8] mb-3">
              Answer Options — Mark the correct answer with ✓
            </p>
            <div className="flex flex-col gap-3">
              {optionRows}
            </div>
          </div>
        </div>

        {/* RIGHT — quiz settings */}
        <div className="w-[220px] flex-shrink-0 flex flex-col gap-4">

          {/* Settings card */}
          <div className="bg-white rounded-2xl border border-[#E4E8F5] p-4 flex flex-col gap-1">
            <p className="text-[13px] font-bold text-[#0D1220] mb-2">Quiz Settings</p>
            {settingRows}
          </div>

          {/* Points card */}
          <div className="bg-white rounded-2xl border border-[#E4E8F5] p-4 flex flex-col gap-2">
            <p className="text-[13px] font-bold text-[#0D1220] mb-1">Points &amp; Scoring</p>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#8A97B8]">Points per Q</span>
              <span className="text-[12px] font-bold text-[#0D1220]">{SETTINGS.pointsPerQ} pts</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#8A97B8]">Bonus for speed</span>
              <span className="text-[12px] font-bold text-[#0D1220]">{SETTINGS.bonusForSpeed} pts</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#E4E8F5] pt-2 mt-1">
              <span className="text-[12px] font-bold text-[#0D1220]">Total possible</span>
              <span className="text-[13px] font-black text-[#1A3ADB]">
                {(questions.length * SETTINGS.pointsPerQ) + SETTINGS.bonusForSpeed} pts
              </span>
            </div>
          </div>

          {/* Preview button */}
          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1A3ADB] text-white text-[13px] font-bold hover:bg-[#1228B0] transition-colors">
            <Eye size={14} /> Preview quiz
          </button>
        </div>
      </div>
    </div>
  );
}