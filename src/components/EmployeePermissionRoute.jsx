import { Navigate } from "react-router-dom";
import {
  getEmployeeDefaultPath,
  getStoredUser,
  normalizeEmployeePermissions,
} from "@/lib/employeePermissions";

export const EmployeePermissionRoute = ({ permissionKey, children }) => {
  const user = getStoredUser();

  if (user?.role !== "employee") {
    return children;
  }

  const permissions = normalizeEmployeePermissions(user?.pagePermissions);
  if (permissions.includes(permissionKey)) {
    return children;
  }

  const fallbackPath = getEmployeeDefaultPath(permissions);
  return <Navigate to={fallbackPath} replace />;
};
