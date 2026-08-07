// lib/api/auth.ts
//
// All authentication API calls live here.
// This file exports two functions: register() and login().
// Both use the shared `api` instance from lib/axios.ts —
// never import axios directly.

import api from "@/lib/axios";
import axios from "axios";

// ─── TYPE DEFINITIONS ────────────────────────────────────────────────────────

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    role?: string; // "admin" | "user" — added so the app can branch on it
    onboardingComplete?: boolean;
  };
}

// ─── REGISTER ──────────────────────────────────────────────────────────────

export async function register(payload: RegisterPayload) {
  const response = await api.post<AuthResponse>("/api/auth/register", payload);
  return response;
}

// ─── LOGIN ─────────────────────────────────────────────────────────────────

export async function login(payload: LoginPayload) {
  const response = await api.post<AuthResponse>("/api/auth/login", payload);
  const data  = response.data as unknown as Record<string, unknown>;
  const inner = data?.data as Record<string, unknown> | undefined;

  // Clear any roadmap left over from a PREVIOUS user's session in this
  // browser. skillpath_roadmap is not scoped per-user, so without this,
  // logging in as a different account can display someone else's roadmap
  // before the fresh one is fetched/generated.
  localStorage.removeItem("skillpath_roadmap");

  sessionStorage.removeItem("skillpath_search_query");

  const token = inner?.token as string | undefined;
  if (token) {
    localStorage.setItem("skillpath_token", token);
  }

  const user = inner?.user as Record<string, unknown> | undefined;

  const email = user?.email as string | undefined;
  if (email) {
    localStorage.setItem("skillpath_email", email);
  }

  const userId = user?._id as string | undefined;
  if (userId) {
    localStorage.setItem("skillpath_user_id", userId);
  }

  const name = user?.name as string | undefined;
  if (name) {
    localStorage.setItem("skillpath_name", name);
  }

  const role = user?.role as string | undefined;
  if (role) {
    localStorage.setItem("skillpath_role", role);
  } else {
    // Defensive: if a previous admin session left a stale role behind
    // and this login response has none, don't let it leak forward.
    localStorage.removeItem("skillpath_role");
  }

  const preferences = user?.preferences as Record<string, unknown> | undefined;
  if (preferences) {
    localStorage.setItem("skillpath_preferences", JSON.stringify(preferences));
  }

  return response;
}

// ─── LOGOUT ────────────────────────────────────────────────────────────────
// Centralised so both the learner app and the admin panel clear the exact
// same set of keys — avoids leftover state from a previous session leaking
// into a fresh login.

export function logout() {
  localStorage.removeItem("skillpath_token");
  localStorage.removeItem("skillpath_role");
  localStorage.removeItem("skillpath_email");
  localStorage.removeItem("skillpath_user_id");
  localStorage.removeItem("skillpath_name");
  localStorage.removeItem("skillpath_preferences");
  localStorage.removeItem("skillpath_roadmap");
  window.location.href = "/login";
}

// Used only for logout password re-verification. Bypasses the shared
// `api` instance's interceptor, which treats any 401 as "session expired"
// and force-redirects — wrong behavior here, since a wrong password on
// logout confirmation is expected user error, not an expired session.
export async function verifyPassword(email: string, password: string): Promise<boolean> {
  try {
    await axios.post("https://skillpath-backend.symplax.app/api/auth/login", {
      email,
      password,
    });
    return true;
  } catch {
    return false;
  }
}