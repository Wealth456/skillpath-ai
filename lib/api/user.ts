// lib/api/user.ts
//
// User-related API calls.
// - updateProfile() — used at the end of onboarding to save goal, level, dailyTime.
// - getProfile()    — fetches the logged-in user's full profile (name, email,
//                      role, preferences, createdAt). Used on the Profile page
//                      and to verify admin access.

import api from "@/lib/axios";
// The shared Axios instance already injects the Bearer token,
// so we don't need to touch headers here.

// ─── TYPE DEFINITIONS ────────────────────────────────────────────────────────

interface UpdateProfilePayload {
  goal: string;
  currentLevel: "beginner" | "intermediate" | "advanced";
  dailyTime: number;
}

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

// What the server sends back for GET /api/user/profile
interface GetProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      role: string; // "admin" | "user" — confirmed present on this endpoint
      createdAt: string;
      preferences: {
        goal: string;
        currentLevel: string;
        dailyTime: number;
      };
    };
  };
}

// ─── UPDATE PROFILE ──────────────────────────────────────────────────────────

export async function updateProfile(payload: UpdateProfilePayload) {
  const response = await api.put<UpdateProfileResponse>(
    "/api/user/profile",
    payload
  );
  return response;
}

// ─── GET PROFILE ─────────────────────────────────────────────────────────────
// Fetches the currently logged-in user's full profile — name, email, role,
// createdAt, and preferences. This is the single source of truth used both
// by the Profile page and by the admin layout guard, so access decisions
// are always verified against the API rather than a cached value.
//
// Usage:
//   const response = await getProfile();
//   const user = response.data.data.user;

export async function getProfile() {
  const response = await api.get<GetProfileResponse>("/api/user/profile");
  return response;
}