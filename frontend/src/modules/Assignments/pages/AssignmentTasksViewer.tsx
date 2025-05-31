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
import AssignmentTaskPreview from "../components/AssignmentTaskPreview.tsx";
import { AssignmentTaskRelSlim } from "../types/AssignmentTaskRelSlim.ts";
import UploadSolutionForm from "../components/UploadSolutionForm.tsx";

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

    const [canUpload, setCanUpload] = useState<boolean>(false);
    const [loadingCanUpload, setLoadingCanUpload] = useState<boolean>(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                // Získaj úlohy
                const tasksRes = await api.get(`/assignment-task-rel/by-assignment/${assignmentIdNumber}`);
                setTasks(tasksRes.data);

                // Získaj detail zadania
                const assignmentRes = await api.get(`/assignments/${assignmentIdNumber}`);
                setAssignment(assignmentRes.data);

                const canUploadRes = await api.get<{ canUpload: boolean }>(
                    `/assignments/${assignmentIdNumber}/canUpload`
                );
                setCanUpload(canUploadRes.data.canUpload);

            } catch (e) {
                console.error("Nepodarilo sa načítať úlohy alebo zadanie", e);
            } finally {
                setLoading(false);
                setLoadingCanUpload(false);
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
                            <AssignmentTaskPreview
                                key={rel.taskId}
                                name={rel.task.name}
                                text={rel.task.text}
                                authorName={rel.task.authorName || "Neznámy autor"}
                                pointsTotal={rel.pointsTotal}
                                bonus={rel.bonusTask}
                            />
                        ))
                    )}

                    {loadingCanUpload ? (
                        // Kým čakáme na odpoveď z /canUpload
                        <Box mt={4} textAlign="center">
                            <CircularProgress />
                        </Box>
                    ) : canUpload ? (
                        // Ak sa môže uploadovať: zobrazíme formu
                        <Box mt={4}>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Odovzdanie riešenia
                            </Typography>
                            <UploadSolutionForm assignmentId={assignmentIdNumber} />
                        </Box>
                    ) : (
                        // Ak už nie je možné uploadovať (napr. uploadSolution == false)
                        <Box mt={4}>
                            <Typography variant="body2" color="textSecondary">
                                Toto zadanie už nie je možné odovzdať.
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default AssignmentTasksViewer;
