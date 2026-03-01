import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/lib/apiBase";

const roleOptions = [
  { value: "driver", label: "Drivers" },
  { value: "passenger", label: "Passengers" },
  { value: "admin", label: "Admins" },
  { value: "employee", label: "Employees" },
];

const Notifications = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("all");
  const [roles, setRoles] = useState(["passenger"]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [priority, setPriority] = useState("high");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const token = useMemo(() => localStorage.getItem("token"), []);
  const roleFilterOptions = useMemo(
    () => [{ value: "all", label: "All Roles" }, ...roleOptions],
    []
  );

  const fetchUsers = async ({ signal }) => {
    const res = await fetch(`${API_BASE}/admin/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal,
    });
    if (!res.ok) {
      throw new Error("Failed to load users");
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  };

  const usersQuery = useQuery({
    queryKey: ["admin-users", token],
    queryFn: fetchUsers,
    enabled: !!token,
  });

  const users = useMemo(
    () => (Array.isArray(usersQuery.data) ? usersQuery.data : []),
    [usersQuery.data]
  );

  const filteredUsers = useMemo(() => {
    const search = userSearch.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (!search) return true;
      const haystack = [
        user.name,
        user.email,
        user.phone,
        user._id,
        user.role,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }, [users, userSearch, roleFilter]);

  const toggleUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    const ids = filteredUsers.map((user) => user._id);
    setSelectedUserIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const clearSelection = () => setSelectedUserIds([]);

  const toggleRole = (value) => {
    setRoles((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!token) {
      setStatus({ type: "error", message: "Missing admin token. Please login again." });
      return;
    }

    const payload = {
      title: title.trim(),
      body: body.trim(),
      priority,
    };

    if (target === "all") {
      payload.sendToAll = true;
    } else if (target === "roles") {
      payload.roles = roles;
    } else if (target === "users") {
      payload.receivers = selectedUserIds;
    }

    if (!payload.title || !payload.body) {
      setStatus({ type: "error", message: "Title and message are required." });
      return;
    }
    if (target === "users" && selectedUserIds.length === 0) {
      setStatus({ type: "error", message: "Select at least one user." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send notification.");
      }
      setStatus({ type: "success", message: "Notification sent successfully." });
      setTitle("");
      setBody("");
      setSelectedUserIds([]);
      setUserSearch("");
      setRoleFilter("all");
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="antialiased w-full min-h-screen bg-gray-200 dark:bg-gray-800/95 md:ml-64 pt-16 md:pt-20 px-4 md:px-6 lg:px-8 mt-4 pb-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-700/80 border border-default dark:border-gray-600 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-heading dark:text-gray-100">Push Notifications</h1>
        <p className="text-sm text-body mt-1 dark:text-gray-300">
          Send push notifications to all users, specific roles, or selected users.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-heading dark:text-gray-200 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-default dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100"
              placeholder="Trip Started"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-heading dark:text-gray-200 mb-1">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full border border-default dark:border-gray-600 rounded-lg px-3 py-2 text-sm h-28 dark:bg-gray-800 dark:text-gray-100"
              placeholder="Your bus is on the way."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-heading dark:text-gray-200 mb-2">Target</label>
            <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-200">
              {[
                { value: "all", label: "All Users" },
                { value: "roles", label: "By Role" },
                { value: "users", label: "Specific Users" },
              ].map((opt) => (
                <label key={opt.value} className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    value={opt.value}
                    checked={target === opt.value}
                    onChange={() => setTarget(opt.value)}
                    className="accent-indigo-600 dark:accent-indigo-400"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {target === "roles" && (
            <div>
            <label className="block text-sm font-medium text-heading dark:text-gray-200 mb-2">Roles</label>
              <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-200">
                {roleOptions.map((role) => (
                  <label key={role.value} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={roles.includes(role.value)}
                      onChange={() => toggleRole(role.value)}
                      className="accent-indigo-600 dark:accent-indigo-400"
                    />
                    {role.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {target === "users" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-heading dark:text-gray-200">
                  Select Users
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-300">
                  {selectedUserIds.length} selected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="md:col-span-2 w-full border border-default dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Search by name, email, role, or ID"
                />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full border border-default dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100"
                >
                  {roleFilterOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={selectAllVisible}
                  className="px-2 py-1 rounded border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Select all visible
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="px-2 py-1 rounded border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Clear selection
                </button>
              </div>

              <div className="border border-default dark:border-gray-600 rounded-lg max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                {usersQuery.isLoading ? (
                  <div className="p-3 text-sm text-gray-500 dark:text-gray-300">
                    Loading users...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 dark:text-gray-300">
                    No users match your filters.
                  </div>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = selectedUserIds.includes(user._id);
                    return (
                      <label
                        key={user._id}
                        className="flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleUser(user._id)}
                          className="mt-1 accent-indigo-600 dark:accent-indigo-400"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {user.name || "Unnamed"}
                            </span>
                            <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded px-2 py-0.5">
                              {user.role || "user"}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-300 truncate">
                            {user.email || "No email"} {user.phone ? `• ${user.phone}` : ""}
                          </div>
                          <div className="text-[11px] text-gray-400 dark:text-gray-400">
                            ID: {user._id}
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-300">
                Tip: use search or role filter to find users, then select multiple recipients.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-heading dark:text-gray-200 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border border-default dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="high">High (urgent)</option>
              <option value="normal">Normal (battery friendly)</option>
            </select>
          </div>

          {status.message && (
            <div
              className={`text-sm rounded-lg px-3 py-2 ${
                status.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700/40"
                  : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700/40"
              }`}
            >
              {status.message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Notification"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Notifications;
