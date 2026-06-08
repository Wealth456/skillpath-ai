// lib/api/roadmap.ts
//
// Roadmap generation API call.
// The backend uses the user's saved profile (goal, level, dailyTime)
// to generate a personalised AI learning roadmap.
// We send NO body — the backend reads the profile from the JWT token.

import api from "@/lib/axios";

// ─── TYPE DEFINITIONS ────────────────────────────────────────────────────────

// A single topic inside a stage
interface RoadmapTopic {
  name: string;           // e.g. "Variables and Data Types"
  estimatedDays: number;  // e.g. 2
  _id: string;            // MongoDB document ID
}

// A stage is one phase/level of the roadmap
interface RoadmapStage {
  stage: number;          // Stage number: 1, 2, 3...
  title: string;          // e.g. "Python Fundamentals"
  topics: RoadmapTopic[]; // Array of topics in this stage
}

// The full roadmap object inside response.data.data
interface Roadmap {
  title: string;           // e.g. "Python Developer Roadmap"
  estimatedWeeks: number;  // Total weeks to complete
  stages: RoadmapStage[];  // Array of stages
}

// The shape of the full API response
interface GenerateRoadmapResponse {
  success: boolean;
  data: {
    roadmap: Roadmap;
  };
}

// ─── GENERATE ROADMAP ────────────────────────────────────────────────────────
// Sends a POST request to /api/roadmap/generate with an EMPTY body.
// The backend reads the logged-in user's profile from the JWT token
// and generates a custom roadmap using AI.
//
// Called from: app/onboarding/generating/page.tsx
// This page shows a loading animation while this runs,
// then redirects to /dashboard on success.
//
// Usage:
//   const response = await generateRoadmap();
//   const roadmap = response.data.data.roadmap;
//   console.log(roadmap.title); // "Python Developer Roadmap"
export async function generateRoadmap() {
  const response = await api.post<GenerateRoadmapResponse>(
    "/api/roadmap/generate",
    {}
    // Second argument is the request body.
    // We pass {} (empty object) because the endpoint requires no body.
    // The backend gets all the info it needs from the Authorization header.
  );
  return response;
}