export const EMPLOYEE_PERMISSION_KEYS = {
  DASHBOARD: "dashboard",
  MANAGE_DRIVERS: "manage-drivers",
  MANAGE_PASSENGERS: "manage-passengers",
  MANAGE_BUSES: "manage-buses",
  MANAGE_ROUTES: "manage-routes",
  MANAGE_BOOKINGS: "manage-bookings",
  NOTIFICATION_CENTER: "notification-center",
  PUSH_NOTIFICATIONS: "push-notifications",
  ACCOUNT_SETTINGS: "account-settings",
};

export const EMPLOYEE_PERMISSION_ITEMS = [
  {
    key: EMPLOYEE_PERMISSION_KEYS.DASHBOARD,
    label: "Dashboard",
    path: "/employee",
  },
  {
    key: EMPLOYEE_PERMISSION_KEYS.MANAGE_DRIVERS,
    label: "Drivers",
    path: "/employee/manage-drivers",
  },
  {
    key: EMPLOYEE_PERMISSION_KEYS.MANAGE_PASSENGERS,
    label: "Passengers",
    path: "/employee/manage-passengers",
  },
  {
    key: EMPLOYEE_PERMISSION_KEYS.MANAGE_BUSES,
    label: "Buses",
    path: "/employee/manage-buses",
  },
  {
    key: EMPLOYEE_PERMISSION_KEYS.MANAGE_ROUTES,
    label: "Manage Routes",
    path: "/employee/manage-routes",
  },
  {
    key: EMPLOYEE_PERMISSION_KEYS.MANAGE_BOOKINGS,
    label: "Bookings",
    path: "/employee/manage-bookings",
  },
  {
    key: EMPLOYEE_PERMISSION_KEYS.NOTIFICATION_CENTER,
    label: "Notification Center",
    path: "/employee/notification-center",
  },
  {
    key: EMPLOYEE_PERMISSION_KEYS.PUSH_NOTIFICATIONS,
    label: "Push Notifications",
    path: "/employee/push-notifications",
  },
  {
    key: EMPLOYEE_PERMISSION_KEYS.ACCOUNT_SETTINGS,
    label: "Account Settings",
    path: "/employee/account-settings",
  },
];

const ALL_KEYS = EMPLOYEE_PERMISSION_ITEMS.map((item) => item.key);

export const normalizeEmployeePermissions = (value) => {
  if (!Array.isArray(value) || value.length === 0) {
    return ALL_KEYS;
  }
  const uniqueValid = [...new Set(value)].filter((key) => ALL_KEYS.includes(key));
  return uniqueValid.length > 0 ? uniqueValid : ALL_KEYS;
};

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

export const getEmployeeDefaultPath = (permissions) => {
  const normalized = normalizeEmployeePermissions(permissions);
  const firstAllowed = EMPLOYEE_PERMISSION_ITEMS.find((item) =>
    normalized.includes(item.key),
  );
  return firstAllowed?.path || "/employee";
};
