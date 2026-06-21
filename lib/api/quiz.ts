// lib/api/quiz.ts
//
// Quiz API calls. Quizzes are generated per-lesson by AI,
// cached after first generation, and scored server-side.

import api from "@/lib/axios";

// ─── TYPE DEFINITIONS ────────────────────────────────────────────────────────

// A single quiz question with 4 options
export interface QuizQuestionOption {
  text: string;
}

export interface QuizQuestion {
  _id: string;
  question: string;
  options: string[]; // 4 option strings — correct answer hidden until submit
}

// The quiz object returned by generate/get endpoints
export interface Quiz {
  _id: string;
  lessonId: string;
  courseId: string;
  questions: QuizQuestion[];
  passMark: number;     // e.g. 70
  timeLimitMinutes: number; // e.g. 15
}

// Response shapes
interface GenerateQuizResponse {
  success: boolean;
  data: { quiz: Quiz };
}

interface GetQuizResponse {
  success: boolean;
  data: { quiz: Quiz };
}

// Submit payload
interface SubmitQuizPayload {
  answers: string[]; // exact option text, in question order
  timeTaken: number;  // seconds
}

// A single question's breakdown after submission
export interface QuizBreakdownItem {
  question: string;
  yourAnswer: string;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
}

// Full submission result
export interface QuizResult {
  score: number;          // percentage e.g. 80
  passed: boolean;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  passMark: number;
  timeTaken: number;
  breakdown: QuizBreakdownItem[];
}

interface SubmitQuizResponse {
  success: boolean;
  data: QuizResult;
}

// A single past attempt
export interface QuizAttempt {
  _id: string;
  score: number;
  passed: boolean;
  timeTaken: number;
  createdAt: string;
}

interface GetAttemptsResponse {
  success: boolean;
  data: { attempts: QuizAttempt[] };
}

// ─── GENERATE QUIZ ────────────────────────────────────────────────────────────
// Generates a quiz for a lesson using AI. Only generates once —
// subsequent calls return the same cached quiz.
//
// Usage:
//   const response = await generateQuiz({ lessonId, courseId });
//   const quiz = response.data.data.quiz;
export async function generateQuiz(payload: { lessonId: string; courseId: string }) {
  const response = await api.post<GenerateQuizResponse>("/api/quiz/generate", payload);
  return response;
}

// ─── GET QUIZ FOR LESSON ──────────────────────────────────────────────────────
// Fetches the existing quiz for a lesson (correct answers hidden).
//
// Usage:
//   const response = await getQuizForLesson(lessonId);
//   const quiz = response.data.data.quiz;
export async function getQuizForLesson(lessonId: string) {
  const response = await api.get<GetQuizResponse>(`/api/quiz/lesson/${lessonId}`);
  return response;
}

// ─── SUBMIT QUIZ ──────────────────────────────────────────────────────────────
// Submits the user's answers and returns score + breakdown.
//
// Usage:
//   const response = await submitQuiz(quizId, { answers, timeTaken });
//   const result = response.data.data;
export async function submitQuiz(quizId: string, payload: SubmitQuizPayload) {
  const response = await api.post<SubmitQuizResponse>(`/api/quiz/${quizId}/submit`, payload);
  return response;
}

// ─── GET PREVIOUS ATTEMPTS ────────────────────────────────────────────────────
// Fetches all past attempts by the logged-in user for a quiz, newest first.
//
// Usage:
//   const response = await getQuizAttempts(quizId);
//   const attempts = response.data.data.attempts;
export async function getQuizAttempts(quizId: string) {
  const response = await api.get<GetAttemptsResponse>(`/api/quiz/${quizId}/attempts`);
  return response;
}