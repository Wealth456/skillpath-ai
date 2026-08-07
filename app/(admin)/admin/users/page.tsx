"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, BookOpen, Calendar, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getUsers,
  getUserDetail,
  updateUserRole,
  AdminUserListItem,
  UserDetailResponse,
} from "@/lib/api/admin";
import { timeAgo, initialsFromName } from "@/lib/utils/time";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type RoleTab = "all" | "admin" | "user";

const ROLE_BADGE_STYLES: Record<string, string> = {
  admin: "bg-[#E8EDFF] text-[#1A3ADB]",
  user:  "bg-[#E5E9F5] text-[#8A97B8]",
};

const AVATAR_COLORS = ["#1A3ADB", "#1228B0", "#3D5AE8", "#0D1B4B", "#2244CC"];
function colorForIndex(i: number) {
  return AVATAR_COLORS[i % AVATAR_COLORS.length];
}

function formatLevel(level?: string) {
  if (!level) return "—";
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function formatGoal(goal?: string) {
  if (!goal || goal.trim() === "") return "—";
  return goal.length > 40 ? goal.slice(0, 40) + "…" : goal;
}

// ─────────────────────────────────────────────────────────────
// USER DETAIL PANEL
// ─────────────────────────────────────────────────────────────

function UserDetailPanel({
  userId,
  onRoleChanged,
}: {
  userId: string;
  onRoleChanged: (userId: string, newRole: string) => void;
}) {
  const [detail, setDetail] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setConfirmOpen(false);
    setUpdateError(null);

    getUserDetail(userId)
      .then((res) => {
        if (!cancelled) setDetail(res);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Failed to load user detail.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function handleRoleToggle() {
    if (!detail) return;
    const newRole = detail.user.role === "admin" ? "user" : "admin";

    setUpdating(true);
    setUpdateError(null);
    try {
      await updateUserRole(detail.user._id, newRole);
      setDetail({ ...detail, user: { ...detail.user, role: newRole } });
      onRoleChanged(detail.user._id, newRole);
      setConfirmOpen(false);
    } catch (err: any) {
      setUpdateError(err?.response?.data?.message || "Failed to update role.");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="w-[280px] flex-shrink-0 bg-white rounded-2xl border border-[#E4E8F5] p-5 h-fit sticky top-6">
        <p className="text-[13px] text-[#8A97B8]">Loading user…</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="w-[280px] flex-shrink-0 bg-white rounded-2xl border border-[#E4E8F5] p-5 h-fit sticky top-6">
        <p className="text-[13px] text-red-600">{error || "User not found."}</p>
      </div>
    );
  }

  const { user, enrollments, progress } = detail;
  const avgProgress =
    progress.length > 0
      ? progress.reduce((sum, p) => sum + p.progressPercent, 0) / progress.length
      : 0;

  const isAdmin = user.role === "admin";

  return (
    <div className="w-[280px] flex-shrink-0 bg-white rounded-2xl border border-[#E4E8F5] p-5 flex flex-col gap-4 h-fit sticky top-6">
      <h3 className="text-[14px] font-bold text-[#1A3ADB]">User Details</h3>

      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-2 py-4 border-b border-[#E4E8F5]">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-[20px] font-black bg-[#1A3ADB]">
          {initialsFromName(user.name)}
        </div>
        <p className="text-[15px] font-black text-[#0D1220] text-center">{user.name}</p>
        <p className="text-[12px] text-[#8A97B8] text-center break-all">{user.email}</p>
        <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${ROLE_BADGE_STYLES[user.role] || ROLE_BADGE_STYLES.user}`}>
          {user.role === "admin" ? "Admin" : "User"}
        </span>
      </div>

      {/* Info rows */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E8EDFF] flex items-center justify-center flex-shrink-0">
            <BookOpen size={14} color="#1A3ADB" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-[#8A97B8]">Level · Goal</p>
            <p className="text-[12px] font-bold text-[#0D1220] truncate">
              {formatLevel(user.preferences?.currentLevel)} · {formatGoal(user.preferences?.goal)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E8EDFF] flex items-center justify-center flex-shrink-0">
            <Calendar size={14} color="#1A3ADB" />
          </div>
          <div>
            <p className="text-[11px] text-[#8A97B8]">Joined</p>
            <p className="text-[12px] font-bold text-[#0D1220]">{timeAgo(user.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Stats — real: enrollments.length and avg of progressPercent */}
      <div className="grid grid-cols-2 gap-2 border-t border-[#E4E8F5] pt-4">
        <div className="flex flex-col items-center py-3 rounded-xl bg-[#F7F8FC] border border-[#E4E8F5]">
          <span className="text-[18px] font-black text-[#1A3ADB]">{enrollments.length}</span>
          <span className="text-[10px] text-[#8A97B8]">Courses</span>
        </div>
        <div className="flex flex-col items-center py-3 rounded-xl bg-[#F7F8FC] border border-[#E4E8F5]">
          <span className="text-[18px] font-black text-[#1A3ADB]">{avgProgress.toFixed(0)}%</span>
          <span className="text-[10px] text-[#8A97B8]">Avg progress</span>
        </div>
      </div>

      {/* Role action */}
      <div className="flex flex-col gap-2 border-t border-[#E4E8F5] pt-3">
        {!confirmOpen ? (
          <button
            onClick={() => setConfirmOpen(true)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold transition-colors ${
              isAdmin
                ? "border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#FEE2E2]"
                : "border border-[#1A3ADB]/30 text-[#1A3ADB] hover:bg-[#E8EDFF]"
            }`}
          >
            <ShieldCheck size={14} />
            {isAdmin ? "Demote to User" : "Promote to Admin"}
          </button>
        ) : (
          <div className="rounded-xl border border-[#E4E8F5] bg-[#F7F8FC] p-3 flex flex-col gap-2">
            <p className="text-[12px] text-[#3D4A6B]">
              {isAdmin
                ? `Remove admin access from ${user.name}?`
                : `Grant admin access to ${user.name}?`}
            </p>
            {updateError && <p className="text-[11px] text-red-600">{updateError}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={updating}
                className="flex-1 py-2 rounded-lg border border-[#E4E8F5] text-[11px] font-semibold text-[#3D4A6B] hover:bg-white transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleToggle}
                disabled={updating}
                className={`flex-1 py-2 rounded-lg text-[11px] font-bold text-white transition-colors disabled:opacity-60 ${
                  isAdmin ? "bg-[#EF4444] hover:opacity-90" : "bg-[#1A3ADB] hover:bg-[#1228B0]"
                }`}
              >
                {updating ? "Saving…" : "Confirm"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [roleTab, setRoleTab] = useState<RoleTab>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Debounce search input -> actual query param, 400ms
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadUsers = useCallback(() => {
    setLoading(true);
    setError(null);
    getUsers({ page, limit: PAGE_SIZE, search: search || undefined })
      .then((res) => {
        setUsers(res.users);
        setTotal(res.total);
        setTotalPages(res.totalPages || 1);
        if (res.users.length > 0 && !selectedUserId) {
          setSelectedUserId(res.users[0]._id);
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Failed to load users.");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Client-side role filter — API doesn't support ?role=, so we filter
  // the current page's results. Note: this means "Admins" / "Users" tabs
  // filter within the current page only, not across the whole dataset.
  const filtered = users.filter((u) => roleTab === "all" || u.role === roleTab);

  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;

  function handleRoleChanged(userId: string, newRole: string) {
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
    );
  }

  const tabButtons: { key: RoleTab; label: string }[] = [
    { key: "all",   label: `All (${users.length})` },
    { key: "admin", label: `Admins (${adminCount})` },
    { key: "user",  label: `Users (${userCount})` },
  ];

  const tabItems = tabButtons.map((tab) => (
    <button
      key={tab.key}
      onClick={() => setRoleTab(tab.key)}
      className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
        roleTab === tab.key
          ? "bg-[#1A3ADB] text-white"
          : "border border-[#E4E8F5] text-[#3D4A6B] hover:bg-[#E8EDFF]"
      }`}
    >
      {tab.label}
    </button>
  ));

  const userRows = filtered.map((user, i) => {
    const isSelected = selectedUserId === user._id;
    return (
      <tr
        key={user._id}
        onClick={() => setSelectedUserId(user._id)}
        className={`border-b border-[#E4E8F5] cursor-pointer transition-colors ${
          isSelected ? "bg-[#E8EDFF]" : "hover:bg-[#F7F8FC]"
        }`}
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            {isSelected && <span className="w-1 h-5 bg-[#1A3ADB] rounded-full flex-shrink-0" />}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
              style={{ backgroundColor: colorForIndex(i) }}
            >
              {initialsFromName(user.name)}
            </div>
            <div className="min-w-0">
              <p className={`text-[13px] font-semibold truncate ${isSelected ? "text-[#1A3ADB]" : "text-[#0D1220]"}`}>
                {user.name}
              </p>
              <p className="text-[11px] text-[#8A97B8] truncate">{user.email}</p>
            </div>
          </div>
        </td>
        <td className="py-3 px-4 text-[12px] text-[#3D4A6B]">{formatLevel(user.preferences?.currentLevel)}</td>
        <td className="py-3 px-4 text-[12px] text-[#3D4A6B] max-w-[180px] truncate">{formatGoal(user.preferences?.goal)}</td>
        <td className="py-3 px-4 text-[12px] text-[#3D4A6B] whitespace-nowrap">{timeAgo(user.createdAt)}</td>
        <td className="py-3 px-4">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${ROLE_BADGE_STYLES[user.role] || ROLE_BADGE_STYLES.user}`}>
            {user.role === "admin" ? "Admin" : "User"}
          </span>
        </td>
      </tr>
    );
  });

  return (
    <div className="flex gap-5 min-h-screen">
      {/* ── LEFT — users table ── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Topbar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-black text-[#0D1220]">User Management</h1>
            <p className="text-[12px] text-[#8A97B8]">View and manage all platform learners</p>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A97B8]" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-8 pr-4 py-2 rounded-xl border border-[#E4E8F5] bg-white text-[12px] placeholder-[#8A97B8] focus:outline-none focus:ring-2 focus:ring-[#1A3ADB]/20 w-56"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">{tabItems}</div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E4E8F5] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E4E8F5] bg-[#F7F8FC]">
                <th className="py-3 px-4 text-left text-[12px] font-bold text-[#1A3ADB]">User</th>
                <th className="py-3 px-4 text-left text-[12px] font-bold text-[#1A3ADB]">Level</th>
                <th className="py-3 px-4 text-left text-[12px] font-bold text-[#1A3ADB]">Goal</th>
                <th className="py-3 px-4 text-left text-[12px] font-bold text-[#1A3ADB]">Joined</th>
                <th className="py-3 px-4 text-left text-[12px] font-bold text-[#1A3ADB]">Role</th>
              </tr>
            </thead>
            <tbody>{userRows}</tbody>
          </table>

          {!loading && filtered.length === 0 && (
            <div className="py-16 text-center text-[#8A97B8] text-[13px]">
              No users match your search.
            </div>
          )}
          {loading && (
            <div className="py-16 text-center text-[#8A97B8] text-[13px]">Loading users…</div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-[#8A97B8]">
            Showing {users.length} of {total} users · Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E4E8F5] text-[12px] font-semibold text-[#3D4A6B] hover:bg-[#F7F8FC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={13} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E4E8F5] text-[12px] font-semibold text-[#3D4A6B] hover:bg-[#F7F8FC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT — user detail panel ── */}
      {selectedUserId && (
        <UserDetailPanel userId={selectedUserId} onRoleChanged={handleRoleChanged} />
      )}
    </div>
  );
}