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
import CourseDescription from "../../Courses/Pages/Course/CourseDescription.tsx";
import Assignments from "../../Courses/Pages/Course/Assignments";
import Overview from "../../Courses/Pages/Course/Overview/Overview.tsx";
import Projects from "../../Courses/Pages/Course/Projects";
import RootRedirect from "./RootRedirect";
import Tasks from "../../Tasks/Pages/Tasks.tsx";
import TaskEditor from "../../Tasks/Pages/TaskEditor.tsx";
import LogsPage from "../../Logs/Pages/LogsPage.tsx";
import AssignmentsPage from "../../Assignments/pages/AssignmentsPage.tsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/signin" element={<SignIn />} />
        <Route path="/student" element={<RequireAuth><Dashboard /></RequireAuth>}>
            <Route index element={<StudentCourses />} />
            <Route path="courses/:id" element={<CourseDetail />}>
                <Route index element={<CourseDescription />} />
                <Route path="description" element={<CourseDescription />} />
                <Route path="assignments" element={<Assignments />} />
                <Route path="overview" element={<Overview />} />
                <Route path="projects" element={<Projects />} />
            </Route>
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
        <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/new" element={<TaskEditor />} />
          <Route path="tasks/:id/edit" element={<TaskEditor />} />
        <Route path="logs" element={<LogsPage/>}/>
        <Route path="assignments" element={<AssignmentsPage/>}/>
      </Route>

      {/* fallback na root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
