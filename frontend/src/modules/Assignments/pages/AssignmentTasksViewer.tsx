import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Box,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    Divider
} from "@mui/material";
import api from "../../../services/api.ts";
import TaskCard from "../../Tasks/Components/TaskCard.tsx";
import { AssignmentTaskRelSlim } from "../types/AssignmentTaskRelSlim.ts";

type AssignmentDetail = {
    name: string;
    instructions: string;
};

const AssignmentTasksViewer = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const assignmentIdNumber = Number(assignmentId);

    const [tasks, setTasks] = useState<AssignmentTaskRelSlim[]>([]);
    const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                // Získaj úlohy
                const tasksRes = await api.get(`/assignment-task-rel/by-assignment/${assignmentIdNumber}`);
                setTasks(tasksRes.data);

                // Získaj detail zadania
                const assignmentRes = await api.get(`/assignments/${assignmentIdNumber}`);
                setAssignment(assignmentRes.data);
            } catch (e) {
                console.error("Nepodarilo sa načítať úlohy alebo zadanie", e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [assignmentIdNumber]);

    return (
        <Box mt={4} maxWidth="lg" mx="auto">
            <Card>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h5">
                            {assignment?.name ?? `Zadanie #${assignmentIdNumber}`}
                        </Typography>
                    </Box>

                    {assignment?.instructions && (
                        <Box mb={3}>
                            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                Inštrukcie:
                            </Typography>
                            <Box
                                sx={{
                                    '& img': { maxWidth: '100%' },
                                    '& p': { mb: 1.5 }
                                }}
                                dangerouslySetInnerHTML={{ __html: assignment.instructions }}
                            />
                            <Divider sx={{ mt: 2 }} />
                        </Box>
                    )}

                    {loading ? (
                        <CircularProgress />
                    ) : tasks.length === 0 ? (
                        <Typography variant="body2">Žiadne úlohy.</Typography>
                    ) : (
                        tasks.map((rel) => (
                            <TaskCard
                                key={rel.taskId}
                                name={rel.task.name}
                                text={rel.task.text}
                                authorName={rel.task.authorName || "Neznámy autor"}
                            />
                        ))
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default AssignmentTasksViewer;
