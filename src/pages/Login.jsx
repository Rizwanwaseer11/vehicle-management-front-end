import { Bus, Eye, EyeOff } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "@/lib/apiBase";

export const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = React.useState(false);

  const [error, setError] = React.useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Login failed");
      return;
    }

    // ✅ API RESPONSE STRUCTURE FIX
    const {
      token,
      role,
      name,
      email,
      _id,
      phone,
      roomNumber,
      jobSite,
      homeAddress,
      licenseNumber,
      pagePermissions
    } = data;

    if (!token) {
      setError("Authentication token missing");
      return;
    }

    // // ✅ ADMIN ONLY
    // if (role !== "admin" || role !== "employee") {
    //   setError("Access denied. Admin only.");
    //   return;
    // }

    // ✅ BUILD USER OBJECT
    const user = {
      _id,
      name,
      email,
      phone,
      role,
      roomNumber,
      jobSite,
      homeAddress,
      licenseNumber,
      pagePermissions
    };

    // ✅ STORE AUTH DATA
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // ✅ REDIRECT WORKS NOW
    if(user.role === "admin") {
      navigate("/admin", { replace: true });
    } else {
       navigate("/employee", { replace: true });
    }
    // navigate("/admin", { replace: true });

  } catch {
    setError("Server error. Please try again later.");
  }
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center 
      bg-linear-to-br from-[#2b3a5e] via-[#20365a] to-[#0f172a]"
    >
      <form
        onSubmit={handleSubmit}
        className="sm:w-[350px] w-full text-center border shadow border-gray-300/60 rounded-2xl px-8 bg-white"
      >
        <h1 className="flex text-gray-600 justify-center mr-6 text-3xl mt-10 font-medium">
          <Bus className="h-10 w-10 mr-2 text-indigo-600" />
          Login
        </h1>

        <p className="text-gray-500 text-sm mt-2">Please sign in to continue</p>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="border-none outline-none ring-0"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2 pr-4">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            className="border-none outline-none ring-0 flex-1"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <div className="mt-4 text-left text-indigo-500">
          <button
            className="text-sm cursor-pointer"
            type="button"
            onClick={() => navigate("/forgot-password")}
          >
            Forget password?
          </button>
        </div>

        {/* ✅ Submit button (works now) */}
        <button
          type="submit"
          className="mt-2 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity"
        >
          Login
        </button>

        <p className="text-gray-500 text-sm mt-3 mb-11 cursor-pointer">
          Admin Only
        </p>
      </form>
    </div>
  );
};
