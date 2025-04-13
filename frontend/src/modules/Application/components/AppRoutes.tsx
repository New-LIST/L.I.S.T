import { Routes, Route, Navigate } from "react-router-dom";
import Courses from "../../Courses/Pages/Courses";
import TaskSets from "../../TaskSets/Pages/TaskSets";
import TaskSetTypes from "../../TaskSets/Pages/TaskSetTypes";
import Users from "../../Users/pages/Users";
import Periods from "../../Periods/Pages/Periods";
import Categories from "../../Categories/pages/Categories";
import Dashboard from "../pages/Dashboard";
import RequireAuth from "../../Authentication/components/RequireAuth";
import SignIn from "../../Authentication/pages/SignIn";
import StudentCourses from "../../Courses/Pages/StudentCourses";
import CourseDetail from "../../Courses/Pages/CourseDetail";
import RootRedirect from "./RootRedirect";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/signin" element={<SignIn />} />
      <Route
        path="/student"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      >
        <Route index element={<StudentCourses />} />
        <Route path="courses/:id" element={<CourseDetail />} />
      </Route>
      <Route
        path="/dash"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      >
        {/* podstránky do Dashboardu */}
        <Route index element={<Navigate to="courses" replace />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:id/tasksets" element={<TaskSets />} />
        <Route path="task set types" element={<TaskSetTypes />} />
        <Route path="periods" element={<Periods />} />
        <Route path="categories" element={<Categories />} />
        <Route path="users" element={<Users />} />
      </Route>

      {/* fallback na root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
