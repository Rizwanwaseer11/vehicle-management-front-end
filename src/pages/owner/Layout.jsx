import SidebarNavbar from "@/components/owner/SidebarNavbar";
import React from "react";
import { Outlet } from "react-router-dom";



const Layout = () => {
  return (
    <div className="flex flex-col">
        <SidebarNavbar />
      <div className="flex">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;


