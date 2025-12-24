import { Bus } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const [state, setState] = React.useState("login");
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });

  const [error, setError] = React.useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const response = await fetch(
      "https://vehicle-management-ecru.vercel.app/api/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Login failed");
      return;
    }

    // ✅ API RESPONSE STRUCTURE FIX
    const { token, role, name, email, _id } = data;

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
      role,
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

  } catch (err) {
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
          {state === "login" ? "Login" : "Sign up"}
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

        <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="border-none outline-none ring-0"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mt-4 text-left text-indigo-500">
          <button className="text-sm cursor-pointer" type="reset">
            Forget password?
          </button>
        </div>

        {/* ✅ Submit button (works now) */}
        <button
          type="submit"
          className="mt-2 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity"
        >
          {state === "login" ? "Login" : "Sign up"}
        </button>

        <p className="text-gray-500 text-sm mt-3 mb-11 cursor-pointer">
          Admin Only
        </p>
      </form>
    </div>
  );
};
