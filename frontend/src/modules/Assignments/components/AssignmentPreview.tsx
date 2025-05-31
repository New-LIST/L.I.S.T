import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { Paper, CircularProgress, Typography, Divider } from "@mui/material";
import AssignmentTaskPreview from "./AssignmentTaskPreview";
import { AssignmentTaskForPreview } from "../types/AssignmentTaskForPreview";

type Props = {
  assignmentId: number;
};

const AssignmentPreview: React.FC<Props> = ({ assignmentId }) => {
  const [title, setTitle] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [tasks, setTasks] = useState<AssignmentTaskForPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreview = async () => {
      setLoading(true);
      try {
        // 1) Načítať základné info o zadaní
        const assignmentRes = await api.get<{
          name: string;
          instructions: string | null;
        }>(`/assignments/${assignmentId}`);

        // 2) Načítať úlohy pre dané zadanie
        const tasksRes = await api.get<AssignmentTaskForPreview[]>(
          `/assignment-task-rel/by-assignment-slim/${assignmentId}`
        );

        setTitle(assignmentRes.data.name);
        setInstructions(assignmentRes.data.instructions ?? "");
        setTasks(tasksRes.data);
      } catch (err) {
        console.error("Chyba pri načítaní náhľadu zadania", err);
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [assignmentId]);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        {title}
      </Typography>
      {instructions && (
        <>
          <Divider sx={{ mt: 2, mb: 2 }} />
          <Typography variant="body1" paragraph>
            {instructions}
          </Typography>
        </>
      )}

      <Divider sx={{ mb: 1 }} />
      <Divider sx={{ mb: 2 }} />

      {tasks.length > 0 ? (
        tasks.map((rel) => (
          <AssignmentTaskPreview
            key={rel.taskId}
            name={rel.task.name}
            text={rel.task.text}
            authorName={rel.task.authorName}
            pointsTotal={rel.pointsTotal}
            bonus={rel.bonusTask}
          />
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          Žiadne úlohy pre toto zadanie.
        </Typography>
      )}
    </Paper>
  );
};

export default AssignmentPreview;
