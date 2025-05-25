// src/modules/assignments/pages/GradeAssignments.tsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  CircularProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import api from "../../../services/api";
import DownloadingIcon from "@mui/icons-material/Downloading";
import GradingIcon from "@mui/icons-material/Grading";
import GroupWorkIcon from "@mui/icons-material/GroupWork";

interface AssignmentItem {
  id: number;
  name: string;
  taskSetTypeId: number;
  taskSetTypeName: string;
  uploadEndTime: string | null;
}

const GradeAssignments: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [courseName, setCourseName] = useState<string>();
  useEffect(() => {
    api.get<{ name: string }>(`/courses/${courseId}/courseName`)
      .then(r => setCourseName(r.data.name));
  }, [courseId]);

  useEffect(() => {
    console.log(courseId);
    if (!courseId) return;
    setLoading(true);
    (async () => {
      try {
        const res = await api.get<AssignmentItem[]>(
          `/assignments/course/${courseId}`
        );
        console.log("STRASNE SUPEEER");
        setAssignments(res.data);
      } catch (err) {
        console.error("Chyba načítania zadaní:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  const downloadAll = async (assignmentId: number) => {
    try {
      // responseType: 'blob' ensures we get binary data
      const res = await api.get<Blob>(
        `/assignments/${assignmentId}/solutions/download-all`,
        { responseType: 'blob' }
      );
      // create a blob URL
      const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }));
      // create a temporary <a> to trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `assignment_${assignmentId}_solutions.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download error:', err);
    }
  };


  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Zadania pre kurz {courseName ?? courseId}
      </Typography>
      <TableContainer component={Paper}>
        <Table>
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
                <TableCell colSpan={3} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : assignments.length > 0 ? (
              assignments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.name}</TableCell>
                  <TableCell>{a.taskSetTypeName}</TableCell>
                  <TableCell>
                    {a.uploadEndTime
                      ? new Date(a.uploadEndTime).toLocaleString("sk-SK")
                      : "—"}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Stiahnuť riešenia">
                      <IconButton
                        size="small"
                        onClick={() => downloadAll(a.id)}
                      >
                        <DownloadingIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Hodnotiť riešenia">
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(`/dash/grade/course/${courseId}/assignments/${a.id}/grade-solutions`)
                        }
                      >
                        <GradingIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Hromadné hodnotenie">
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(`/dash/grade/course/${courseId}/assignments/${a.id}/bulk-grade`)
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
                <TableCell colSpan={3} align="center">
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
