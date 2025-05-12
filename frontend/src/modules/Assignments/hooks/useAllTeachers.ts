import { useEffect, useState } from "react";
import { User } from "../../Users/types/User";
import api from "../../../services/api";

export const useAllTeachers = () => {
  const [teachers, setTeachers] = useState<User[]>([]);

  useEffect(() => {
    api.get<User[]>("/users/teachers").then(res => setTeachers(res.data));
  }, []);

  return teachers;
};
