import { Outlet, Navigate } from "react-router-dom";
import { getStoredUser } from "../../Authentication/utils/auth.ts";
import { menuConfigByRole } from "../config/menuConfigByRole.tsx";
import Header from "../components/Header.tsx";
import Sidebar from "../components/Sidebar.tsx";
import React, { useState } from 'react';

export default function Dashboard() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const user = getStoredUser();
    if (!user) return <Navigate to="/signin" replace />;

    const role = user.role?.toLowerCase();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    if (role === 'student') {
        return (
            <>
                <Header onMenuClick={handleDrawerToggle}/>
                <main style={{marginTop: '64px', padding: '1rem'}}>
                    <Outlet/>
                </main>

            </>
        );
    }

  return (
    <div style={{ display: "flex" }}>
    <Sidebar mobileOpen={false} onClose={handleDrawerToggle} />
    <div style={{ flexGrow: 1, marginLeft: 240 }}>
      <Header onMenuClick={() => {}} />
      <main style={{ marginTop: "64px", padding: "1rem" }}>
        <Outlet />
      </main>
    </div>
  </div>
  );
}
