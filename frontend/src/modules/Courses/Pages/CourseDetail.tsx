import { useParams, Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { useState } from "react";
import Sidebar from "../../Application/components/Sidebar.tsx";
import { useTranslation } from 'react-i18next';

const drawerWidth = 240;
export default function CourseDetail() {
    const { t } = useTranslation();
    const [isPermanent, setIsPermanent] = useState(false);
    const { id } = useParams();
    if (!id) return null;

    const courseSidebarItems = [
        { label: 'Kurzy', path: '/student' },
        { label: 'Popis', path: 'description' },
        { label: 'Úlohy', path: 'assignments' },
        { label: 'Prehľad', path: 'overview' },
        { label: t('Projects'), path: 'projects' },
        { label: 'Skupiny', path: 'groups' },
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar
                items={courseSidebarItems}
                basePath={`/student/courses/${id}/`}
                onModeChange={(permanent) => setIsPermanent(permanent)}
            />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    ml: isPermanent ? `${drawerWidth}px` : 0,
                    transition: 'margin-left 0.3s',
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}
