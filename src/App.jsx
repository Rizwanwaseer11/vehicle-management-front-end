import { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

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
import { Login } from "./pages/Login";
import LayoutEmp from "./pages/Employee/LayoutEmp";

function App() {
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
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<PageNotFound />} />

            <Route path="/login" element={<Login />} />
            {/* ////  dash */}
            
            <Route path="/admin" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="manage-drivers" element={<ManageDrivers />} />
              <Route path="manage-passengers" element={<ManagePassengers />} />
              <Route path="manage-routes" element={<ManageRoutes />} />
            </Route>

            {/* Employee */}
            <Route path="/employee" element={<LayoutEmp />}>
              <Route
                index
                element={<Dashboard isEmployeePath={isEmployeePath} />}
              />
              <Route path="manage-drivers" element={<ManageDrivers isEmployeePath={isEmployeePath} />} />
              <Route path="manage-passengers" element={<ManagePassengers isEmployeePath={isEmployeePath} />} />
              <Route path="manage-routes" element={<ManageRoutes isEmployeePath={isEmployeePath} />} />
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
