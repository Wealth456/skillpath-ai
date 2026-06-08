// lib/api/user.ts
//
// User-related API calls.
// Currently: updateProfile() — used at the end of onboarding
// to save the user's goal, level, and daily study time.

import api from "@/lib/axios";
// The shared Axios instance already injects the Bearer token,
// so we don't need to touch headers here.

// ─── TYPE DEFINITIONS ────────────────────────────────────────────────────────

// The three fields collected across onboarding Steps 1–3
interface UpdateProfilePayload {
  goal: string;
  // e.g. "Become a Frontend Developer", "Learn Python"

  currentLevel: "beginner" | "intermediate" | "advanced";
  // TypeScript union type — only these three strings are allowed.
  // If you type "Beginner" (capital B), TypeScript warns you.

  dailyTime: number;
  // Minutes per day the user wants to study. e.g. 30, 60, 120
}

// What the server sends back after a successful profile update
interface UpdateProfileResponse {
  success: boolean;
  user: {
    _id: string;
    name: string;
    email: string;
    goal: string;
    currentLevel: string;
    dailyTime: number;
    onboardingComplete: boolean;
  };
}

// ─── UPDATE PROFILE ──────────────────────────────────────────────────────────
// Sends a PUT request to /api/user/profile.
// The Authorization header is added automatically by lib/axios.ts.
//
// Called from: app/onboarding/time/page.tsx (the last onboarding step)
// After this succeeds → call generateRoadmap() → redirect to /dashboard
//
// Usage:
//   const response = await updateProfile({
//     goal: "Become a Frontend Dev",
//     currentLevel: "beginner",
//     dailyTime: 60,
//   });
export async function updateProfile(payload: UpdateProfilePayload) {
  const response = await api.put<UpdateProfileResponse>(
    "/api/user/profile",
    payload
    // api.put(url, body) — sends a PUT request with the payload as JSON body
  );
  return response;
}