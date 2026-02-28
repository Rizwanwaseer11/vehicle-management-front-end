import React, { useMemo, useState } from "react";
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
  const [userIds, setUserIds] = useState("");
  const [priority, setPriority] = useState("high");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const token = useMemo(() => localStorage.getItem("token"), []);

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
      const receivers = userIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
      payload.receivers = receivers;
    }

    if (!payload.title || !payload.body) {
      setStatus({ type: "error", message: "Title and message are required." });
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
      setUserIds("");
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
            <div className="flex flex-wrap gap-4 text-sm">
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
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {target === "roles" && (
            <div>
            <label className="block text-sm font-medium text-heading dark:text-gray-200 mb-2">Roles</label>
              <div className="flex flex-wrap gap-4 text-sm">
                {roleOptions.map((role) => (
                  <label key={role.value} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={roles.includes(role.value)}
                      onChange={() => toggleRole(role.value)}
                    />
                    {role.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {target === "users" && (
            <div>
              <label className="block text-sm font-medium text-heading dark:text-gray-200 mb-1">
                User IDs (comma separated)
              </label>
              <input
                value={userIds}
                onChange={(e) => setUserIds(e.target.value)}
                className="w-full border border-default dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100"
                placeholder="64f..., 64f..."
              />
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
