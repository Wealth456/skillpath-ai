import api from "@/lib/axios";

export interface OverviewStats {
  totalUsers: number;
  totalCourses: number;
  totalDocuments: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  totalLessonsCompleted: number;
  averageCompletionRate: number;
}

export interface GrowthPoint {
  month: string;
  year: number;
  count: number;
}

export interface ActivityItem {
  type: string; // "lesson_complete" | "pdf_upload" | "quiz_attempt" | future types
  description: string;
  timestamp: string;
}

export interface TopCourse {
  courseTitle: string;
  category: string;
  enrollmentCount: number;
  averageProgress: number;
}

export interface RecentSignup {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  preferences?: { goal?: string };
}

export async function getOverviewStats(): Promise<OverviewStats> {
  const res = await api.get("/api/admin/overview");
  return res.data.data.stats;
}

export async function getUserGrowth(): Promise<GrowthPoint[]> {
  const res = await api.get("/api/admin/growth");
  return res.data.data.growth;
}

export async function getRecentActivity(): Promise<ActivityItem[]> {
  const res = await api.get("/api/admin/activity");
  return res.data.data.activity;
}

export async function getTopCourses(limit = 5): Promise<TopCourse[]> {
  const res = await api.get("/api/admin/courses/top", { params: { limit } });
  return res.data.data.courses;
}

export async function getRecentSignups(limit = 10): Promise<RecentSignup[]> {
  const res = await api.get("/api/admin/users/recent", { params: { limit } });
  return res.data.data.users;
}

// ─── USERS ───────────────────────────────────────────────────────────────

export interface AdminUserListItem {
  _id: string;
  name: string;
  email: string;
  role: string; // "admin" | "user"
  createdAt: string;
  preferences?: {
    goal?: string;
    currentLevel?: string;
    dailyTime?: number;
  };
}

export interface UsersListResponse {
  users: AdminUserListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UserEnrollment {
  _id: string;
  courseId: { _id: string; title: string; category: string };
  status: string;
  enrolledAt: string;
}

export interface UserProgress {
  _id: string;
  courseId: { _id: string; title: string };
  completedLessons: string[];
  lastAccessedAt: string;
  progressPercent: number;
}

export interface UserDetailResponse {
  user: AdminUserListItem;
  roadmap: unknown; // not used on this page
  enrollments: UserEnrollment[];
  progress: UserProgress[];
}

export async function getUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<UsersListResponse> {
  const res = await api.get("/api/admin/users", { params });
  return res.data.data;
}

export async function getUserDetail(userId: string): Promise<UserDetailResponse> {
  const res = await api.get(`/api/admin/users/${userId}`);
return res.data.data;
}

export async function updateUserRole(
  userId: string,
  role: "admin" | "user"
): Promise<void> {
  await api.patch(`/api/admin/users/${userId}/role`, { role });
}

// ─── COURSES ─────────────────────────────────────────────────────────────

export interface CourseLessonInput {
  title: string;
  content: string;
  estimatedMinutes: number;
  order: number;
}

export interface CourseModuleInput {
  title: string;
  order: number;
  lessons: CourseLessonInput[];
}

export interface CreateCoursePayload {
  title: string;
  description: string;
  category: string;
  level: string;
  instructor: string;
  modules: CourseModuleInput[];
}

export async function createCourse(payload: CreateCoursePayload) {
  const res = await api.post("/api/admin/courses", payload);
  return res.data.data.course;
}

export async function updateCourse(courseId: string, payload: CreateCoursePayload) {
  const res = await api.put(`/api/admin/courses/${courseId}`, payload);
  return res.data.data.course;
}

export async function deleteCourse(courseId: string) {
  const res = await api.delete(`/api/admin/courses/${courseId}`);
  return res.data;
}

// ─── QUIZZES ─────────────────────────────────────────────────────────────

export interface QuizQuestionInput {
  question: string;
  options: string[];
  correctAnswer: string; // must exactly match one of options[]
  explanation: string;
}

export interface QuizListItem {
  _id: string;
  lessonId: string;
  courseId: { _id: string; title: string; category: string };
  title: string;
  questions: (QuizQuestionInput & { _id: string })[];
  passMark: number;
  timeLimit: number;
  createdAt: string;
}

export interface QuizPayload {
  lessonId: string;
  courseId: string;
  title: string;
  questions: QuizQuestionInput[];
  passMark: number;
  timeLimit: number;
}

export async function getQuizzes(): Promise<QuizListItem[]> {
  const res = await api.get("/api/admin/quizzes");
  return res.data.data.quizzes;
}

export async function createQuiz(payload: QuizPayload) {
  const res = await api.post("/api/admin/quizzes", payload);
  return res.data.data.quiz ?? res.data.data;
}

export async function updateQuiz(quizId: string, payload: QuizPayload) {
  const res = await api.put(`/api/admin/quizzes/${quizId}`, payload);
  return res.data.data.quiz ?? res.data.data;
}

export async function deleteQuiz(quizId: string) {
  const res = await api.delete(`/api/admin/quizzes/${quizId}`);
  return res.data;
}

// ─── SETTINGS ────────────────────────────────────────────────────────────

export interface PlatformSettings {
  maintenanceMode: boolean;
  quizPassMark: number;
}

export async function getSettings(): Promise<PlatformSettings> {
  const res = await api.get("/api/admin/settings");
  return res.data.data.settings ?? res.data.data;
}

export async function updateSettings(payload: Partial<PlatformSettings>): Promise<PlatformSettings> {
  const res = await api.patch("/api/admin/settings", payload);
  return res.data.data.settings ?? res.data.data;
}