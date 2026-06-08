// lib/api/auth.ts
//
// All authentication API calls live here.
// This file exports two functions: register() and login().
// Both use the shared `api` instance from lib/axios.ts —
// never import axios directly.

import api from "@/lib/axios";
// "@/lib/axios" → "@/" is a TypeScript path alias for your project root.
// This is the same as "../../lib/axios" but cleaner.

// ─── TYPE DEFINITIONS ────────────────────────────────────────────────────────
// TypeScript interfaces describe the SHAPE of data.
// If you pass the wrong fields, TypeScript will warn you immediately.

// What we send to the register endpoint
interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

// What we send to the login endpoint
interface LoginPayload {
  email: string;
  password: string;
}

// What the login endpoint sends back
// (register doesn't return a token — user must login after)
interface AuthResponse {
  token: string;       // JWT token — save this to localStorage
  user?: {             // "?" means this field is optional
    _id: string;
    name: string;
    email: string;
    onboardingComplete?: boolean;
  };
}

// ─── REGISTER ────────────────────────────────────────────────────────────────
// Sends a POST request to /api/auth/register with name, email, password.
// Returns the full Axios response object.
// The caller (your register page) will check response.data for success/failure.
//
// Usage in a component:
//   const response = await register({ name, email, password });
//   console.log(response.data); // { success: true, ... }
export async function register(payload: RegisterPayload) {
  // api.post<T>(url, data) sends a POST request.
  // The generic <AuthResponse> tells TypeScript what shape response.data has.
  const response = await api.post<AuthResponse>("/api/auth/register", payload);
  return response;
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
// Sends a POST request to /api/auth/login with email and password.
// On success: saves the token to localStorage, then returns the response.
//
// Usage in a component:
//   const response = await login({ email, password });
//   // token is already saved — you can redirect immediately
export async function login(payload: LoginPayload) {
  const response = await api.post<AuthResponse>("/api/auth/login", payload);

  const data = response.data as unknown as Record<string, unknown>;
  const inner = data?.data as Record<string, unknown> | undefined;

  const token = inner?.token as string | undefined;
  if (token) {
    localStorage.setItem("skillpath_token", token);
  }

  const user = inner?.user as Record<string, unknown> | undefined;

  const name = user?.name as string | undefined;
  if (name) {
    localStorage.setItem("skillpath_name", name);
  }

  const preferences = user?.preferences as Record<string, unknown> | undefined;
  if (preferences) {
    localStorage.setItem("skillpath_preferences", JSON.stringify(preferences));
  }

  return response;
}