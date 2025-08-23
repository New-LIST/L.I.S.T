import { Outlet, Navigate } from "react-router-dom";
import { getStoredUser } from "../../Authentication/utils/auth.ts";
import Header from "../components/Header.tsx";
import Sidebar from "../components/Sidebar.tsx";
import React, { useState } from 'react';
import {Box} from "@mui/material";
import { useTranslation } from 'react-i18next'

const drawerWidth = 240;

export default function Dashboard() {
    const [isPermanent, setIsPermanent] = useState(false);
    const user = getStoredUser();
    if (!user) return <Navigate to="/signin" replace />;
    
    const { t } = useTranslation();
    
    const sidebarItems = [
        { label: t('Courses'), path: 'courses' },
        { label: t('Periods'), path: 'periods' },
        { label: t('Categories'), path: 'categories' },
        { label: t('Users'), path: 'users' },
        { label: t('Task Set Types'), path: 'task set types' },
        { label: t('Tasks'), path: 'tasks' },
        { label: t('Assignments'), path: 'assignments'},
        { label: t('Logs'), path: 'logs'},
        { label: t('Grading'), path: 'grade'},
        { label: 'Test', path: 'tests'}
    ];

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
