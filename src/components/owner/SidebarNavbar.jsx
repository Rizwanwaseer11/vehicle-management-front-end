import React from "react";
import { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { API_BASE } from "@/lib/apiBase";
import {
  LogOut,
  Bus,
  House,
  Route,
  Users,
  CircleUser,
  MapPinCheckInside,
  Bell,
  Settings,
} from "lucide-react";

const SidebarNavbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const notifRef = useRef(null);

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

        const roleKey = (() => {
          try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            return user?.role || "admin";
          } catch {
            return "admin";
          }
        })();
        const lastSeenKey = `notifications_last_seen_${roleKey}`;
        const lastSeenRaw = localStorage.getItem(lastSeenKey);
        const lastSeen = lastSeenRaw ? new Date(lastSeenRaw) : null;
        const unread = lastSeen
          ? list.filter((n) => n.createdAt && new Date(n.createdAt) > lastSeen).length
          : list.length;
        setUnreadCount(unread);
      } catch (e) {
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
    // 1. Remove auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // 3. Redirect to login
    navigate("/login", { replace: true });
  };

  return (
    <>
      <nav className="fixed top-0 z-50 w-full h-17 dark:bg-gray-800  bg-white border-b border border-default">
        <div className="px-3 py-3 lg:px-5 lg:pl-3 flex items-center justify-between">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sm:hidden text-heading dark:text-gray-100  bg-transparent border border-transparent
             hover:bg-gray-500/30  hover:dark:bg-gray-100/20  font-medium
              rounded-lg text-sm p-2 focus:outline-none"
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
            <Link to={"/admin"} className="flex items-center">
              <Bus className="h-8 w-8 mr-2 text-indigo-600" />
              <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                Island Drive
              </span>
            </Link>
          </div>
          <div className="flex items-center lg:order-2">
            {/* Dark them Toggler */}
            <ThemeToggle />

            {/* Notifications */}
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
                    onClick={() => {
                      const roleKey = (() => {
                        try {
                          const user = JSON.parse(localStorage.getItem("user") || "{}");
                          return user?.role || "admin";
                        } catch {
                          return "admin";
                        }
                      })();
                      localStorage.setItem(`notifications_last_seen_${roleKey}`, new Date().toISOString());
                      setUnreadCount(0);
                      setNotifOpen(false);
                      navigate("/admin/notification-center");
                    }}
                    className="w-full text-center py-2 text-sm text-indigo-600 dark:text-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    View all
                  </button>
                </div>
              )}
            </div>

            {/* Dropdown menu */}

            {/* Apps */}
            <button
              type="button"
              data-dropdown-toggle="apps-dropdown"
              className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            >
              <span className="sr-only">View notifications</span>
              {/* Icon */}
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            {/* Dropdown menu */}
            {/*  */}
            <UserDropdown />

            {/* Dropdown menu */}
          </div>
        </div>
      </nav>
      <div>
        <aside
          className={`fixed top-0 left-0 z-40 w-64 h-full transition-transform dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border border-default ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } sm:translate-x-0`}
        >
          <div className="h-full px-3 py-4 overflow-y-auto bg-neutral-primary-soft border-e border-default">
            <ul className="space-y-4 text-sm  font-sm">
              <li>
                <NavLink
                  to={"/admin"}
                  end
                  className={({ isActive }) =>
                    `flex mt-17 items-center w-full justify-between px-2 py-1.5 text-body rounded-base hover:bg-gray-200 hover:text-fg-brand group transition-colors ${
                      isActive ? " text-indigo-600 font-semibold" : ""
                    }`
                  }
                >
                  <House className=" w-5 h-5 " />
                  <span className="flex-1 ms-3  text-left rtl:text-right whitespace-nowrap">
                    Dashboard
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={"manage-drivers"}
                  className={({ isActive }) =>
                    `flex items-center px-2 py-1.5 text-body rounded-base hover:bg-gray-200 hover:text-fg-brand group transition-colors ${
                      isActive ? " text-indigo-600 font-semibold" : ""
                    }`
                  }
                >
                  <CircleUser className=" w-5 h-5 " />

                  <span className="flex-1 ms-3 whitespace-nowrap">Drivers</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={"manage-passengers"}
                  className={({ isActive }) =>
                    `flex items-center px-2 py-1.5 text-body rounded-base hover:bg-gray-200 hover:text-fg-brand group transition-colors ${
                      isActive ? " text-indigo-600 font-semibold" : ""
                    }`
                  }
                >
                  <Users className=" w-5 h-5 " />

                  <span className="flex-1 ms-3 whitespace-nowrap">
                    Passengers
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={"manage-buses"}
                  className={({ isActive }) =>
                    `flex items-center px-2 py-1.5 text-body rounded-base hover:bg-gray-200 hover:text-fg-brand group transition-colors ${
                      isActive ? " text-indigo-600 font-semibold" : ""
                    }`
                  }
                >
                  <Bus className=" w-5 h-5 " />

                  <span className="flex-1 ms-3 whitespace-nowrap">Buses</span>
                </NavLink>
              </li>

              {/* /////// */}
              <li>
                <NavLink
                  to={"manage-tracking"}
                  className={({ isActive }) =>
                    `flex items-center px-2 py-1.5 text-body rounded-base hover:bg-gray-200 hover:text-fg-brand group transition-colors ${
                      isActive ? " text-indigo-600 font-semibold" : ""
                    }`
                  }
                >
                  <MapPinCheckInside className=" w-5 h-5 " />

                  <span className="flex-1 ms-3 whitespace-nowrap">
                    Live Tracking
                  </span>
                </NavLink>
              </li>
              {/* /// */}
              <li>
                <NavLink
                  to={"manage-routes"}
                  className={({ isActive }) =>
                    `flex items-center px-2 py-1.5 text-body rounded-base hover:bg-gray-200 hover:text-fg-brand group transition-colors ${
                      isActive ? " text-indigo-600 font-semibold" : ""
                    }`
                  }
                >
                  <Route className=" w-5 h-5 " />

                  <span className="flex-1 ms-3 whitespace-nowrap">
                    Manage Routes
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={"notification-center"}
                  className={({ isActive }) =>
                    `flex items-center px-2 py-1.5 text-body rounded-base hover:bg-gray-200 hover:text-fg-brand group transition-colors ${
                      isActive ? " text-indigo-600 font-semibold" : ""
                    }`
                  }
                >
                  <Bell className=" w-5 h-5 " />
                  <span className="flex-1 ms-3 whitespace-nowrap">
                    Notification Center
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={"push-notifications"}
                  className={({ isActive }) =>
                    `flex items-center px-2 py-1.5 text-body rounded-base hover:bg-gray-200 hover:text-fg-brand group transition-colors ${
                      isActive ? " text-indigo-600 font-semibold" : ""
                    }`
                  }
                >
                  <Bell className=" w-5 h-5 " />
                  <span className="flex-1 ms-3 whitespace-nowrap">
                    Push Notifications
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={"account-settings"}
                  className={({ isActive }) =>
                    `flex items-center px-2 py-1.5 text-body rounded-base hover:bg-gray-200 hover:text-fg-brand group transition-colors ${
                      isActive ? " text-indigo-600 font-semibold" : ""
                    }`
                  }
                >
                  <Settings className=" w-5 h-5 " />
                  <span className="flex-1 ms-3 whitespace-nowrap">
                    Account Settings
                  </span>
                </NavLink>
              </li>
            </ul>
            <ul className="space-y-4 font-medium border-t-2 border-gray-300 pt-6 mt-4">
              <li>
                <a
                  href="#"
                  className="flex items-center px-2 py-1.5 text-body rounded-base hover:bg-gray-200 hover:text-fg-brand group"
                >
                  {/* <svg
                    className="shrink-0 w-5 h-5 transition duration-75 group-hover:text-fg-brand"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4"
                    />
                  </svg> */}
                  {/* <span className="flex-1 ms-3 whitespace-nowrap"> */}
                  {/* Documentation */}
                  {/* </span> */}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center px-2 py-1.5 text-body rounded-base hover:bg-gray-200 hover:text-fg-brand group"
                >
                  {/* <svg
                    className="shrink-0 w-5 h-5 transition duration-75 group-hover:text-fg-brand"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="m13.46 8.291 3.849-3.849a1.5 1.5 0 0 1 2.122 0l.127.127a1.5 1.5 0 0 1 0 2.122l-3.84 3.838a4 4 0 0 0-2.258-2.238Zm0 0a4 4 0 0 1 2.263 2.238l3.662-3.662a8.961 8.961 0 0 1 0 10.27l-3.676-3.676m-2.25-5.17 3.678-3.676a8.961 8.961 0 0 0-10.27 0l3.662 3.662a4 4 0 0 0-2.238 2.258L4.615 6.863a8.96 8.96 0 0 0 0 10.27l3.662-3.662a4 4 0 0 0 2.258 2.238l-3.672 3.676a8.96 8.96 0 0 0 10.27 0l-3.662-3.662a4.001 4.001 0 0 0 2.238-2.262m0 0 3.849 3.848a1.5 1.5 0 0 1 0 2.122l-.127.126a1.499 1.499 0 0 1-2.122 0l-3.838-3.838a4 4 0 0 0 2.238-2.258Zm.29-1.461a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-7.718 1.471-3.84 3.838a1.5 1.5 0 0 0 0 2.122l.128.126a1.5 1.5 0 0 0 2.122 0l3.848-3.848a4 4 0 0 1-2.258-2.238Zm2.248-5.19L6.69 4.442a1.5 1.5 0 0 0-2.122 0l-.127.127a1.5 1.5 0 0 0 0 2.122l3.849 3.848a4 4 0 0 1 2.238-2.258Z"
                    />
                  </svg> */}
                  {/* <span className="flex-1 ms-3 whitespace-nowrap">Support</span> */}
                </a>
              </li>
              <li>
                <div className="flex items-center  px-2 py-1.5 text-body rounded-base hover:bg-gray-200 hover:text-fg-brand group">
                  <LogOut className="text-red-600 " />
                  <span
                    className="flex-1 ms-3 text-red-600 whitespace-nowrap cursor-pointer"
                    onClick={handleLogOut}
                  >
                    Log out{" "}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
};

const UserDropdown = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDashboardClick = () => {
    navigate("/admin");
    setOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
    setOpen(false);
  };

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

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-50 z-50 w-44 bg-gray-100 border border-default-medium rounded-base shadow-lg">
          <div className="px-4 py-3 border-b border-default-medium">
            <p className="text-sm font-bold text-heading">Admin</p>
          </div>
          <ul className="p-2 text-sm text-body font-medium">
            <li>
              <button
                onClick={handleDashboardClick}
                className="inline-flex items-center w-full p-2 hover:bg-gray-200 hover:text-heading rounded text-left"
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
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

export default SidebarNavbar;
