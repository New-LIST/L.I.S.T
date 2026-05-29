import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import api from "../../../../services/api";
import { useNotification } from "../../../../shared/components/NotificationContext";
import EmptyState from "../../../../shared/components/EmptyState";
import UploadSolutionForm from "../../../Assignments/components/UploadSolutionForm";
import type { ProjectDetail as ProjectDetailType, ProjectTopic } from "../../../Assignments/types/Project";
import { useTranslation } from "react-i18next";

const formatDateTime = (value: string | null, emptyText: string, locale: string) =>
  value ? new Date(value).toLocaleString(locale) : emptyText;

const formatSlots = (topic: ProjectTopic, noLimitText: string, ofText: string) => {
  if (topic.selectionLimit == null) return noLimitText;
  return `${topic.freeSlots ?? 0} ${ofText} ${topic.selectionLimit}`;
};

export default function ProjectDetail() {
  const { t, i18n } = useTranslation();
  const { id, assignmentId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const assignmentIdNumber = Number(assignmentId);
  const dateLocale = i18n.language === "en" ? "en-US" : "sk-SK";

  const [detail, setDetail] = useState<ProjectDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingTaskId, setSavingTaskId] = useState<number | null>(null);
  const [previewTaskId, setPreviewTaskId] = useState<number | null>(null);

  const previewTopic = useMemo(() => {
    if (!detail) return null;

    return (
      detail.topics.find((topic) => topic.taskId === previewTaskId) ??
      detail.topics.find((topic) => topic.taskId === detail.selectedTaskId) ??
      detail.topics[0] ??
      null
    );
  }, [detail, previewTaskId]);

  const load = async () => {
    if (!assignmentIdNumber) return;
    setLoading(true);
    try {
      const res = await api.get<ProjectDetailType>(`/projects/${assignmentIdNumber}`);
      const nextDetail = res.data;
      setDetail(nextDetail);
      setPreviewTaskId((currentTaskId) =>
        currentTaskId && nextDetail.topics.some((topic) => topic.taskId === currentTaskId)
          ? currentTaskId
          : nextDetail.selectedTaskId ?? nextDetail.topics[0]?.taskId ?? null
      );
    } catch (err) {
      console.error(err);
      showNotification(t("Could not load project"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [assignmentIdNumber]);

  const selectTopic = async (taskId: number | null) => {
    if (!detail) return;
    setSavingTaskId(taskId ?? detail.selectedTaskId ?? -1);
    if (taskId) {
      setPreviewTaskId(taskId);
    }
    try {
      await api.patch(`/projects/${detail.assignmentId}/selection`, { taskId });
      await load();
      showNotification(taskId ? t("Topic selected") : t("Topic selection cancelled"), "success");
    } catch (err: any) {
      showNotification(err.response?.data ?? t("Could not save project selection"), "error");
    } finally {
      setSavingTaskId(null);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!detail) {
    return <EmptyState message={t("Could not load project")} />;
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/student/courses/${id}/projects`)}
        >
          {t("Back")}
        </Button>
        <Typography variant="h5" fontWeight="bold">
          {detail.assignmentName}
        </Typography>
      </Stack>

      <Stack spacing={2}>
        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {t("Topic Selection Deadline")}
              </Typography>
              <Typography>{formatDateTime(detail.projectSelectionDeadline, t("No Deadline"), dateLocale)}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {t("Upload Deadline")}
              </Typography>
              <Typography>{formatDateTime(detail.uploadEndTime, t("No Deadline"), dateLocale)}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {t("Status")}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {detail.selectedTaskId ? (
                  <Chip icon={<CheckCircleIcon />} label={t("Topic Selected")} color="success" size="small" />
                ) : (
                  <Chip label={t("No Selection")} size="small" />
                )}
                {detail.canUpload ? (
                  <Chip icon={<UploadFileIcon />} label={t("Upload Open")} color="primary" size="small" />
                ) : (
                  <Chip label={t("Upload Closed")} size="small" />
                )}
              </Stack>
            </Box>
          </Stack>
        </Paper>

        {detail.instructions && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t("Project Rules")}
            </Typography>
            <Box
              sx={{
                "& img": { maxWidth: "100%" },
                "& p": { mb: 1.5 },
              }}
              dangerouslySetInnerHTML={{ __html: detail.instructions }}
            />
          </Paper>
        )}

        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6">{t("Topic Selection")}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t("Topic Preview Before Selection Help")}
              </Typography>
            </Box>
            {detail.selectedTaskId && detail.canSelect && (
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => selectTopic(null)}
                disabled={savingTaskId !== null}
              >
                {t("Cancel Selection")}
              </Button>
            )}
          </Stack>

          {!detail.canSelect && !detail.hasSubmittedSolution && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {t("Topic Selection Closed")}
            </Alert>
          )}

          {detail.hasSubmittedSolution && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {t("Submitted Solution Locks Topic")}
            </Alert>
          )}

          {detail.topics.length === 0 ? (
            <EmptyState message={t("Project Has No Topics")} />
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f0f4ff" }}>
                  <TableCell>{t("Topic Name")}</TableCell>
                  <TableCell>{t("Free Slots")}</TableCell>
                  <TableCell>{t("Students")}</TableCell>
                  <TableCell align="right">{t("Action")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detail.topics.map((topic) => {
                  const selected = topic.taskId === detail.selectedTaskId;
                  const previewed = topic.taskId === previewTopic?.taskId;
                  const disabled = !detail.canSelect || selected || topic.isFull || savingTaskId !== null;

                  return (
                    <TableRow
                      key={topic.taskId}
                      hover
                      selected={selected}
                      sx={previewed && !selected ? { backgroundColor: "action.hover" } : undefined}
                    >
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => setPreviewTaskId(topic.taskId)}
                            sx={{
                              justifyContent: "flex-start",
                              minWidth: 0,
                              p: 0,
                              textAlign: "left",
                              textTransform: "none",
                              fontWeight: selected || previewed ? "bold" : undefined,
                            }}
                          >
                            {topic.name}
                          </Button>
                          <Typography variant="body2" color="text.secondary">
                            {topic.pointsTotal} {t("points")}
                            {topic.authorName ? `, ${t("author")} ${topic.authorName}` : ""}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{formatSlots(topic, t("No Limit"), t("of"))}</TableCell>
                      <TableCell>
                        {topic.students.length > 0
                          ? topic.students.map((student) => student.fullName).join(", ")
                          : t("Nobody Works On Topic")}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant={selected ? "outlined" : "contained"}
                          size="small"
                          disabled={disabled}
                          onClick={() => selectTopic(topic.taskId)}
                        >
                          {selected ? t("Selected") : topic.isFull ? t("Full") : t("Select")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Paper>

        {previewTopic && (
          <Paper sx={{ p: 2 }}>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {t("Project Assignment")}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {previewTopic.name}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                {previewTopic.taskId === detail.selectedTaskId && (
                  <Chip icon={<CheckCircleIcon />} label={t("Topic Selected")} color="success" size="small" />
                )}
                {previewTopic.taskId !== detail.selectedTaskId && previewTopic.isFull && (
                  <Chip label={t("Topic Is Full")} size="small" />
                )}
                {previewTopic.taskId !== detail.selectedTaskId && (
                  <Button
                    variant="contained"
                    size="small"
                    disabled={!detail.canSelect || previewTopic.isFull || savingTaskId !== null}
                    onClick={() => selectTopic(previewTopic.taskId)}
                  >
                    {t("Select This Topic")}
                  </Button>
                )}
              </Stack>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            {previewTopic.text ? (
              <Box
                sx={{
                  "& img": { maxWidth: "100%" },
                  "& p": { mb: 1.5 },
                }}
                dangerouslySetInnerHTML={{ __html: previewTopic.text }}
              />
            ) : (
              <Typography color="text.secondary">{t("Topic Has No Text")}</Typography>
            )}
            <Divider sx={{ mt: 2, mb: 1 }} />
            <Typography variant="subtitle2" color="text.secondary">
              {t("author")}: {previewTopic.authorName ?? t("Unknown Author")} | {previewTopic.pointsTotal} {t("points")}
            </Typography>
          </Paper>
        )}

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t("Solution Upload")}
          </Typography>
          {!detail.selectedTaskId ? (
            <Typography color="text.secondary">{t("Select Topic Before Upload")}</Typography>
          ) : detail.canUpload ? (
            <UploadSolutionForm assignmentId={detail.assignmentId} />
          ) : (
            <Typography color="text.secondary">{t("Project Cannot Be Submitted Now")}</Typography>
          )}
        </Paper>
      </Stack>
    </Box>
  );
}
