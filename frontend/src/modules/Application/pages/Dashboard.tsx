import { Outlet, Navigate } from "react-router-dom";
import { getStoredUser } from "../../Authentication/utils/auth.ts";
import Header from "../components/Header.tsx";
import Sidebar from "../components/Sidebar.tsx";
import React, { useState } from 'react';
import {Box} from "@mui/material";

const sidebarItems = [
    { label: 'Kurzy', path: 'dash/courses' },
    { label: 'Obdobia', path: 'dash/periods' },
    { label: 'Kategórie', path: 'dash/categories' },
    { label: 'Používatelia', path: 'dash/users' },
    { label: 'Typy Zostav', path: 'dash/task set types' },
];
const drawerWidth = 240;

export default function Dashboard() {
    const [isPermanent, setIsPermanent] = useState(false);
    const user = getStoredUser();
    if (!user) return <Navigate to="/signin" replace />;

    const role = user.role?.toLowerCase();

    if (role === 'student') {
        return (
            <>
                <Header onMenuClick={() => {}} />
                <main style={{ marginTop: '64px', padding: '1rem' }}>
                    <Outlet />
                </main>
            </>
        );
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar
                items={sidebarItems}
                basePath="/dash/"
                onModeChange={setIsPermanent}
            />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    ml: isPermanent ? `${drawerWidth}px` : 0,
                    transition: 'margin-left 0.3s',
                    mt: '64px',
                    p: 3,
                }}
            >
                <Header onMenuClick={() => {}} />
                <Outlet />
            </Box>
        </Box>
    );
}