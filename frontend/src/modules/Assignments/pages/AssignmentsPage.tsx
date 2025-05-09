import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  Typography,
  Box,
  TableContainer
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Assignment } from "../types/Assignment";
import api from "../../../services/api";


const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    // nacitanie assignmentov z API
    api.get<Assignment[]>("/assignments")
      .then(res => setAssignments(res.data))
      .catch(err => console.error("Failed to load assignments", err));
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Zoznam zadaní</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Názov</TableCell>
              <TableCell>Kurz</TableCell>
              <TableCell>Autor</TableCell>
              <TableCell>Publikované od</TableCell>
              <TableCell align="right">Akcie</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>{assignment.name}</TableCell>
                <TableCell>{assignment.course?.name}</TableCell>
                <TableCell>{assignment.teacher?.fullname ?? assignment.teacher?.email}</TableCell>
                <TableCell>{assignment.publishStartTime ? new Date(assignment.publishStartTime).toLocaleDateString() : "-"}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AssignmentsPage;
