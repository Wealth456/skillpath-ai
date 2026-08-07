"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { getSettings, updateSettings } from "@/lib/api/admin";

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 ${
        enabled ? "bg-[#1A3ADB]" : "bg-[#E5E9F5]"
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [quizPassMark, setQuizPassMark] = useState(70);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings()
      .then((s) => {
        setMaintenanceMode(!!s.maintenanceMode);
        setQuizPassMark(s.quizPassMark ?? 70);
      })
      .catch((err) => setError(err?.response?.data?.message || "Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateSettings({ maintenanceMode, quizPassMark: Number(quizPassMark) });
      setMaintenanceMode(!!updated.maintenanceMode);
      setQuizPassMark(updated.quizPassMark ?? quizPassMark);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-[13px] text-[#8A97B8]">Loading settings…</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-black text-[#0D1220]">Settings</h1>
          <p className="text-[12px] text-[#8A97B8]">Manage platform configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-colors disabled:opacity-60 ${
            saved ? "bg-[#0D1B4B] text-white" : "bg-[#1A3ADB] text-white hover:bg-[#1228B0]"
          }`}
        >
          <Save size={14} />
          {saving ? "Saving…" : saved ? "Saved!" : "Save changes"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl px-4 py-3">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-[#E4E8F5] p-6 flex flex-col gap-5 max-w-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-[#0D1220]">Maintenance Mode</p>
            <p className="text-[11px] text-[#8A97B8] mt-0.5">
              Temporarily disable access for all non-admin users
            </p>
          </div>
          <Toggle enabled={maintenanceMode} onChange={() => setMaintenanceMode((p) => !p)} />
        </div>
        {maintenanceMode && (
          <div className="rounded-xl bg-[#FEE2E2] border border-[#EF4444]/20 px-4 py-3">
            <p className="text-[12px] font-semibold text-[#EF4444]">
              ⚠️ Maintenance mode is ON — learners cannot access the platform
            </p>
          </div>
        )}

        <div className="border-t border-[#E4E8F5] pt-5">
          <label className="text-[12px] font-semibold text-[#3D4A6B] mb-1.5 block">
            Quiz Pass Mark (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={quizPassMark}
            onChange={(e) => setQuizPassMark(Number(e.target.value))}
            className="w-32 px-4 py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20"
          />
          <p className="text-[11px] text-[#8A97B8] mt-1.5">
            Minimum score required for learners to pass a quiz platform-wide
          </p>
        </div>
      </div>
    </div>
  );
}