import SideNavbarEmployee from "@/components/owner/SideNavbarEmployee";
import React from "react";
import { Outlet } from "react-router-dom";



const LayoutEmp = () => {
  return (
    <div className="flex flex-col">
        {/* <SidebarNavbar /> */}
        <SideNavbarEmployee />
      <div className="flex">
        <Outlet />
      </div>
    </div>
  );
};

export default LayoutEmp;


