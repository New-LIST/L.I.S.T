import React, { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { getStoredUser } from '../../Authentication/utils/auth';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Courses from '../../Courses/Pages/Courses';
import Periods from '../../Periods/Pages/Periods';
import Categories from '../../Categories/pages/Categories';
import Users from '../../Users/pages/Users';
import StudentCourses from '../../Courses/Pages/StudentCourses';
import CourseDetail from "../../Courses/Pages/CourseDetail.tsx";

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
                    <Routes>
                        <Route index element={<StudentCourses/>}/>
                        <Route path="courses/:id" element={<CourseDetail/>}/>
                    </Routes>
                </main>

            </>
        );
    }

    return (
        <>
            <Header onMenuClick={handleDrawerToggle}/>
            <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle}/>
            <main style={{marginTop: '64px', padding: '1rem' }}>
                <Routes>
                    <Route path="courses" element={<Courses />} />
                    <Route path="periods" element={<Periods />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="users" element={<Users />} />
                    <Route index element={<Navigate to="courses" replace />} />
                </Routes>
            </main>
        </>
    );
}
