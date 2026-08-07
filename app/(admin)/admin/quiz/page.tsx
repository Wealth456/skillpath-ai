"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Save, X, Check } from "lucide-react";
import { getCourses, Course } from "@/lib/api/learning";
import {
  getQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  QuizListItem,
  QuizPayload,
  QuizQuestionInput,
} from "@/lib/api/admin";

function emptyQuestion(): QuizQuestionInput {
  return { question: "", options: ["", ""], correctAnswer: "", explanation: "" };
}

// ─────────────────────────────────────────────────────────────
// QUIZ FORM MODAL
// ─────────────────────────────────────────────────────────────

function QuizFormModal({
  courses,
  initial,
  onClose,
  onSaved,
}: {
  courses: Course[];
  initial: QuizListItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!initial;

  const [courseId, setCourseId] = useState(initial?.courseId._id ?? courses[0]?._id ?? "");
  const [lessonId, setLessonId] = useState(initial?.lessonId ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [passMark, setPassMark] = useState(initial?.passMark ?? 70);
  const [timeLimit, setTimeLimit] = useState(initial?.timeLimit ?? 15);
  const [questions, setQuestions] = useState<QuizQuestionInput[]>(
    initial
      ? initial.questions.map((q) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        }))
      : [emptyQuestion()]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCourse = courses.find((c) => c._id === courseId);
  const availableLessons =
    selectedCourse?.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleTitle: m.title }))) ?? [];

  function updateQuestion(qi: number, patch: Partial<QuizQuestionInput>) {
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, ...patch } : q)));
  }

  function updateOption(qi: number, oi: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q;
        const options = q.options.map((o, idx) => (idx === oi ? value : o));
        // Keep correctAnswer in sync if it was pointing at the edited option
        const correctAnswer = q.correctAnswer === q.options[oi] ? value : q.correctAnswer;
        return { ...q, options, correctAnswer };
      })
    );
  }

  function addOption(qi: number) {
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, options: [...q.options, ""] } : q)));
  }

  function removeOption(qi: number, oi: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q;
        const removed = q.options[oi];
        const options = q.options.filter((_, idx) => idx !== oi);
        return { ...q, options, correctAnswer: q.correctAnswer === removed ? "" : q.correctAnswer };
      })
    );
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  }

  function removeQuestion(qi: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== qi));
  }

  async function handleSave() {
    setError(null);

    if (!courseId || !lessonId || !title.trim()) {
      setError("Please select a course, lesson, and enter a quiz title.");
      return;
    }
    for (const q of questions) {
      if (!q.question.trim() || q.options.some((o) => !o.trim()) || !q.correctAnswer) {
        setError("Every question needs text, filled options, and a marked correct answer.");
        return;
      }
    }

    const payload: QuizPayload = {
      courseId,
      lessonId,
      title: title.trim(),
      passMark: Number(passMark),
      timeLimit: Number(timeLimit),
      questions,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await updateQuiz(initial!._id, payload);
      } else {
        await createQuiz(payload);
      }
      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save quiz.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] px-6 py-8">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-[#E4E8F5] px-6 py-4 flex items-center justify-between">
          <h3 className="text-[16px] font-black text-[#0D1220]">{isEdit ? "Edit Quiz" : "New Quiz"}</h3>
          <button onClick={onClose} className="text-[#8A97B8] hover:text-[#0D1220]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] rounded-xl px-4 py-3">{error}</div>
          )}

          <div>
            <label className="text-[12px] font-semibold text-[#3D4A6B] mb-1.5 block">Quiz Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-semibold text-[#3D4A6B] mb-1.5 block">Course</label>
              <select
                value={courseId}
                onChange={(e) => { setCourseId(e.target.value); setLessonId(""); }}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20"
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-[#3D4A6B] mb-1.5 block">Lesson</label>
              <select
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20"
              >
                <option value="">Select a lesson…</option>
                {availableLessons.map((l) => (
                  <option key={l._id} value={l._id}>{l.moduleTitle} — {l.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-semibold text-[#3D4A6B] mb-1.5 block">Pass mark (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={passMark}
                onChange={(e) => setPassMark(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20"
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-[#3D4A6B] mb-1.5 block">Time limit (min)</label>
              <input
                type="number"
                min={1}
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20"
              />
            </div>
          </div>

          {/* Questions builder */}
          <div className="flex flex-col gap-3 border-t border-[#E4E8F5] pt-4">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-[#0D1220]">Questions</label>
              <button onClick={addQuestion} className="flex items-center gap-1 text-[12px] font-semibold text-[#1A3ADB] hover:underline">
                <Plus size={13} /> Add question
              </button>
            </div>

            {questions.map((q, qi) => (
              <div key={qi} className="rounded-xl border border-[#E4E8F5] bg-[#F7F8FC] p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#8A97B8] font-bold w-6">Q{qi + 1}</span>
                  <input
                    value={q.question}
                    onChange={(e) => updateQuestion(qi, { question: e.target.value })}
                    placeholder="Question text"
                    className="flex-1 px-3 py-2 rounded-lg border border-[#E4E8F5] bg-white text-[12px] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20"
                  />
                  {questions.length > 1 && (
                    <button onClick={() => removeQuestion(qi)} className="text-[#EF4444] hover:opacity-70">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2 pl-8">
                  {q.options.map((opt, oi) => {
                    const isCorrect = q.correctAnswer === opt && opt.trim() !== "";
                    return (
                      <div key={oi} className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuestion(qi, { correctAnswer: opt })}
                          disabled={!opt.trim()}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${
                            isCorrect ? "bg-[#1A3ADB] text-white" : "bg-[#E5E9F5] text-[#8A97B8] hover:bg-[#E8EDFF]"
                          }`}
                          title="Mark as correct answer"
                        >
                          {isCorrect ? <Check size={12} /> : oi + 1}
                        </button>
                        <input
                          value={opt}
                          onChange={(e) => updateOption(qi, oi, e.target.value)}
                          placeholder={`Option ${oi + 1}`}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#E4E8F5] bg-white text-[12px] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20"
                        />
                        {q.options.length > 2 && (
                          <button onClick={() => removeOption(qi, oi)} className="text-[#EF4444] hover:opacity-70">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <button onClick={() => addOption(qi)} className="flex items-center gap-1 text-[11px] font-semibold text-[#1A3ADB] hover:underline self-start">
                    <Plus size={12} /> Add option
                  </button>

                  <textarea
                    value={q.explanation}
                    onChange={(e) => updateQuestion(qi, { explanation: e.target.value })}
                    placeholder="Explanation (shown after answering)"
                    rows={2}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E4E8F5] bg-white text-[12px] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20 resize-none mt-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-[#E4E8F5] px-6 py-4 flex gap-3">
          <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] font-semibold text-[#3D4A6B] hover:bg-[#F7F8FC] transition-colors disabled:opacity-60">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[#1A3ADB] text-white text-[13px] font-bold hover:bg-[#1228B0] transition-colors disabled:opacity-60">
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function QuizBuilderPage() {
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<QuizListItem | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function loadData() {
    setLoading(true);
    setError(null);
    Promise.all([getQuizzes(), getCourses()])
      .then(([quizList, coursesRes]) => {
        setQuizzes(quizList);
        setCourses(
          coursesRes.data.data.courses.filter(
            (c: any) => typeof c.title === "string" && typeof c.instructor === "string"
          )
        );
      })
      .catch((err) => setError(err?.response?.data?.message || "Failed to load quizzes."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(quizId: string) {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteQuiz(quizId);
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
      setConfirmDeleteId(null);
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || "Failed to delete quiz.");
    } finally {
      setDeleting(false);
    }
  }

  const quizCards = quizzes.map((quiz) => (
    <div key={quiz._id} className="bg-white rounded-2xl border border-[#E4E8F5] p-5 flex flex-col gap-3">
      <div>
        <p className="text-[11px] font-semibold text-[#1A3ADB]">{quiz.courseId.title}</p>
        <h3 className="text-[15px] font-bold text-[#0D1220]">{quiz.title}</h3>
      </div>
      <p className="text-[12px] text-[#8A97B8]">
        {quiz.questions.length} questions · {quiz.timeLimit} min · Pass mark: {quiz.passMark}%
      </p>
      <div className="flex gap-2 mt-1">
        <button
          onClick={() => { setActiveQuiz(quiz); setModalMode("edit"); }}
          className="flex-1 py-2 rounded-xl bg-[#1A3ADB] text-white text-[12px] font-bold hover:bg-[#1228B0] transition-colors"
        >
          Edit
        </button>
        {confirmDeleteId === quiz._id ? (
          <div className="flex-1 flex gap-1">
            <button onClick={() => setConfirmDeleteId(null)} disabled={deleting} className="flex-1 py-2 rounded-xl border border-[#E4E8F5] text-[11px] font-semibold text-[#3D4A6B] disabled:opacity-60">
              Cancel
            </button>
            <button onClick={() => handleDelete(quiz._id)} disabled={deleting} className="flex-1 py-2 rounded-xl bg-[#EF4444] text-white text-[11px] font-bold disabled:opacity-60">
              {deleting ? "…" : "Confirm"}
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmDeleteId(quiz._id)} className="flex-1 py-2 rounded-xl border border-[#EF4444]/40 text-[#EF4444] text-[12px] font-bold hover:bg-[#FEE2E2] transition-colors">
            Delete
          </button>
        )}
      </div>
      {deleteError && confirmDeleteId === quiz._id && (
        <p className="text-[11px] text-red-600">{deleteError}</p>
      )}
    </div>
  ));

  return (
    <div className="flex flex-col gap-4 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-black text-[#0D1220]">Quiz Builder</h1>
          <p className="text-[12px] text-[#8A97B8]">Build and manage quizzes for your courses</p>
        </div>
        <button
          onClick={() => { setActiveQuiz(null); setModalMode("create"); }}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1A3ADB] text-white text-[12px] font-bold hover:bg-[#1228B0] transition-colors"
        >
          <Plus size={13} /> New Quiz
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl px-4 py-3">{error}</div>
      )}

      {loading ? (
        <p className="text-[13px] text-[#8A97B8]">Loading quizzes…</p>
      ) : quizzes.length === 0 ? (
        <p className="text-[13px] text-[#8A97B8]">No quizzes yet. Create one to get started.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">{quizCards}</div>
      )}

      {modalMode && (
        <QuizFormModal
          courses={courses}
          initial={modalMode === "edit" ? activeQuiz : null}
          onClose={() => setModalMode(null)}
          onSaved={() => { setModalMode(null); loadData(); }}
        />
      )}
    </div>
  );
}