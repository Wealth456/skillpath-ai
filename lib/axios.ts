// lib/axios.ts
//
// This file creates ONE shared Axios instance for the entire app.
// WHY? So we only configure the base URL and auth token in ONE place.
// Every API file (auth.ts, user.ts, etc.) imports `api` from here.
// If the backend URL ever changes, we change it ONLY in this file.

import axios from "axios";

// ─── CREATE THE AXIOS INSTANCE ───────────────────────────────────────────────
// axios.create() lets us set defaults that apply to every request made
// through this instance. Think of it as a pre-configured fetch.
const api = axios.create({
  baseURL: "https://skillpath-backend-7bkn.onrender.com",
  // baseURL: every request will be prefixed with this.
  // So api.get("/api/learning/") becomes a request to:
  // https://skillpath-backend-7bkn.onrender.com/api/learning/

  headers: {
    "Content-Type": "application/json",
    // Tells the server we're sending JSON in the request body.
    // The server expects this for all POST/PUT requests.
  },
});

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
// An interceptor runs BEFORE every request is sent.
// This one reads the JWT token from localStorage and adds it to
// the Authorization header automatically — so we never have to
// manually add the token in each API call.
//
// Flow:
//   1. User logs in → token saved to localStorage as "skillpath_token"
//   2. User makes any API call → interceptor runs
//   3. Interceptor reads token from localStorage
//   4. If token exists → adds "Authorization: Bearer <token>" header
//   5. Request is sent with the header attached
api.interceptors.request.use(
  (config) => {
    // interceptors only run in the browser (localStorage doesn't exist on server)
    // typeof window !== "undefined" checks we're in a browser environment
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("skillpath_token");
      // localStorage.getItem returns null if the key doesn't exist

      if (token) {
        // config.headers is the headers object for THIS specific request
        // We're adding the Authorization header with the Bearer token format
        // required by the backend: "Bearer eyJhbGci..."
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // IMPORTANT: always return config — if you forget this,
    // the request never gets sent!
    return config;
  },
  (error) => {
    // If something goes wrong BEFORE the request is sent,
    // reject the promise so the calling code can catch it.
    return Promise.reject(error);
  }
);

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
// Runs AFTER every response comes back from the server.
// We use this to handle 401 Unauthorized globally —
// if the token is expired or invalid, we clear it and send
// the user back to login automatically.
api.interceptors.response.use(
  (response) => {
    // Success (2xx status) → just pass the response through unchanged
    return response;
  },
  (error) => {
    // error.response exists when the server replied with an error status
    // (4xx, 5xx). It's undefined if there was a network failure.
    if (error.response?.status === 401) {
      // 401 = "Unauthorized" — the token is missing, expired, or invalid
      if (typeof window !== "undefined") {
        localStorage.removeItem("skillpath_token");
        // Clear the bad token so the user isn't stuck in a broken state

        window.location.href = "/login";
        // Hard redirect to login page.
        // We use window.location (not Next.js router) here because
        // this interceptor lives outside React components.
      }
    }

    // Always reject so the individual API call can handle
    // its own error state (show an error message, etc.)
    return Promise.reject(error);
  }
);

// ─── EXPORT ──────────────────────────────────────────────────────────────────
// Export as default so every API file can do:
// import api from "@/lib/axios"
export default api;