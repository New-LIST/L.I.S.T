import { Outlet, Navigate } from "react-router-dom";
import { getStoredUser } from "../../Authentication/utils/auth.ts";
import Header from "../components/Header.tsx";
import Sidebar from "../components/Sidebar.tsx";
import { useEffect, useState } from 'react';
import {Box} from "@mui/material";
import { useTranslation } from 'react-i18next'
import api from "../../../services/api.ts";
import { AssistantCoursePermission } from "../../Users/types/AssistantPermissions.ts";

const drawerWidth = 240;

export default function Dashboard() {
    const [isPermanent, setIsPermanent] = useState(false);
    const [assistantPermissions, setAssistantPermissions] = useState<AssistantCoursePermission[]>([]);
    const user = getStoredUser();
    if (!user) return <Navigate to="/signin" replace />;
    
    const { t } = useTranslation();
    const role = user.role?.toLowerCase();

    useEffect(() => {
        if (role !== "assistant") return;

        api.get<AssistantCoursePermission[]>("/assistant-permissions/me")
            .then((res) => setAssistantPermissions(res.data))
            .catch(() => setAssistantPermissions([]));
    }, [role]);

    const assistantHasManage = assistantPermissions.some((p) => p.canManageCourseContent);
    const assistantHasGrade = assistantPermissions.some((p) => p.canGradeCourse);
    
    const teacherSidebarItems = [
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

    const assistantSidebarItems = [
        { label: t('Courses'), path: 'courses' },
        ...(assistantHasManage
            ? [
                { label: t('Categories'), path: 'categories' },
                { label: t('Tasks'), path: 'tasks' },
                { label: t('Assignments'), path: 'assignments' }
            ]
            : []),
        ...(assistantHasGrade
            ? [{ label: t('Grading'), path: 'grade' }]
            : [])
    ];

    const sidebarItems = role === "assistant" ? assistantSidebarItems : teacherSidebarItems;

    if (role === 'student') {
        return (
            <>
                <Header />
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
                <Header />
                <Outlet />
            </Box>
        </Box>
    );
}
