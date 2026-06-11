import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import DownloadingIcon from "@mui/icons-material/Downloading";
import GradingIcon from "@mui/icons-material/Grading";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import api from "../../../services/api";

interface AssignmentItem {
  id: number;
  name: string;
  taskSetTypeId: number;
  taskSetTypeName: string;
  uploadEndTime: string | null;
}

const GradeAssignments: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [courseName, setCourseName] = useState<string>();

  useEffect(() => {
    if (!courseId) return;

    api
      .get<{ name: string }>(`/courses/${courseId}/courseName`)
      .then((res) => setCourseName(res.data.name))
      .catch((err) => console.error("Chyba načítania názvu kurzu:", err));
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;

    setLoading(true);
    api
      .get<AssignmentItem[]>(`/assignments/course/${courseId}`)
      .then((res) => setAssignments(res.data))
      .catch((err) => console.error("Chyba načítania zadaní:", err))
      .finally(() => setLoading(false));
  }, [courseId]);

  const downloadAll = async (assignmentId: number) => {
    try {
      const res = await api.get<Blob>(
        `/assignments/${assignmentId}/solutions/download-all`,
        { responseType: "blob" }
      );
      const blobUrl = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/zip" })
      );
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", `assignment_${assignmentId}_solutions.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Zadania pre kurz {courseName ?? courseId}
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Názov zadania</TableCell>
              <TableCell>Typ zostavy</TableCell>
              <TableCell>Koniec odovzdávania</TableCell>
              <TableCell align="center">Akcie</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : assignments.length > 0 ? (
              assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>{assignment.name}</TableCell>
                  <TableCell>{assignment.taskSetTypeName}</TableCell>
                  <TableCell>
                    {assignment.uploadEndTime
                      ? new Date(assignment.uploadEndTime).toLocaleString(
                          "sk-SK"
                        )
                      : "-"}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Stiahnuť riešenia">
                      <IconButton
                        size="small"
                        onClick={() => downloadAll(assignment.id)}
                      >
                        <DownloadingIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Hodnotiť riešenia">
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(
                            `/dash/grade/course/${courseId}/assignments/${assignment.id}/grade-solutions`
                          )
                        }
                      >
                        <GradingIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Hromadné hodnotenie">
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(
                            `/dash/grade/course/${courseId}/assignments/${assignment.id}/bulk-grade`
                          )
                        }
                      >
                        <GroupWorkIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Žiadne zadania
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GradeAssignments;
