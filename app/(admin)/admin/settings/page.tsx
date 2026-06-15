"use client";

import { useState } from "react";
import {
  Globe, Bell, Shield, Palette,
  Mail, Clock, Save,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type SettingsTab = "general" | "notifications" | "security" | "appearance";

interface ToggleSetting {
  label: string;
  description: string;
  enabled: boolean;
  key: string;
}

// ─────────────────────────────────────────────────────────────
// TOGGLE COMPONENT
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// SECTION WRAPPER
// ─────────────────────────────────────────────────────────────

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E4E8F5] p-6 flex flex-col gap-5">
      <h3 className="text-[14px] font-bold text-[#0D1220]">{title}</h3>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [saved, setSaved]         = useState(false);

  // General settings state
  const [platformName, setPlatformName]   = useState("SkillPath AI");
  const [supportEmail, setSupportEmail]   = useState("support@skillpath.ai");
  const [timezone, setTimezone]           = useState("Africa/Lagos");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Notification toggles
  const [notifToggles, setNotifToggles] = useState<Record<string, boolean>>({
    newSignup:       true,
    coursePublished: true,
    lessonComplete:  false,
    pdfUpload:       false,
    weeklyReport:    true,
  });

  // Security toggles
  const [securityToggles, setSecurityToggles] = useState<Record<string, boolean>>({
    twoFactor:       false,
    sessionTimeout:  true,
    ipLogging:       true,
  });

  // Appearance toggles
  const [darkMode, setDarkMode]       = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  function toggleNotif(key: string) {
    setNotifToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleSecurity(key: string) {
    setSecurityToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // Sidebar tabs — Rule 10
  const tabs: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { key: "general",       label: "General",       icon: <Globe size={15} />   },
    { key: "notifications", label: "Notifications", icon: <Bell size={15} />    },
    { key: "security",      label: "Security",      icon: <Shield size={15} />  },
    { key: "appearance",    label: "Appearance",    icon: <Palette size={15} /> },
  ];

  const tabItems = tabs.map((tab) => (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-[13px] font-semibold transition-colors ${
        activeTab === tab.key
          ? "bg-[#E8EDFF] text-[#1A3ADB]"
          : "text-[#3D4A6B] hover:bg-[#F7F8FC]"
      }`}
    >
      {tab.icon}
      {tab.label}
    </button>
  ));

  // Notification toggle rows — Rule 10
  const notifSettings: ToggleSetting[] = [
    { key: "newSignup",       label: "New user signup",         description: "Alert when a new user registers",          enabled: notifToggles.newSignup       },
    { key: "coursePublished", label: "Course published",        description: "Alert when a course goes live",            enabled: notifToggles.coursePublished  },
    { key: "lessonComplete",  label: "Lesson completions",      description: "Alert on every lesson completion",         enabled: notifToggles.lessonComplete   },
    { key: "pdfUpload",       label: "PDF uploads",             description: "Alert when a user uploads a PDF",          enabled: notifToggles.pdfUpload        },
    { key: "weeklyReport",    label: "Weekly summary report",   description: "Receive weekly platform analytics digest", enabled: notifToggles.weeklyReport     },
  ];

  const notifRows = notifSettings.map((s) => (
    <div key={s.key} className="flex items-center justify-between py-3 border-b border-[#E4E8F5] last:border-0">
      <div>
        <p className="text-[13px] font-semibold text-[#0D1220]">{s.label}</p>
        <p className="text-[11px] text-[#8A97B8] mt-0.5">{s.description}</p>
      </div>
      <Toggle enabled={s.enabled} onChange={() => toggleNotif(s.key)} />
    </div>
  ));

  // Security toggle rows — Rule 10
  const securitySettings: ToggleSetting[] = [
    { key: "twoFactor",      label: "Two-factor authentication", description: "Require 2FA for all admin logins",     enabled: securityToggles.twoFactor      },
    { key: "sessionTimeout", label: "Session timeout",           description: "Auto logout after 30 min inactivity", enabled: securityToggles.sessionTimeout  },
    { key: "ipLogging",      label: "IP address logging",        description: "Log IP addresses for all logins",     enabled: securityToggles.ipLogging       },
  ];

  const securityRows = securitySettings.map((s) => (
    <div key={s.key} className="flex items-center justify-between py-3 border-b border-[#E4E8F5] last:border-0">
      <div>
        <p className="text-[13px] font-semibold text-[#0D1220]">{s.label}</p>
        <p className="text-[11px] text-[#8A97B8] mt-0.5">{s.description}</p>
      </div>
      <Toggle enabled={s.enabled} onChange={() => toggleSecurity(s.key)} />
    </div>
  ));

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">

      {/* Topbar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-black text-[#0D1220]">Settings</h1>
          <p className="text-[12px] text-[#8A97B8]">Manage platform configuration</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-colors ${
            saved
              ? "bg-[#0D1B4B] text-white"
              : "bg-[#1A3ADB] text-white hover:bg-[#1228B0]"
          }`}
        >
          <Save size={14} />
          {saved ? "Saved!" : "Save changes"}
        </button>
      </div>

      <div className="flex gap-5">

        {/* Left — tab nav */}
        <div className="w-[200px] flex-shrink-0 bg-white rounded-2xl border border-[#E4E8F5] p-3 flex flex-col gap-1 h-fit">
          {tabItems}
        </div>

        {/* Right — tab content */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">

          {/* ── GENERAL ── */}
          {activeTab === "general" && (
            <>
              <SettingsSection title="Platform Information">
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-[12px] font-semibold text-[#3D4A6B] mb-1.5 block">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] text-[#0D1220] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-[#3D4A6B] mb-1.5 block">
                      Support Email
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A97B8]" />
                      <input
                        type="email"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] text-[#0D1220] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-[#3D4A6B] mb-1.5 block">
                      Timezone
                    </label>
                    <div className="relative">
                      <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A97B8]" />
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] text-[#0D1220] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20 bg-white appearance-none"
                      >
                        <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                        <option value="Africa/Accra">Africa/Accra (GMT)</option>
                        <option value="UTC">UTC</option>
                        <option value="Europe/London">Europe/London</option>
                      </select>
                    </div>
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection title="Maintenance">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-[#0D1220]">Maintenance Mode</p>
                    <p className="text-[11px] text-[#8A97B8] mt-0.5">
                      Temporarily disable access for all non-admin users
                    </p>
                  </div>
                  <Toggle
                    enabled={maintenanceMode}
                    onChange={() => setMaintenanceMode((p) => !p)}
                  />
                </div>
                {maintenanceMode && (
                  <div className="rounded-xl bg-[#FEE2E2] border border-[#EF4444]/20 px-4 py-3">
                    <p className="text-[12px] font-semibold text-[#EF4444]">
                      ⚠️ Maintenance mode is ON — learners cannot access the platform
                    </p>
                  </div>
                )}
              </SettingsSection>
            </>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === "notifications" && (
            <SettingsSection title="Email Notification Triggers">
              <div className="flex flex-col">{notifRows}</div>
            </SettingsSection>
          )}

          {/* ── SECURITY ── */}
          {activeTab === "security" && (
            <>
              <SettingsSection title="Authentication & Access">
                <div className="flex flex-col">{securityRows}</div>
              </SettingsSection>

              <SettingsSection title="Admin Password">
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-[12px] font-semibold text-[#3D4A6B] mb-1.5 block">
                      Current password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-[#3D4A6B] mb-1.5 block">
                      New password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E4E8F5] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20"
                    />
                  </div>
                  <button className="self-start px-5 py-2.5 rounded-xl bg-[#1A3ADB] text-white text-[12px] font-bold hover:bg-[#1228B0] transition-colors">
                    Update password
                  </button>
                </div>
              </SettingsSection>
            </>
          )}

          {/* ── APPEARANCE ── */}
          {activeTab === "appearance" && (
            <SettingsSection title="Display Preferences">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between py-3 border-b border-[#E4E8F5]">
                  <div>
                    <p className="text-[13px] font-semibold text-[#0D1220]">Dark mode</p>
                    <p className="text-[11px] text-[#8A97B8] mt-0.5">Switch admin panel to dark theme</p>
                  </div>
                  <Toggle enabled={darkMode} onChange={() => setDarkMode((p) => !p)} />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-[13px] font-semibold text-[#0D1220]">Compact mode</p>
                    <p className="text-[11px] text-[#8A97B8] mt-0.5">Reduce spacing for denser layout</p>
                  </div>
                  <Toggle enabled={compactMode} onChange={() => setCompactMode((p) => !p)} />
                </div>
              </div>
            </SettingsSection>
          )}
        </div>
      </div>
    </div>
  );
}