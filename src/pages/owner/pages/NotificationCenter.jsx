import React, { useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/apiBase";

const getRoleKey = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.role || "admin";
  } catch {
    return "admin";
  }
};

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = useMemo(() => localStorage.getItem("token"), []);
  const roleKey = getRoleKey();
  const lastSeenKey = `notifications_last_seen_${roleKey}`;

  const markSeen = () => {
    const now = new Date().toISOString();
    localStorage.setItem(lastSeenKey, now);
  };

  const loadNotifications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        setNotifications([]);
        return;
      }
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    markSeen();
  }, []);

  return (
    <div className="antialiased w-full min-h-screen bg-gray-50 dark:bg-gray-800/95 md:ml-64 pt-16 md:pt-20 px-4 md:px-6 lg:px-8 mt-4 pb-6">
      <div className="max-w-4xl mx-auto bg-white border border-default rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-heading">Notification Center</h1>
            <p className="text-sm text-body mt-1">
              All system and trip updates for administrators.
            </p>
          </div>
          <button
            onClick={() => {
              markSeen();
              loadNotifications();
            }}
            className="text-sm text-indigo-600 hover:opacity-80"
          >
            Refresh
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <p className="text-sm text-gray-500">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <div className="text-sm text-gray-500">
              No notifications available yet.
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {n.title}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                    {n.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
