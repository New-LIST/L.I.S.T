import { useEffect, useState } from "react";
import { Course } from "../../Courses/Types/Course";
import api from "../../../services/api";

export const useAllCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    api.get<Course[]>("/courses").then(res => setCourses(res.data));
  }, []);

  return courses;
};
