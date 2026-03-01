import React, { useMemo, useState } from "react";
import { API_BASE } from "@/lib/apiBase";
import { Eye, EyeOff } from "lucide-react";

const AccountSettings = () => {
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const [form, setForm] = useState({
    name: storedUser?.name || "",
    email: storedUser?.email || "",
    phone: storedUser?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changePassword, setChangePassword] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const token = useMemo(() => localStorage.getItem("token"), []);

  const updateField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!token) {
      setStatus({ type: "error", message: "Missing admin token. Please login again." });
      return;
    }

    if (!form.name || !form.email) {
      setStatus({ type: "error", message: "Name and email are required." });
      return;
    }

    if (changePassword) {
      if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
        setStatus({ type: "error", message: "Please fill all password fields." });
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setStatus({ type: "error", message: "New password and confirm password do not match." });
        return;
      }
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    };

    if (changePassword) {
      payload.currentPassword = form.currentPassword;
      payload.newPassword = form.newPassword;
      payload.confirmPassword = form.confirmPassword;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update account.");
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      setStatus({ type: "success", message: data.message || "Account updated." });
      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setChangePassword(false);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="antialiased w-full min-h-screen bg-gray-50 dark:bg-gray-800/95 md:ml-64 pt-16 md:pt-20 px-4 md:px-6 lg:px-8 mt-4 pb-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-700/80 border border-default dark:border-gray-600 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-heading dark:text-gray-100">
          Account Settings
        </h1>
        <p className="text-sm text-body mt-1 dark:text-gray-300">
          Update your profile details and manage your password.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-heading dark:text-gray-200 mb-1">
              Full Name
            </label>
            <input
              className="w-full border border-default dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-heading dark:text-gray-200 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-default dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-heading dark:text-gray-200 mb-1">
              Phone
            </label>
            <input
              className="w-full border border-default dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={() => setChangePassword((prev) => !prev)}
            className="text-sm font-semibold text-indigo-600 dark:text-indigo-300"
          >
            {changePassword ? "Cancel password change" : "Change password"}
          </button>

          {changePassword && (
            <div className="space-y-4 rounded-lg border border-default dark:border-gray-600 dark:bg-gray-800/60 p-4">
              <div>
                <label className="block text-sm font-medium text-heading dark:text-gray-200 mb-1">
                  Current Password
                </label>
                <div className="flex items-center w-full border border-default dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800">
                  <input
                    type={showCurrent ? "text" : "password"}
                    className="w-full border-0 p-0 text-sm focus:ring-0 focus:outline-none bg-transparent text-gray-900 dark:text-gray-100"
                    value={form.currentPassword}
                    onChange={(e) => updateField("currentPassword", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((prev) => !prev)}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
                    aria-label={showCurrent ? "Hide password" : "Show password"}
                    aria-pressed={showCurrent}
                  >
                    {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-heading dark:text-gray-200 mb-1">
                  New Password
                </label>
                <div className="flex items-center w-full border border-default dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800">
                  <input
                    type={showNew ? "text" : "password"}
                    className="w-full border-0 p-0 text-sm focus:ring-0 focus:outline-none bg-transparent text-gray-900 dark:text-gray-100"
                    value={form.newPassword}
                    onChange={(e) => updateField("newPassword", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((prev) => !prev)}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
                    aria-label={showNew ? "Hide password" : "Show password"}
                    aria-pressed={showNew}
                  >
                    {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-heading dark:text-gray-200 mb-1">
                  Confirm New Password
                </label>
                <div className="flex items-center w-full border border-default dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="w-full border-0 p-0 text-sm focus:ring-0 focus:outline-none bg-transparent text-gray-900 dark:text-gray-100"
                    value={form.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    aria-pressed={showConfirm}
                  >
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {status.message && (
            <div
              className={`text-sm rounded-lg px-3 py-2 ${
                status.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700/40"
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
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountSettings;
