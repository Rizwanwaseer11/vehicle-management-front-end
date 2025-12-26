import React, { useEffect, useMemo, useRef, useState } from "react";
import PageTitle from "./../../components/Typography/PageTitle";
import { Bus, User, Route, Users } from "lucide-react";
import InfoCard from "../../components/Cards/InfoCard";
import QuickActions from "../../components/Cards/QuickActions";

/**
 * ===============================
 * API PLACEHOLDERS – ADD YOUR URLS
 * ===============================
 */
const API = {
  users: "https://vehicle-management-ecru.vercel.app/api/admin/", // returns ALL users
  activeBuses: "https://vehicle-management-ecru.vercel.app/api/buses/",
  routes: "https://vehicle-management-ecru.vercel.app/api/trips/",
  trips: "https://vehicle-management-ecru.vercel.app/api/trips",
};

const Dashboard = ({ isEmployeePath }) => {
  return (
    <main className="antialiased p-10 w-full h-full bg-gray-200 dark:bg-gray-700 md:ml-64 pt-20">
      <div className="mt-8 mb-6">
        <PageTitle>Dashboard</PageTitle>
        <p className="text-sm font-light dark:text-gray-300 text-gray-600">
          Real-time transportation management insights
        </p>
      </div>

      <DashboardCards isEmployeePath={isEmployeePath} />
      <Cards isEmployeePath={isEmployeePath} />
    </main>
  );
};

export default Dashboard;

const DashboardCards = ({ isEmployeePath }) => {
  const [users, setUsers] = useState([]);
  const [activeBuses, setActiveBuses] = useState([]);
  const [routes, setRoutes] = useState([]);

  const lastCountsRef = useRef({
    users: 0,
    buses: 0,
    routes: 0,
  });

  /** ===============================
   * TOKEN (ADDED)
   * =============================== */
  const token = localStorage.getItem("token");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  /**
   * ===============================
   * FETCH FUNCTIONS (TOKEN + ERROR HANDLING)
   * ===============================
   */
  const fetchJSON = async (url) => {
    try {
      const res = await fetch(url, { headers: authHeaders });
      const contentType = res.headers.get("content-type");
      if (!res.ok) {
        console.error("Fetch failed:", url, res.status, await res.text());
        return [];
      }
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        return Array.isArray(data) ? data : data.users || data.routes || data || [];
      } else {
        console.error("Expected JSON but got HTML:", url, await res.text());
        return [];
      }
    } catch (err) {
      console.error("Dashboard API error:", err);
      return [];
    }
  };

  const fetchUsers = () => fetchJSON(API.users);
  const fetchActiveBuses = () => fetchJSON(API.activeBuses);
  const fetchRoutes = () => fetchJSON(API.routes);

  /**
   * ===============================
   * INITIAL + CONDITIONAL FETCH
   * ===============================
   */
 const dataLoadedRef = useRef(false);

useEffect(() => {
  const loadDashboardData = async () => {
    if (dataLoadedRef.current) return; // prevent repeated fetch

    try {
      const [usersRes, busesRes, routesRes] = await Promise.all([
        fetchUsers(),
        fetchActiveBuses(),
        fetchRoutes(),
      ]);

      setUsers(usersRes);
      setActiveBuses(busesRes);
      setRoutes(routesRes);

      lastCountsRef.current = {
        users: usersRes.length,
        buses: busesRes.length,
        routes: routesRes.length,
      };

      dataLoadedRef.current = true; // mark as loaded
    } catch (err) {
      console.error("Dashboard API error:", err);
    }
  };

  if (token) loadDashboardData();
}, [token]);
  /**
   * ===============================
   * MEMOIZED COUNTS (NO RE-COMPUTE)
   * ===============================
   */
  const totalDrivers = useMemo(() => users.filter((u) => u.role === "driver").length, [users]);
  const totalPassengers = useMemo(() => users.filter((u) => u.role === "passenger").length, [users]);
  const activeRoutes = useMemo(() => routes.filter((r) => r.isActive === true).length, [routes]);
  const activeBus = useMemo(() => activeBuses.filter((b) => b.isActive === true).length, [activeBuses]);

  /**
   * ===============================
   * STATS (DESIGN UNCHANGED)
   * ===============================
   */
  const stats = [
    {
      title: "Active Buses",
      value: activeBus, // HARD-CODED for now
      icon: Bus,
      color: "bg-blue-500/30",
      textColor: "text-blue-500",
      change: "Live data",
    },
    {
      title: "Total Drivers",
      value: totalDrivers,
      icon: User,
      color: "bg-green-500/30",
      textColor: "text-green-500",
      change: "From users API",
    },
    {
      title: "Active Routes",
      value: activeRoutes,
      icon: Route,
      color: "bg-purple-500/30",
      textColor: "text-purple-700",
      change: "Currently running",
    },
    {
      title: "Total Passengers",
      value: totalPassengers,
      icon: Users,
      color: "bg-orange-500/30",
      textColor: "text-orange-400",
      change: "Registered users",
    },
  ];

  return (
    <div className="grid gap-4 mb-8 md:grid-cols-2 xl:grid-cols-4 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <InfoCard key={index} title={stat.title} value={stat.value} change={stat.change}>
            <div className={`p-3 ${stat.textColor} rounded-xl ${stat.color}`}>
              <Icon size={26} />
            </div>
          </InfoCard>
        );
      })}
    </div>
  );
};

/**
 * ===============================
 * RECENT ACTIVITIES & QUICK ACTIONS
 * ===============================
 */
const Cards = ({ isEmployeePath }) => {
  const activities = [
    { time: "10:30 AM", text: "Bus #7 completed Route A", type: "success" },
    { time: "10:15 AM", text: "Driver John Smith started Route B", type: "info" },
    { time: "09:45 AM", text: "Delay reported on Route C - 10 mins", type: "warning" },
    { time: "09:30 AM", text: "Bus #3 maintenance scheduled", type: "info" },
    { time: "09:30 AM", text: "Bus #3 maintenance scheduled", type: "info" },
    { time: "09:30 AM", text: "Bus #3 maintenance scheduled", type: "info" },
  ];

  return (
    <>
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        {/* SIMPLE CARD */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-light dark:text-gray-300">Recent Activity</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Latest transportation updates
          </p>
          <div className="space-y-4">
            {activities.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-600 last:border-0 last:pb-0"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-gray-800 dark:text-gray-300 text-sm">{activity.text}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isEmployeePath && (
          <div className="bg-white dark:bg-gray-800 h-90 rounded-xl shadow-lg p-6">
            <QuickActions />
          </div>
        )}
      </div>
    </>
  );
};
