import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GradingIcon from "@mui/icons-material/Grading";
import UploadIcon from "@mui/icons-material/Upload";
import { useNotification } from "../../../shared/components/NotificationContext";
import DownloadIcon from "@mui/icons-material/Download";
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

interface Participant {
  userId: number;
  userName: string;
  email: string;
}

const GradeSolutions: React.FC = () => {
  const { courseId, assignmentId } = useParams<{
    courseId: string;
    assignmentId: string;
  }>();
  const [data, setData] = useState<SubmissionOverview[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [assignmentName, setAssignmentName] = useState<string>();
  const { showNotification } = useNotification();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newStudentId, setNewStudentId] = useState<number | "">("");

  useEffect(() => {
    api
      .get<{ name: string }>(`/assignments/${assignmentId}/assignmentName`)
      .then((r) => setAssignmentName(r.data.name));
  }, [assignmentId]);

  // load existing submissions
  const loadSubmissions = () => {
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
  };

  // load participants
  const loadParticipants = () => {
    if (!assignmentId) return;
    api
      .get<Participant[]>(`/participants/course/${courseId}`)
      .then((res) => setParticipants(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    loadSubmissions();
    loadParticipants();
  }, [assignmentId]);

  const availableStudents = participants.filter(
    (p) => !data.some((d) => d.fullName === p.userName)
  );
  const handleCreate = async () => {
    if (!assignmentId || newStudentId === "") return;
    try {
      console.log(newStudentId);
      console.log(assignmentId);
      await api.post(`/assignments/${assignmentId}/solutions/manual`, {
        studentId: newStudentId,
      });
      setNewStudentId("");
      showNotification("Riešenie bolo úspešne pridané", "success");
      loadSubmissions();
    } catch (e) {
      console.error("Chyba pri vytváraní riešenia", e);
      showNotification("Riešenie sa nepodarilo pridať", "error");
    }
  };

  const downloadAll = async (solutionId: number) => {
    try {
      // responseType: 'blob' ensures we get binary data
      const res = await api.get<Blob>(
        `/solutions/${solutionId}/download-all-versions`,
        { responseType: "blob" }
      );
      // create a blob URL
      const blobUrl = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/zip" })
      );
      // create a temporary <a> to trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", `solution_${solutionId}_all_versions.zip`);
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
        Hodnotenie riešení – zadanie {assignmentName ?? assignmentId}
      </Typography>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Manuálne vytvoriť záznam</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ py: 1, px: 2 }}>
  {availableStudents.length === 0 ? (
    <Typography variant="body2" color="textSecondary">
      Všetci študenti už majú odovzdané riešenie.
    </Typography>
  ) : (
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            // flexWrap odstránime, aby sa prvky neskladali pod seba
            // flexWrap="wrap"
          >
            <FormControl size="small" sx={{ minWidth: 160, maxWidth: 200 }}>
              <InputLabel id="student-select-label" sx={{ lineHeight: 1.2 }}>
                Študent
              </InputLabel>
              <Select
                labelId="student-select-label"
                value={newStudentId ?? ""}
                label="Študent"
                onChange={(e) => setNewStudentId(Number(e.target.value))}
              >
                {availableStudents.map((p) => (
                  <MenuItem key={p.userId} value={p.userId}>
                    {p.userName}({p.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              size="medium"
              variant="contained"
              onClick={handleCreate}
              disabled={newStudentId == ""}
            >
              Vytvoriť
            </Button>
          </Box>
          )}
        </AccordionDetails>
      </Accordion>
      <TableContainer component={Paper} sx={{ mt: 1 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vytvorené</TableCell>
              <TableCell>Upravené</TableCell>
              <TableCell>Študent</TableCell>
              <TableCell align="right">Počet verzií</TableCell>
              <TableCell>Posledná IP adresa</TableCell>
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
                  <TableCell align="right">{row.versionsCount}</TableCell>
                  <TableCell>{row.lastIpAddress ?? "—"}</TableCell>
                  <TableCell align="right">{row.points ?? "—"}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Stiahnuť všetky verzie">
                      <IconButton
                        size="small"
                        onClick={() => downloadAll(row.solutionId)}
                        disabled={row.versionsCount === 0}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
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
                    <input
                      type="file"
                      style={{ display: "none" }}
                      id={`upload-${row.solutionId}`}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const form = new FormData();
                        form.append("file", file);
                        form.append("comment", "");
                        try {
                          await api.post(
                            `/solutions/${row.solutionId}/versions`,
                            form,
                            {
                              headers: {
                                "Content-Type": "multipart/form-data",
                              },
                            }
                          );
                          loadSubmissions();
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                    />
                    <label htmlFor={`upload-${row.solutionId}`}>
                      <IconButton
                        component="span"
                        size="small"
                        disabled={row.solutionId == null}
                      >
                        <UploadIcon />
                      </IconButton>
                    </label>
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
