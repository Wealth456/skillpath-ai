// lib/api/document.ts
//
// All PDF Summariser API calls live here.
// Functions: uploadDocument, getDocuments, getDocumentSummary.

import api from "@/lib/axios";

// ─── TYPE DEFINITIONS ────────────────────────────────────────────────────────
//
// NOTE: the backend docs only describe the shape of the finished AI summary
// (overview, summary, keyPoints, status, pageCount). They don't specify what
// fields come back for a document in the "list all uploads" response — so
// _id / filename / fileSize / createdAt below are a reasonable guess based
// on common REST conventions, not a confirmed schema. If the real response
// uses different field names, this is the only place to fix it — every
// function below is typed against these interfaces, so a mismatch will
// show up as a TypeScript error at the call site instead of a silent bug.

export type DocumentStatus = "processing" | "done" | "error";

export interface DocumentSummaryData {
  overview: string;
  summary: string;
  keyPoints: string[];
  status: DocumentStatus;
  pageCount: number;
}

export interface UploadedDocument extends DocumentSummaryData {
  _id: string;
  filename: string;
  fileSize: number;
  createdAt: string;
}

interface UploadDocumentResponse {
  success: boolean;
  data: {
    document: UploadedDocument;
  };
}

interface GetDocumentsResponse {
  success: boolean;
  data: {
    documents: UploadedDocument[];
  };
}

interface GetDocumentSummaryResponse {
  success: boolean;
  data: {
    document: UploadedDocument;
  };
}

// ─── UPLOAD A PDF ────────────────────────────────────────────────────────────
// IMPORTANT: lib/axios.ts sets "Content-Type: application/json" as a default
// on every request. Clearing it here lets the browser attach the correct
// "multipart/form-data; boundary=..." header itself — required for the
// backend to parse the uploaded file at all.
export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<UploadDocumentResponse>(
    "/api/document/upload",
    formData,
    {
      headers: { "Content-Type": undefined },
    }
  );
  return response;
}

// ─── GET ALL UPLOADED DOCUMENTS ──────────────────────────────────────────────
export async function getDocuments() {
  const response = await api.get<GetDocumentsResponse>("/api/document/");
  return response;
}

// ─── GET A SPECIFIC DOCUMENT'S SUMMARY ───────────────────────────────────────
export async function getDocumentSummary(documentId: string) {
  const response = await api.get<GetDocumentSummaryResponse>(
    `/api/document/${documentId}/summary`
  );
  return response;
}