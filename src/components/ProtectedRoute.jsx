import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  // If no token or user data, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check if user has that role
  if (requiredRole) {
    try {
      const userData = JSON.parse(user);
      if (userData.role !== requiredRole) {
        // Redirect to appropriate dashboard based on their actual role
        return (
          <Navigate
            to={userData.role === "admin" ? "/admin" : "/employee"}
            replace
          />
        );
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};
