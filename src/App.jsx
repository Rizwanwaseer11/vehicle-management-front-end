import { useState } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";

// import './App.css'
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PageNotFound from "./pages/404";
import Footer from "./components/Footer";
import Layout from "./pages/owner/Layout";
import Dashboard from "./pages/owner/Dashboard";
import ManageDrivers from "./pages/owner/pages/ManageDrivers";
import ManagePassengers from "./pages/owner/pages/ManagePassengers";
import ManageRoutes from "./pages/owner/pages/ManageRoutes";
import Notifications from "./pages/owner/pages/Notifications";
import AccountSettings from "./pages/owner/pages/AccountSettings";
import { Login } from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import LayoutEmp from "./pages/Employee/LayoutEmp";
import LiveTracking from "./pages/owner/pages/LiveTracking";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  //navbars locations
  // const isAdminPath = useLocation().pathname.startsWith("/admin");
  const isEmployeePath = useLocation().pathname.startsWith("/employee");
  const isAdminPath =
    useLocation().pathname.startsWith("/admin") ||
    useLocation().pathname === "/login";
  const location = useLocation().pathname;
  const isHiddenPath =
    location.startsWith("/admin") ||
    location === "/login" ||
    location.startsWith("/employee");

  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      {/* {!isAdminPath && <Navbar setShowLogin={setShowLogin} />} */}
      {!isHiddenPath && <Navbar setShowLogin={setShowLogin} />}

      <div className="min-h-screen flex flex-col">
        {/* Content wrapper */}
        <div className="flex-1">
        <Routes>
            {/* <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} /> */}
            <Route path="*" element={<PageNotFound />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />        
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* ////  Admin Dashboard (Protected) */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="manage-drivers" element={<ManageDrivers />} />
              <Route path="manage-passengers" element={<ManagePassengers />} />
              <Route path="manage-routes" element={<ManageRoutes />} />
              <Route path="manage-tracking" element={<LiveTracking />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="account-settings" element={<AccountSettings />} />
            </Route>

            {/* Employee Dashboard (Protected) */}
            <Route 
              path="/employee" 
              element={
                <ProtectedRoute requiredRole="employee">
                  <LayoutEmp />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={<Dashboard isEmployeePath={true} />}
              />
              <Route path="manage-drivers" element={<ManageDrivers isEmployeePath={true} />} />
              <Route path="manage-passengers" element={<ManagePassengers isEmployeePath={true} />} />
              <Route path="manage-routes" element={<ManageRoutes isEmployeePath={true} />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="account-settings" element={<AccountSettings />} />
            </Route>
          </Routes>  
        </div>
      </div>

      

      {/* {!isAdminPath && <Footer setShowLogin={setShowLogin} />} */}
      {!isHiddenPath && <Footer />}
    </>
  );
}

export default App;
