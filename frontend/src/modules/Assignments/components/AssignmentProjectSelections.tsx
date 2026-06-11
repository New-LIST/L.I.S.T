import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import api from "../../../services/api";
import { useNotification } from "../../../shared/components/NotificationContext";
import { TeacherProjectSelections } from "../types/Project";
import { useTranslation } from "react-i18next";

type Props = {
  assignmentId: number;
};

type StudentRow = {
  studentId: number;
  fullName: string;
  email: string;
  hasSolution: boolean;
  selectedTaskId: number | null;
};

export default function AssignmentProjectSelections({ assignmentId }: Props) {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [data, setData] = useState<TeacherProjectSelections | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingStudentId, setSavingStudentId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<TeacherProjectSelections>(
        `/projects/assignments/${assignmentId}/selections`
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
      showNotification(t("Could not load project selections"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [assignmentId]);

  const rows = useMemo<StudentRow[]>(() => {
    if (!data) return [];

    const selected = data.topics.flatMap((topic) =>
      topic.students.map((student) => ({
        ...student,
        selectedTaskId: topic.taskId,
      }))
    );

    const unassigned = data.unassignedStudents.map((student) => ({
      ...student,
      selectedTaskId: null,
    }));

    return [...selected, ...unassigned].sort((a, b) =>
      a.fullName.localeCompare(b.fullName)
    );
  }, [data]);

  const assignProject = async (studentId: number, taskId: number | null) => {
    setSavingStudentId(studentId);
    try {
      await api.patch(
        `/projects/assignments/${assignmentId}/students/${studentId}`,
        { taskId }
      );
      showNotification(t("Project selection was set"), "success");
      await load();
    } catch (err: any) {
      showNotification(
        err.response?.data ?? t("Could not set project selection"),
        "error"
      );
    } finally {
      setSavingStudentId(null);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return <Alert severity="error">{t("Project selections unavailable")}</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Alert severity="info">
        {t("Teacher Project Selection Info")}
      </Alert>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t("Project Topics Overview")}
        </Typography>
        <Stack spacing={1}>
          {data.topics.map((topic) => (
            <Box
              key={topic.taskId}
              display="flex"
              justifyContent="space-between"
              gap={2}
              flexWrap="wrap"
            >
              <Typography fontWeight={600}>{topic.name}</Typography>
              <Typography color="text.secondary">
                {topic.selectedCount}
                {topic.selectionLimit ? ` / ${topic.selectionLimit}` : ` / ${t("No Limit").toLowerCase()}`}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("Student")}</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>{t("Project Topic")}</TableCell>
              <TableCell>{t("Status")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.studentId}>
                <TableCell>{row.fullName}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 260 }}>
                    <InputLabel id={`project-selection-${row.studentId}`}>
                      {t("Topic")}
                    </InputLabel>
                    <Select
                      labelId={`project-selection-${row.studentId}`}
                      label={t("Topic")}
                      value={row.selectedTaskId?.toString() ?? ""}
                      disabled={row.hasSolution || savingStudentId === row.studentId}
                      onChange={(e) =>
                        assignProject(
                          row.studentId,
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                    >
                      <MenuItem value="">{t("No Project")}</MenuItem>
                      {data.topics.map((topic) => {
                        const isCurrent = row.selectedTaskId === topic.taskId;
                        const disabled = topic.isFull && !isCurrent;
                        return (
                          <MenuItem
                            key={topic.taskId}
                            value={topic.taskId.toString()}
                            disabled={disabled}
                          >
                            {topic.name}
                            {topic.selectionLimit
                              ? ` (${topic.selectedCount}/${topic.selectionLimit})`
                              : ""}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.hasSolution ? t("Submitted Solution") : t("No Submitted Solution")}
                    color={row.hasSolution ? "success" : "default"}
                    size="small"
                    variant={row.hasSolution ? "filled" : "outlined"}
                  />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {t("No Approved Students")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
