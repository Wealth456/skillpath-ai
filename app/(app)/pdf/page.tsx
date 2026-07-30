"use client";

import { useEffect, useState, useRef } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  ChevronRight,
  Copy,
  Download,
  Share2,
  ClipboardList,
  BookOpenText,
} from "lucide-react";
import { uploadDocument, getDocuments, getDocumentSummary } from "@/lib/api/document";
import type { UploadedDocument } from "@/lib/api/document";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type ActiveTab = "summary" | "keypoints" | "glossary" | "quizme";

interface SummarySection {
  emoji: string;
  heading: string;
  type: "paragraph" | "bullets";
  content: string;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} kB`;
  return `${bytes} B`;
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMin = Math.round((now.getTime() - date.getTime()) / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;

  const diffDay = Math.round(diffHr / 24);
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;

  return date.toLocaleDateString();
}

function buildSections(doc: UploadedDocument | null, tab: ActiveTab): SummarySection[] {
  if (!doc) return [];

  if (tab === "summary") {
    return [
      { emoji: "📖", heading: "Overview", type: "paragraph", content: doc.overview },
      { emoji: "📝", heading: "Detailed Summary", type: "paragraph", content: doc.summary },
    ];
  }

  if (tab === "keypoints") {
    return [
      { emoji: "✅", heading: "Key Points", type: "bullets", content: doc.keyPoints.join("\n") },
    ];
  }

  return [];
}

// ─────────────────────────────────────────────────────────────
// SECTION RENDERER
// ─────────────────────────────────────────────────────────────

function SummaryBlock({ section }: { section: SummarySection }) {
  if (section.type === "paragraph") {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-[13px] font-bold text-[#0D1220]">
          {section.emoji} {section.heading}
        </p>
        <p className="text-[13px] text-[#3D4A6B] leading-relaxed">
          {section.content}
        </p>
      </div>
    );
  }

  const lines = section.content.split("\n");
  const bulletItems = lines.map((line, i) => (
    <p key={i} className="text-[13px] text-[#3D4A6B] leading-relaxed">
      • {line}
    </p>
  ));
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[13px] font-bold text-[#0D1220]">
        {section.emoji} {section.heading}
      </p>
      <div className="flex flex-col gap-0.5 pl-1">{bulletItems}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RECENT FILE ROW
// ─────────────────────────────────────────────────────────────

function FileRow({
  file,
  onView,
}: {
  file: UploadedDocument;
  onView: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-2xl border border-[#E4E8F5] bg-white">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor:
            file.status === "processing" ? "#FFF8E7" : "#E8EDFF",
        }}
      >
        <FileText
          size={18}
          color={file.status === "processing" ? "#F5A623" : "#1A3ADB"}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#0D1220] truncate">
          {file.filename}
        </p>
        <p className="text-[11px] text-[#8A97B8]">
          {formatFileSize(file.fileSize)} · {formatRelativeTime(file.createdAt)}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {file.status === "done" && (
          <span className="px-3 py-1 rounded-full border border-[#E4E8F5] text-[11px] font-semibold text-[#3D4A6B]">
            Done
          </span>
        )}
        {file.status === "processing" && (
          <span
            className="px-3 py-1 rounded-full border text-[11px] font-semibold"
            style={{ borderColor: "#F5A623", color: "#F5A623" }}
          >
            Processing...
          </span>
        )}
        {file.status === "error" && (
          <span className="px-3 py-1 rounded-full border border-[#EF4444]/40 text-[11px] font-semibold text-[#EF4444]">
            Failed
          </span>
        )}
        {file.status === "done" && (
          <button
            onClick={() => onView(file._id)}
            className="flex items-center gap-1 text-[12px] font-semibold text-[#1A3ADB] hover:underline"
          >
            View <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function PDFPage() {
  const [activeTab, setActiveTab]   = useState<ActiveTab>("summary");
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied]         = useState(false);
  const fileInputRef                = useRef<HTMLInputElement>(null);

  const [documents, setDocuments]           = useState<UploadedDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError]     = useState("");

  const [activeDocument, setActiveDocument]         = useState<UploadedDocument | null>(null);
  const [activeDocumentLoading, setActiveDocumentLoading] = useState(false);
  const [viewError, setViewError]                   = useState("");

  const [uploading, setUploading]     = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setDocumentsLoading(true);
        const response = await getDocuments();
        const list: UploadedDocument[] = response.data.data.documents ?? [];
        setDocuments(list);

        const firstDone = list.find((doc) => doc.status === "done") ?? null;
        setActiveDocument(firstDone);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load your uploads";
        setDocumentsError(message);
      } finally {
        setDocumentsLoading(false);
      }
    }
    load();
  }, []);

  async function handleUploadFile(file: File) {
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are supported.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");

      const response = await uploadDocument(file);
      const newDoc = response.data.data.document;

      setDocuments((prev) => [newDoc, ...prev]);
      setActiveDocument(newDoc);
      setActiveTab("summary");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload PDF";
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  }

  async function handleView(id: string) {
    try {
      setActiveDocumentLoading(true);
      setViewError("");
      const response = await getDocumentSummary(id);
      setActiveDocument(response.data.data.document);
      setActiveTab("summary");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load this summary";
      setViewError(message);
    } finally {
      setActiveDocumentLoading(false);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }
  function handleDragLeave() {
    setIsDragging(false);
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUploadFile(file);
  }
  function handleBrowse() {
    fileInputRef.current?.click();
  }
  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUploadFile(file);
    e.target.value = "";
  }

  function handleCopy() {
    if (!activeDocument) return;
    const text = [
      `📖 Overview\n${activeDocument.overview}`,
      `📝 Detailed Summary\n${activeDocument.summary}`,
      `✅ Key Points\n${activeDocument.keyPoints.map((k) => `• ${k}`).join("\n")}`,
    ].join("\n\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const sections = buildSections(activeDocument, activeTab);
  const sectionBlocks = sections.map((section, i) => (
    <SummaryBlock key={i} section={section} />
  ));

  const fileRows = documents.map((file) => (
    <FileRow key={file._id} file={file} onView={handleView} />
  ));

  const tabs: { key: ActiveTab; label: string }[] = [
    { key: "summary",   label: "Summary"    },
    { key: "keypoints", label: "Key Points" },
    { key: "glossary",  label: "Glossary"   },
    { key: "quizme",    label: "Quiz me"    },
  ];

  const tabButtons = tabs.map((tab) => (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key)}
      className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-colors ${
        activeTab === tab.key
          ? "bg-[#1A3ADB] text-white"
          : "text-[#3D4A6B] hover:bg-[#E8EDFF]"
      }`}
    >
      {tab.label}
    </button>
  ));

  return (
    <div className="flex gap-6 min-h-screen bg-[#F7F8FC]">

      <div className="flex-1 flex flex-col gap-5 min-w-0">

        <div>
          <h2 className="text-[15px] font-bold text-[#0D1220] mb-0.5">Upload PDF</h2>
          <p className="text-[12px] text-[#8A97B8] mb-3">
            Supports textbooks, articles, lecture notes
          </p>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowse}
            className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-10 px-6 transition-colors cursor-pointer ${
              isDragging
                ? "border-[#1A3ADB] bg-[#E8EDFF]"
                : "border-[#C8D0E7] bg-white hover:border-[#1A3ADB]/50 hover:bg-[#F7F8FF]"
            }`}
          >
            {uploading ? (
              <>
                <div className="w-8 h-8 rounded-full border-2 border-[#1A3ADB] border-t-transparent animate-spin mb-3" />
                <p className="text-[15px] font-bold text-[#0D1220] mb-1">
                  Uploading &amp; summarising...
                </p>
                <p className="text-[12px] text-[#8A97B8]">
                  This can take a moment for longer PDFs
                </p>
              </>
            ) : (
              <>
                <Upload size={32} color="#8A97B8" className="mb-3" />
                <p className="text-[15px] font-bold text-[#0D1220] mb-1">
                  Drag &amp; drop your PDF here
                </p>
                <p className="text-[12px] text-[#8A97B8] mb-4">
                  or click to browse — max 20MB
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleBrowse(); }}
                  className="px-5 py-2 rounded-xl bg-[#1A3ADB] text-white text-[13px] font-bold hover:bg-[#1228B0] transition-colors"
                >
                  Browse files
                </button>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileInputChange}
            />
          </div>

          {uploadError && (
            <div className="mt-3 rounded-xl bg-[#FEE2E2] border border-[#EF4444]/20 px-4 py-3 text-[12px] text-[#EF4444]">
              {uploadError}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-[15px] font-bold text-[#0D1220] mb-3">
            Recent Uploads
          </h2>

          {documentsLoading && (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 rounded-full border-2 border-[#1A3ADB] border-t-transparent animate-spin" />
            </div>
          )}

          {!documentsLoading && documentsError && (
            <div className="rounded-xl bg-[#FEE2E2] border border-[#EF4444]/20 px-4 py-3 text-[12px] text-[#EF4444]">
              {documentsError}
            </div>
          )}

          {!documentsLoading && !documentsError && documents.length === 0 && (
            <p className="text-[13px] text-[#8A97B8] py-4 text-center">
              No PDFs uploaded yet — upload one above to get started.
            </p>
          )}

          {!documentsLoading && !documentsError && documents.length > 0 && (
            <div className="flex flex-col gap-3">
              {fileRows}
            </div>
          )}
        </div>
      </div>

      <div className="w-[520px] flex-shrink-0 flex flex-col bg-white rounded-2xl border border-[#E4E8F5] overflow-hidden">

        {!activeDocument ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8 text-center">
            <BookOpenText size={32} color="#8A97B8" />
            <p className="text-[14px] font-bold text-[#0D1220]">
              No summary selected
            </p>
            <p className="text-[12px] text-[#8A97B8]">
              Upload a PDF, or click &quot;View&quot; on a past upload, to see its AI summary here.
            </p>
          </div>
        ) : (
          <>
            <div className="px-5 pt-5 pb-4 border-b border-[#E4E8F5]">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={16} color="#1A3ADB" className="flex-shrink-0" />
                  <span className="text-[14px] font-bold text-[#1A3ADB] truncate">
                    {activeDocument.filename}
                  </span>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A3ADB] text-white text-[12px] font-bold flex-shrink-0">
                  <CheckCircle2 size={12} />
                  Done
                </span>
              </div>
              <p className="text-[11px] text-[#8A97B8]">
                {activeDocument.pageCount} pages · Uploaded {formatRelativeTime(activeDocument.createdAt)}
              </p>
            </div>

            <div className="flex items-center gap-1 px-4 py-3 border-b border-[#E4E8F5]">
              {tabButtons}
            </div>

            <div
              className="mx-4 mt-4 mb-3 rounded-xl px-4 py-2.5 flex items-center gap-3"
              style={{ backgroundColor: "#0D1B4B" }}
            >
              <span className="w-6 h-6 rounded-md bg-[#1A3ADB] flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                AI
              </span>
              <p className="text-[12px] text-white/80 font-medium truncate">
                AI-generated summary · {activeDocument.filename}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col gap-5">
              {viewError && (
                <div className="rounded-xl bg-[#FEE2E2] border border-[#EF4444]/20 px-4 py-3 text-[12px] text-[#EF4444]">
                  {viewError}
                </div>
              )}

              {activeDocumentLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 rounded-full border-2 border-[#1A3ADB] border-t-transparent animate-spin" />
                </div>
              ) : activeTab === "quizme" ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <ClipboardList size={32} color="#1A3ADB" />
                  <p className="text-[14px] font-bold text-[#0D1220]">
                    Quiz coming soon
                  </p>
                  <p className="text-[12px] text-[#8A97B8] text-center">
                    AI-generated quiz based on this PDF will appear here.
                  </p>
                </div>
              ) : activeTab === "glossary" ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <BookOpenText size={32} color="#8A97B8" />
                  <p className="text-[14px] font-bold text-[#0D1220]">
                    Glossary not available
                  </p>
                  <p className="text-[12px] text-[#8A97B8] text-center">
                    This PDF&apos;s AI summary doesn&apos;t include a glossary yet.
                  </p>
                </div>
              ) : sectionBlocks.length > 0 ? (
                sectionBlocks
              ) : (
                <p className="text-[13px] text-[#8A97B8] py-8 text-center">
                  No content yet.
                </p>
              )}
            </div>

            <div className="border-t border-[#E4E8F5] px-4 py-3 flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#E4E8F5] text-[#3D4A6B] text-[12px] font-semibold hover:bg-[#F7F8FC] transition-colors"
              >
                <Copy size={13} />
                {copied ? "Copied!" : "Copy summary"}
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#E4E8F5] text-[#3D4A6B] text-[12px] font-semibold hover:bg-[#F7F8FC] transition-colors">
                <Download size={13} />
                Download
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#E4E8F5] text-[#3D4A6B] text-[12px] font-semibold hover:bg-[#F7F8FC] transition-colors">
                <Share2 size={13} />
                Share
              </button>
              <button
                onClick={() => setActiveTab("quizme")}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-[12px] font-bold transition-colors"
                style={{ backgroundColor: "#0D1B4B" }}
              >
                <ClipboardList size={13} />
                Quiz me
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}