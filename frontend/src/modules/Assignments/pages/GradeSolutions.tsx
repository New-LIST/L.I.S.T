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
  IconButton
} from "@mui/material";
import GradingIcon from "@mui/icons-material/Grading";

import api from "../../../services/api";

interface SubmissionOverview {
  solutionId: number;
  created: string;
  updated: string;
  fullName: string;
  email: string;
  group: string;
  versionsCount: number;
  lastIpAddress?: string;
  points: number | null;
}

const GradeSolutions: React.FC = () => {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>();
  const [data, setData] = useState<SubmissionOverview[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!assignmentId) return;
    setLoading(true);
    api
      .get<SubmissionOverview[]>(`/assignments/${assignmentId}/solutions/grade`)
      .then((res) =>
        setData(
          res.data.map((d) => ({
            ...d,
            created: new Date(d.created).toLocaleString("sk-SK"),
            updated: new Date(d.updated).toLocaleString("sk-SK"),
          }))
        )
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [assignmentId]);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Hodnotenie riešení – zadanie #{assignmentId}
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vytvorené</TableCell>
              <TableCell>Upravené</TableCell>
              <TableCell>Študent</TableCell>
              <TableCell>Skupina</TableCell>
              <TableCell align="right">Počet verzií</TableCell>
              <TableCell>IP adresa</TableCell>
              <TableCell align="right">Body</TableCell>
              <TableCell align="center">Akcie</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              data.map((row) => (
                <TableRow key={row.solutionId}>
                  <TableCell>{row.created}</TableCell>
                  <TableCell>{row.updated}</TableCell>
                  <TableCell>
                    {row.fullName} ({row.email})
                  </TableCell>
                  <TableCell>{row.group}</TableCell>
                  <TableCell align="right">{row.versionsCount}</TableCell>
                  <TableCell>{row.lastIpAddress ?? "—"}</TableCell>
                  <TableCell align="right">{row.points ?? "—"}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Hodnotiť riešenie">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() =>
                          navigate(
                            `/dash/grade/course/${courseId}/assignments/${assignmentId}/solutions/${row.solutionId}/evaluate`
                          )
                        }
                      >
                        <GradingIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Žiadne odovzdané riešenia
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GradeSolutions;
