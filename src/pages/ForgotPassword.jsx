import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "@/lib/apiBase";
import { Eye, EyeOff } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [stage, setStage] = useState("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    if (!email) {
      setStatus({ type: "error", message: "Please enter your email." });
      return;
    }

    setLoading(true);
    try {
      await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStage("reset");
      setStatus({ type: "success", message: "OTP sent to your email." });
    } catch (err) {
      setStatus({ type: "error", message: "Failed to send OTP." });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!otp || !newPassword || !confirmPassword) {
      setStatus({ type: "error", message: "Please fill all fields." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Reset failed");
      }
      setStatus({ type: "success", message: "Password updated. Please login." });
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-[#2b3a5e] via-[#20365a] to-[#0f172a] px-4">
      <form
        onSubmit={stage === "request" ? handleRequest : handleReset}
        className="sm:w-[380px] w-full text-center border shadow border-gray-300/60 rounded-2xl px-8 bg-white py-8"
      >
        <h1 className="text-gray-700 text-2xl font-semibold">
          {stage === "request" ? "Forgot Password" : "Reset Password"}
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          {stage === "request"
            ? "Enter your email to receive a 6-digit OTP."
            : "Enter OTP and your new password."}
        </p>

        {status.message && (
          <p
            className={`text-sm mt-4 ${
              status.type === "success" ? "text-green-600" : "text-red-500"
            }`}
          >
            {status.message}
          </p>
        )}

        <div className="flex items-center w-full mt-5 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <input
            type="email"
            placeholder="Email"
            className="border-none outline-none ring-0 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {stage === "reset" && (
          <>
            <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
              <input
                type="text"
                placeholder="6-digit OTP"
                className="border-none outline-none ring-0 w-full tracking-[6px]"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
              <input
                type={showNew ? "text" : "password"}
                placeholder="New Password"
                className="border-none outline-none ring-0 w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowNew((prev) => !prev)}
                className="text-gray-400 hover:text-gray-600 pr-4"
                aria-label={showNew ? "Hide password" : "Show password"}
                aria-pressed={showNew}
              >
                {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                className="border-none outline-none ring-0 w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="text-gray-400 hover:text-gray-600 pr-4"
                aria-label={showConfirm ? "Hide password" : "Show password"}
                aria-pressed={showConfirm}
              >
                {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {loading
            ? "Please wait..."
            : stage === "request"
              ? "Send OTP"
              : "Reset Password"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-4 text-sm text-indigo-600"
        >
          Back to login
        </button>
      </form>
    </div>
  );
}
