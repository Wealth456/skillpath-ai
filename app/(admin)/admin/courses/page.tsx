"use client";

import { useEffect, useState } from "react";
import { Search, Trash2, BookOpen, Layers, Plus, X, Pencil } from "lucide-react";
import { getCourses, Course } from "@/lib/api/learning";
import {
  getTopCourses,
  deleteCourse,
  createCourse,
  updateCourse,
  TopCourse,
  CreateCoursePayload,
  CourseModuleInput,
} from "@/lib/api/admin";

const LEVELS = ["beginner", "intermediate", "advanced"];

function formatLevel(level?: string) {
  if (!level) return "—";
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function emptyModule(): CourseModuleInput {
  return { title: "", order: 1, lessons: [emptyLesson()] };
}
function emptyLesson() {
  return { title: "", content: "", estimatedMinutes: 10, order: 1 };
}

// ─────────────────────────────────────────────────────────────
// CREATE / EDIT MODAL
// ─────────────────────────────────────────────────────────────

function CourseFormModal({
  categories,
  initial,
  onClose,
  onSaved,
}: {
  categories: string[];
  initial: Course | null; // null = create mode
  onClose: () => void;
  onSaved: (course: Course) => void;
}) {
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? categories[0] ?? "");
  const [level, setLevel] = useState(initial?.level ?? "beginner");
  const [instructor, setInstructor] = useState(initial?.instructor ?? "");
  const [modules, setModules] = useState<CourseModuleInput[]>(
    initial
      ? initial.modules.map((m, mi) => ({
          title: m.title,
          order: mi + 1,
          lessons: m.lessons.map((l, li) => ({
            title: l.title,
            content: l.content,
            estimatedMinutes: l.estimatedMinutes,
            order: li + 1,
          })),
        }))
      : [emptyModule()]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateModule(i: number, patch: Partial<CourseModuleInput>) {
    setModules((prev) => prev.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  }

  function addModule() {
    setModules((prev) => [...prev, { ...emptyModule(), order: prev.length + 1 }]);
  }

  function removeModule(i: number) {
    setModules((prev) =>
      prev.filter((_, idx) => idx !== i).map((m, idx) => ({ ...m, order: idx + 1 }))
    );
  }

  function updateLesson(mi: number, li: number, patch: Partial<CourseModuleInput["lessons"][0]>) {
    setModules((prev) =>
      prev.map((m, idx) =>
        idx !== mi
          ? m
          : { ...m, lessons: m.lessons.map((l, lidx) => (lidx === li ? { ...l, ...patch } : l)) }
      )
    );
  }

  function addLesson(mi: number) {
    setModules((prev) =>
      prev.map((m, idx) =>
        idx !== mi ? m : { ...m, lessons: [...m.lessons, { ...emptyLesson(), order: m.lessons.length + 1 }] }
      )
    );
  }

  function removeLesson(mi: number, li: number) {
    setModules((prev) =>
      prev.map((m, idx) =>
        idx !== mi
          ? m
          : {
              ...m,
              lessons: m.lessons
                .filter((_, lidx) => lidx !== li)
                .map((l, lidx) => ({ ...l, order: lidx + 1 })),
            }
      )
    );
  }

  async function handleSave() {
    setError(null);

    if (!title.trim() || !description.trim() || !category || !instructor.trim()) {
      setError("Please fill in all course fields.");
      return;
    }
    if (modules.some((m) => !m.title.trim() || m.lessons.some((l) => !l.title.trim() || !l.content.trim()))) {
      setError("Every module and lesson needs a title, and lessons need content.");
      return;
    }

    const payload: CreateCoursePayload = {
      title: title.trim(),
      description: description.trim(),
      category,
      level,
      instructor: instructor.trim(),
      modules,
    };

    setSaving(true);
    try {
      const saved = isEdit
        ? await updateCourse(initial!._id, payload)
        : await createCourse(payload);
      onSaved(saved);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save course.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] px-6 py-8">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-[#E4E8F5] px-6 py-4 flex items-center justify-between">
          <h3 className="text-[16px] font-black text-[#0D1220]">
            {isEdit ? "Edit Course" : "New Course"}
          </h3>
          <button onClick={onClose} className="text-[#8A97B8] hover:text-[#0D1220]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="text-[12px] font-semibold text-[#3D4A6B] mb-1.5 block">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20"
            />
          </div>

          <div>
            <label className="text-[12px] font-semibold text-[#3D4A6B] mb-1.5 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[12px] font-semibold text-[#3D4A6B] mb-1.5 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-[#3D4A6B] mb-1.5 block">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{formatLevel(l)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-[#3D4A6B] mb-1.5 block">Instructor</label>
              <input
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20"
              />
            </div>
          </div>

          {/* Modules builder */}
          <div className="flex flex-col gap-3 border-t border-[#E4E8F5] pt-4">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-[#0D1220]">Modules</label>
              <button
                onClick={addModule}
                className="flex items-center gap-1 text-[12px] font-semibold text-[#1A3ADB] hover:underline"
              >
                <Plus size={13} /> Add module
              </button>
            </div>

            {modules.map((mod, mi) => (
              <div key={mi} className="rounded-xl border border-[#E4E8F5] bg-[#F7F8FC] p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#8A97B8] font-bold w-6">#{mi + 1}</span>
                  <input
                    value={mod.title}
                    onChange={(e) => updateModule(mi, { title: e.target.value })}
                    placeholder="Module title"
                    className="flex-1 px-3 py-2 rounded-lg border border-[#E4E8F5] bg-white text-[12px] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20"
                  />
                  {modules.length > 1 && (
                    <button onClick={() => removeModule(mi)} className="text-[#EF4444] hover:opacity-70">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2 pl-8">
                  {mod.lessons.map((lesson, li) => (
                    <div key={li} className="rounded-lg border border-[#E4E8F5] bg-white p-3 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#8A97B8] font-bold w-5">L{li + 1}</span>
                        <input
                          value={lesson.title}
                          onChange={(e) => updateLesson(mi, li, { title: e.target.value })}
                          placeholder="Lesson title"
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#E4E8F5] text-[12px] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20"
                        />
                        <input
                          type="number"
                          min={1}
                          value={lesson.estimatedMinutes}
                          onChange={(e) => updateLesson(mi, li, { estimatedMinutes: Number(e.target.value) })}
                          className="w-16 px-2 py-1.5 rounded-lg border border-[#E4E8F5] text-[12px] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20"
                          title="Estimated minutes"
                        />
                        {mod.lessons.length > 1 && (
                          <button onClick={() => removeLesson(mi, li)} className="text-[#EF4444] hover:opacity-70">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <textarea
                        value={lesson.content}
                        onChange={(e) => updateLesson(mi, li, { content: e.target.value })}
                        placeholder="Lesson content"
                        rows={2}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#E4E8F5] text-[12px] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20 resize-none"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => addLesson(mi)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#1A3ADB] hover:underline self-start"
                  >
                    <Plus size={12} /> Add lesson
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-[#E4E8F5] px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] font-semibold text-[#3D4A6B] hover:bg-[#F7F8FC] transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#1A3ADB] text-white text-[13px] font-bold hover:bg-[#1228B0] transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create course"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);

  function loadData() {
    setLoading(true);
    setError(null);
    Promise.all([getCourses(), getTopCourses(10)])
      .then(([coursesRes, topRes]) => {
        const list = coursesRes.data.data.courses;
        setCourses(list);

        console.log("COURSES DEBUG:", list);
        setTopCourses(topRes);
        if (list.length > 0 && !selectedId) setSelectedId(list[0]._id);
      })
      .catch((err) => setError(err?.response?.data?.message || "Failed to load courses."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived from real course data only — never a hardcoded guess, since
  // `category` is an enum on the backend we can't fully enumerate from docs.
  const categories = Array.from(new Set(courses.map((c) => c.category))).sort();

  function findTopMatch(course: Course): TopCourse | undefined {
    // Title-string match only — courses/top has no _id to join on.
    // Can misfire on renamed/duplicate titles; flagged here deliberately.
    return topCourses.find((t) => t.courseTitle === course.title);
  }

  const filtered = courses.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));
  const selectedCourse = courses.find((c) => c._id === selectedId) || null;
  const selectedTopMatch = selectedCourse ? findTopMatch(selectedCourse) : undefined;

  async function handleDelete(courseId: string) {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteCourse(courseId);
      const remaining = courses.filter((c) => c._id !== courseId);
      setCourses(remaining);
      setConfirmDeleteId(null);
      setSelectedId(remaining.length > 0 ? remaining[0]._id : null);
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || "Failed to delete course.");
    } finally {
      setDeleting(false);
    }
  }

  function handleSaved(course: Course) {
    setModalMode(null);
    loadData();
    setSelectedId(course._id);
  }

  const courseRows = filtered.map((course) => {
    const isSelected = selectedId === course._id;
    const topMatch = findTopMatch(course);
    return (
      <tr
        key={course._id}
        onClick={() => setSelectedId(course._id)}
        className={`border-b border-[#E4E8F5] cursor-pointer transition-colors ${
          isSelected ? "bg-[#E8EDFF]" : "hover:bg-[#F7F8FC]"
        }`}
      >
        <td className="py-3 px-4">
          {isSelected && <span className="inline-block w-1 h-5 bg-[#1A3ADB] rounded-full mr-2 align-middle" />}
          <span className={`text-[13px] font-semibold ${isSelected ? "text-[#1A3ADB]" : "text-[#0D1220]"}`}>
            {course.title}
          </span>
        </td>
        <td className="py-3 px-4 text-[13px] text-[#3D4A6B]">{course.category}</td>
        <td className="py-3 px-4 text-[13px] text-[#3D4A6B]">{course.instructor}</td>
        <td className="py-3 px-4 text-[13px] text-[#3D4A6B]">{formatLevel(course.level)}</td>
        <td className="py-3 px-4 text-[13px] text-[#3D4A6B]">{course.totalLessons}</td>
        <td className="py-3 px-4 text-[12px] font-semibold" style={{ color: "#1A3ADB" }}>
          {topMatch ? `${topMatch.enrollmentCount} enrolled` : "—"}
        </td>
      </tr>
    );
  });

  return (
    <div className="flex gap-5 min-h-screen">
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-black text-[#0D1220]">Course Management</h1>
            <p className="text-[12px] text-[#8A97B8]">Create, edit and manage all platform courses</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A97B8]" />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-4 py-2 rounded-xl border border-[#E4E8F5] bg-white text-[12px] placeholder-[#8A97B8] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20 w-48"
              />
            </div>
            <button
              onClick={() => setModalMode("create")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A3ADB] text-white text-[12px] font-bold hover:bg-[#1228B0] transition-colors"
            >
              <Plus size={14} /> New Course
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl px-4 py-3">{error}</div>
        )}

        <div className="bg-white rounded-2xl border border-[#E4E8F5] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E4E8F5] bg-[#F7F8FC]">
                <th className="py-3 px-4 text-left text-[12px] font-bold text-[#1A3ADB]">Course Title</th>
                <th className="py-3 px-4 text-left text-[12px] font-bold text-[#1A3ADB]">Category</th>
                <th className="py-3 px-4 text-left text-[12px] font-bold text-[#1A3ADB]">Instructor</th>
                <th className="py-3 px-4 text-left text-[12px] font-bold text-[#1A3ADB]">Level</th>
                <th className="py-3 px-4 text-left text-[12px] font-bold text-[#1A3ADB]">Lessons</th>
                <th className="py-3 px-4 text-left text-[12px] font-bold text-[#1A3ADB]">Enrollment</th>
              </tr>
            </thead>
            <tbody>{courseRows}</tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="py-16 text-center text-[#8A97B8] text-[13px]">No courses match your search.</div>
          )}
          {loading && <div className="py-16 text-center text-[#8A97B8] text-[13px]">Loading courses…</div>}
        </div>
      </div>

      {selectedCourse && (
        <div className="w-[300px] flex-shrink-0 bg-white rounded-2xl border border-[#E4E8F5] p-5 flex flex-col gap-4 h-fit sticky top-6">
          <h3 className="text-[14px] font-bold text-[#1A3ADB]">Course Details</h3>

          <div>
            <h4 className="text-[16px] font-black text-[#0D1220]">{selectedCourse.title}</h4>
            <p className="text-[12px] text-[#8A97B8] mt-0.5">by {selectedCourse.instructor}</p>
          </div>

          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#F7F8FC] border border-[#E4E8F5]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-[#1A3ADB] text-white text-[11px] font-bold">
                {formatLevel(selectedCourse.level)}
              </span>
              <span className="text-[11px] text-[#8A97B8] flex items-center gap-1">
                <Layers size={11} /> {selectedCourse.modules.length} modules
              </span>
              <span className="text-[11px] text-[#8A97B8] flex items-center gap-1">
                <BookOpen size={11} /> {selectedCourse.totalLessons} lessons
              </span>
            </div>
            <p className="text-[11px] text-[#8A97B8] line-clamp-3 mt-1">{selectedCourse.description}</p>
          </div>

          {selectedTopMatch ? (
            <div>
              <p className="text-[11px] text-[#8A97B8] mb-1.5">Avg. completion</p>
              <div className="w-full h-2 bg-[#E5E9F5] rounded-full overflow-hidden mb-1">
                <div className="h-full bg-[#1A3ADB] rounded-full" style={{ width: `${selectedTopMatch.averageProgress}%` }} />
              </div>
              <p className="text-[11px] font-bold text-[#1A3ADB]">
                {selectedTopMatch.averageProgress.toFixed(0)}% avg · {selectedTopMatch.enrollmentCount} enrolled
              </p>
            </div>
          ) : (
            <p className="text-[11px] text-[#8A97B8]">No enrollment data available for this course yet.</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setModalMode("edit")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#1A3ADB] text-white text-[12px] font-bold hover:bg-[#1228B0] transition-colors"
            >
              <Pencil size={12} /> Edit course
            </button>
          </div>

          <div className="flex flex-col gap-2 border-t border-[#E4E8F5] pt-3">
            {confirmDeleteId !== selectedCourse._id ? (
              <button
                onClick={() => { setConfirmDeleteId(selectedCourse._id); setDeleteError(null); }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[#EF4444]/40 text-[#EF4444] text-[12px] font-bold hover:bg-[#FEE2E2] transition-colors"
              >
                <Trash2 size={12} /> Delete course
              </button>
            ) : (
              <div className="rounded-xl border border-[#EF4444]/30 bg-[#FEE2E2] p-3 flex flex-col gap-2">
                <p className="text-[12px] text-[#7F1D1D]">
                  Delete "{selectedCourse.title}" and all related data? This can&apos;t be undone.
                </p>
                {deleteError && <p className="text-[11px] text-red-700">{deleteError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    disabled={deleting}
                    className="flex-1 py-2 rounded-lg border border-[#E4E8F5] bg-white text-[11px] font-semibold text-[#3D4A6B] hover:bg-[#F7F8FC] transition-colors disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(selectedCourse._id)}
                    disabled={deleting}
                    className="flex-1 py-2 rounded-lg bg-[#EF4444] hover:opacity-90 text-white text-[11px] font-bold transition-colors disabled:opacity-60"
                  >
                    {deleting ? "Deleting…" : "Confirm"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {modalMode && (
        <CourseFormModal
          categories={categories.length > 0 ? categories : ["General"]}
          initial={modalMode === "edit" ? selectedCourse : null}
          onClose={() => setModalMode(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}