// lib/api/learning.ts
//
// All course, lesson, enrollment, and progress API calls live here.
// Functions: getCourses, getCourse, markLessonComplete,
//            enrollInCourse, getEnrollments, getProgressSummary.

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
  message: string;
  data: {
    progress: {
      _id: string;
      courseId: string;
      userId: string;
      completedLessons: string[];  // Array of completed lesson IDs
      progressPercent: number;     // 0–100 — use this to update the progress bar
      lastAccessedAt: string;
    };
  };
}

// ─── ENROLLMENT TYPES ────────────────────────────────────────────────────────
//
// NOTE: the backend docs describe what these endpoints return in prose,
// not an exact JSON sample. The shapes below are a best-guess following
// the same { success, data: {...} } pattern as the rest of this file.
// If the real response differs, the fix is just editing the interface
// fields here — every function below is already typed against these,
// so a mismatch will show up as a TypeScript error at the call site
// instead of a silent runtime bug.

// A single enrollment record — returned by POST /enroll and
// (as an array) by GET /enrollments.
export interface Enrollment {
  enrollment: {
    _id: string;
    enrolledAt: string;
    status: string;
  };
  course: Course;
  progress: {
    progressPercent: number;     // 0–100
    completedLessons: string[];  // array of completed lesson IDs for this course
    lastAccessedAt: string;
  };
}

// Response shape for POST /api/learning/enroll
interface NewEnrollment {
  _id: string;
  userId: string;
  courseId: string;
  status: string;
  enrolledAt: string;
}

interface EnrollResponse {
  success: boolean;
  message: string;
  data: {
    enrollment: NewEnrollment;
  };
}

// Response shape for GET /api/learning/enrollments
interface GetEnrollmentsResponse {
  success: boolean;
  data: {
    enrollments: Enrollment[];
  };
}

// Per-course row inside the progress summary
export interface CourseProgressBreakdown {
  courseId: string;
  courseTitle: string;
  progressPercent: number;     // 0–100
  completedLessons: number;
  totalLessons: number;
}

// Overall stats block inside the progress summary
export interface ProgressSummary {
  totalCoursesStarted: number;
  totalLessonsCompleted: number;
  averageProgress: number;     // 0–100
  courses: CourseProgressBreakdown[];
}

// Response shape for GET /api/learning/progress/summary
interface GetProgressSummaryResponse {
  success: boolean;
  data: {
    summary: ProgressSummary;
  };
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
// Used on: app/(lesson)/courses/[courseId]/lessons/[lessonId]/page.tsx
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

// ─── ENROLL IN COURSE ────────────────────────────────────────────────────────
// Sends a POST request when a user clicks "Enroll now" on a course.
// Used on: app/(app)/courses/page.tsx (Course Catalogue — "Enroll now" button)
//          app/(app)/courses/[courseId]/page.tsx (Course Detail — enroll CTA)
//
// Expected: 201 Created with the new enrollment object.
//
// Usage:
//   const response = await enrollInCourse("64abc123...");
//   const enrollment = response.data.data.enrollment;
export async function enrollInCourse(courseId: string) {
  const response = await api.post<EnrollResponse>("/api/learning/enroll", {
    courseId,
  });
  return response;
}

// ─── GET ENROLLED COURSES ────────────────────────────────────────────────────
// Fetches every course the current user is enrolled in, with progress data
// attached to each one. This REPLACES reading `skillpath_enrolled_courses`
// and per-course `skillpath_completed_<courseId>` from localStorage.
// Used on: app/(app)/courses/page.tsx (to show "Enrolled" state + progress)
//          app/(app)/dashboard/page.tsx (to list in-progress courses)
//
// Usage:
//   const response = await getEnrollments();
//   const enrollments = response.data.data.enrollments;
export async function getEnrollments() {
  const response = await api.get<GetEnrollmentsResponse>(
    "/api/learning/enrollments"
  );
  return response;
}

// ─── GET PROGRESS SUMMARY ────────────────────────────────────────────────────
// Fetches aggregate progress stats across all of the user's enrolled courses
// (total courses started, total lessons completed, average progress) plus
// a per-course breakdown.
// Used on: app/(app)/dashboard/page.tsx (dashboard stat cards)
//
// Usage:
//   const response = await getProgressSummary();
//   const summary = response.data.data.summary;
export async function getProgressSummary() {
  const response = await api.get<GetProgressSummaryResponse>(
    "/api/learning/progress/summary"
  );
  return response;
}