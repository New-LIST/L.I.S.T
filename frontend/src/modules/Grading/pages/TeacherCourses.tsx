// src/modules/assignments/pages/TeacherCourses.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import api from "../../../services/api";
import GradingIcon from "@mui/icons-material/Grading";
import TableChartIcon from '@mui/icons-material/TableChart';


interface Course {
  id: number;
  name: string;
}

const TeacherCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get<Course[]>("/courses/teacherId");
        setCourses(res.data);
      } catch (err) {
        console.error("Chyba pri načítaní kurzov", err);
      }
    };
    fetchCourses();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Moje kurzy
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Názov kurzu</TableCell>
              <TableCell align="right">Akcie</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell component="th" scope="row">
                  {course.name}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Hodnotiť zadania">
                    <IconButton
                      size="small"
                      onClick={() =>
                        navigate(`/dash/grade/course/${course.id}`)
                      }
                    >
                      <GradingIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Tabuľka hodnotení">
                    <IconButton
                      size="small"
                      onClick={() =>
                        navigate(`/dash/grade/course/${course.id}/matrix`)
                      }
                    >
                      <TableChartIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TeacherCourses;
