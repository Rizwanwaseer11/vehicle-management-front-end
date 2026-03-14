import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  Bus,
  CircleUser,
  ClipboardList,
  House,
  LogOut,
  Route,
  Settings,
  Users,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { API_BASE } from "@/lib/apiBase";
import oneloveLogo from "@/assets/onelove.png";
import {
  EMPLOYEE_PERMISSION_KEYS,
  getEmployeeDefaultPath,
  normalizeEmployeePermissions,
} from "@/lib/employeePermissions";

const NAV_ITEMS = [
  {
    key: EMPLOYEE_PERMISSION_KEYS.DASHBOARD,
    label: "Dashboard",
    path: "/employee",
    icon: House,
    end: true,
  },
  {
    key: EMPLOYEE_PERMISSION_KEYS.MANAGE_DRIVERS,
    label: "Drivers",
    path: "/employee/manage-drivers",
    icon: CircleUser,
  },
  {
    key: EMPLOYEE_PERMISSION_KEYS.MANAGE_PASSENGERS,
    label: "Passengers",
    path: "/employee/manage-passengers",
    icon: Users,
  },
  {
    key: EMPLOYEE_PERMISSION_KEYS.MANAGE_BUSES,
    label: "Buses",
    path: "/employee/manage-buses",
    icon: Bus,
  },
  {
    key: EMPLOYEE_PERMISSION_KEYS.MANAGE_ROUTES,
    label: "Manage Routes",
    path: "/employee/manage-routes",
    icon: Route,
  },
  {
    key: EMPLOYEE_PERMISSION_KEYS.MANAGE_BOOKINGS,
    label: "Bookings",
    path: "/employee/manage-bookings",
    icon: ClipboardList,
  },
  {
    key: EMPLOYEE_PERMISSION_KEYS.NOTIFICATION_CENTER,
    label: "Notification Center",
    path: "/employee/notification-center",
    icon: Bell,
  },
  {
    key: EMPLOYEE_PERMISSION_KEYS.PUSH_NOTIFICATIONS,
    label: "Push Notifications",
    path: "/employee/push-notifications",
    icon: Bell,
  },
  {
    key: EMPLOYEE_PERMISSION_KEYS.ACCOUNT_SETTINGS,
    label: "Account Settings",
    path: "/employee/account-settings",
    icon: Settings,
  },
];

const SideNavbarEmployee = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const permissions = useMemo(
    () => normalizeEmployeePermissions(user?.pagePermissions),
    [user?.pagePermissions],
  );

  const defaultPath = useMemo(() => getEmployeeDefaultPath(permissions), [permissions]);
  const sidebarItems = useMemo(
    () => NAV_ITEMS.filter((item) => permissions.includes(item.key)),
    [permissions],
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const loadNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE}/notifications`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setNotifications(list.slice(0, 5));

        const roleKey = "employee";
        const lastSeenKey = `notifications_last_seen_${roleKey}`;
        const lastSeenRaw = localStorage.getItem(lastSeenKey);
        const lastSeen = lastSeenRaw ? new Date(lastSeenRaw) : null;
        const unread = lastSeen
          ? list.filter((n) => n.createdAt && new Date(n.createdAt) > lastSeen).length
          : list.length;
        setUnreadCount(unread);
      } catch {
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    loadNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleSeen = () => {
      setUnreadCount(0);
    };
    window.addEventListener("notifications:seen", handleSeen);
    return () => window.removeEventListener("notifications:seen", handleSeen);
  }, []);

  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const handleViewAllNotifications = () => {
    localStorage.setItem("notifications_last_seen_employee", new Date().toISOString());
    setUnreadCount(0);
    setNotifOpen(false);
    if (permissions.includes(EMPLOYEE_PERMISSION_KEYS.NOTIFICATION_CENTER)) {
      navigate("/employee/notification-center");
    } else {
      navigate(defaultPath);
    }
  };

  return (
    <>
      <nav className="fixed top-0 z-50 w-full h-17 dark:bg-gray-800 bg-white border-b border border-default">
        <div className="px-3 py-3 lg:px-5 lg:pl-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sm:hidden text-heading dark:text-gray-100 bg-transparent border border-transparent hover:bg-gray-500/30 hover:dark:bg-gray-100/20 font-medium rounded-lg text-sm p-2 focus:outline-none"
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth={2}
                d="M5 7h14M5 12h14M5 17h10"
              />
            </svg>
          </button>

          <div className="flex justify-start items-center">
            <Link to={defaultPath} className="flex items-center">
              <img
                src={oneloveLogo}
                alt="OneLoveDrive"
                className="h-9 w-9 mr-2 rounded-full object-cover"
              />
              <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                OneLoveDrive
              </span>
            </Link>
          </div>

          <div className="flex items-center lg:order-2">
            <ThemeToggle />

            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                className="p-2 mr-1 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
              >
                <span className="sr-only">View notifications</span>
                <div className="relative">
                  <svg
                    aria-hidden="true"
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full w-4 h-4">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-600">
                    Notifications
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n._id} className="px-4 py-3 border-b border-gray-100 dark:border-gray-600">
                          <p className="text-sm text-gray-800 dark:text-gray-100">{n.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{n.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    onClick={handleViewAllNotifications}
                    className="w-full text-center py-2 text-sm text-indigo-600 dark:text-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    View all
                  </button>
                </div>
              )}
            </div>

            <UserDropdown onLogout={handleLogOut} user={user} />
          </div>
        </div>
      </nav>

      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-full transition-transform dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border border-default ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-neutral-primary-soft border-e border-default">
          <ul className="space-y-2 text-sm font-sm">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={item.key}>
                  <NavLink
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex ${index === 0 ? "mt-17" : ""} items-center px-2 py-1.5 text-body rounded-base hover:bg-neutral-tertiary hover:text-fg-brand group transition-colors ${
                        isActive ? "text-indigo-600 font-semibold" : ""
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1 ms-3 whitespace-nowrap">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>

          <ul className="space-y-2 font-medium border-t-2 border-gray-300 pt-6 mt-4">
            <li>
              <button
                type="button"
                onClick={handleLogOut}
                className="w-full flex items-center px-2 py-1.5 text-body rounded-base hover:bg-neutral-tertiary hover:text-fg-brand group"
              >
                <LogOut className="text-red-600" />
                <span className="flex-1 ms-3 text-red-600 whitespace-nowrap text-left">Log out</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};

const UserDropdown = ({ onLogout, user }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex items-center ms-3" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
        aria-expanded={open}
      >
        <span className="sr-only">Open user menu</span>
        <img
          className="w-8 h-8 rounded-full"
          src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80"
          alt="User"
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-56 z-50 w-52 bg-gray-100 border border-default-medium rounded-base shadow-lg">
          <div className="px-4 py-3 border-b border-default-medium">
            <p className="text-sm font-medium text-heading">{user?.name || "Employee"}</p>
            <p className="text-sm text-body truncate">{user?.email || ""}</p>
          </div>
          <ul className="p-2 text-sm text-body font-medium">
            <li>
              <button
                onClick={onLogout}
                className="inline-flex items-center w-full p-2 hover:bg-gray-200 hover:text-heading rounded text-left text-red-600"
              >
                Log out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SideNavbarEmployee;
