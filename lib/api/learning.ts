// lib/api/learning.ts
//
// All course and lesson API calls live here.
// Three functions: getCourses, getCourse, markLessonComplete.

import api from "@/lib/axios";

// ─── TYPE DEFINITIONS ────────────────────────────────────────────────────────

// A single lesson inside a module
export interface Lesson {
  _id: string;
  title: string;           // e.g. "What is Python?"
  content: string;         // The full lesson text/HTML content
  estimatedMinutes: number;// e.g. 10
  order: number;           // Lesson position within its module (1, 2, 3...)
}

// A module groups related lessons together
export interface CourseModule {
  _id: string;
  title: string;    // e.g. "Python Basics"
  order: number;    // Module position within the course
  lessons: Lesson[];
}

// A full course object
export interface Course {
  _id: string;
  title: string;          // e.g. "Python for Beginners"
  description: string;
  category: string;       // e.g. "Python"
  level: string;          // "beginner" | "intermediate" | "advanced"
  instructor: string;     // e.g. "Sarah Okafor"
  totalLessons: number;
  modules: CourseModule[];
}

// Response shape for GET /api/learning/ (all courses)
interface GetCoursesResponse {
  success: boolean;
  data: {
    courses: Course[];
  };
}

// Response shape for GET /api/learning/:courseId (single course)
interface GetCourseResponse {
  success: boolean;
  data: {
    course: Course;
  };
}

// What we send to mark a lesson complete
interface MarkLessonCompletePayload {
  courseId: string;  // The course's _id
  lessonId: string;  // The lesson's _id
}

// What the server sends back after marking a lesson complete
interface MarkLessonCompleteResponse {
  success: boolean;
  completedLessons: string[];  // Array of completed lesson IDs
  progressPercent: number;     // 0–100 — use this to update the progress bar
}

// ─── GET ALL COURSES ─────────────────────────────────────────────────────────
// Fetches all available courses with their modules and lessons.
// Used on: app/(app)/courses/page.tsx (the Course Catalogue)
//
// Usage:
//   const response = await getCourses();
//   const courses = response.data.data.courses;
export async function getCourses() {
  const response = await api.get<GetCoursesResponse>("/api/learning/");
  // api.get(url) sends a GET request — no body needed for fetching data
  return response;
}

// ─── GET SINGLE COURSE ───────────────────────────────────────────────────────
// Fetches one course by its ID, with full module and lesson breakdown.
// Used on: app/(app)/courses/[courseId]/page.tsx (Course Detail page)
//
// Usage:
//   const response = await getCourse("64abc123...");
//   const course = response.data.data.course;
export async function getCourse(courseId: string) {
  const response = await api.get<GetCourseResponse>(`/api/learning/${courseId}`);
  // Template literal: inserts courseId into the URL path
  return response;
}

// ─── MARK LESSON COMPLETE ────────────────────────────────────────────────────
// Sends a PATCH request when a user finishes a lesson.
// Used on: app/(app)/courses/[courseId]/lessons/[lessonId]/page.tsx
//
// PATCH vs PUT:
//   PUT   → replaces the ENTIRE resource
//   PATCH → updates only PART of a resource (here, just adds one lesson to completed list)
//
// Usage:
//   const response = await markLessonComplete({
//     courseId: "64abc123...",
//     lessonId: "64def456...",
//   });
//   const { progressPercent } = response.data;
//   // Use progressPercent to update the progress bar in the UI
export async function markLessonComplete(payload: MarkLessonCompletePayload) {
  const response = await api.patch<MarkLessonCompleteResponse>(
    "/api/learning/lessons/complete",
    payload
  );
  return response;
}