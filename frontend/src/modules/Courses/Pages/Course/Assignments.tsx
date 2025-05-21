import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip,
    Button, Stack,
    CircularProgress
} from '@mui/material';
import {useState, useEffect} from "react";
import api from "../../../../services/api";
import {useNotification} from "../../../../shared/components/NotificationContext.tsx";
import {useNavigate, useParams} from "react-router-dom";

const statusLabels: Record<string, string> = {
    graded: 'Ohodnotené',
    submitted: 'Odovzdané',
    open: 'Otvorené',
    late: 'Odovzdané neskoro',
    missing: 'Neodovzdané',
};
const getStatusChip = (status: string) => {
    const colorMap = {
        graded: 'success',
        submitted: 'info',
        open: 'secondary',
        late: 'warning',
        missing: 'error',
    } as const;

    return (
        <Chip
            label={statusLabels[status] || status}
            color={colorMap[status] || 'default'}
            size="small"
        />
    );
};

const getDeadlineColor = (deadline: Date) => {
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays < 0) return 'text.secondary';
    if (diffDays < 2) return 'error.main';
    if (diffDays < 7) return 'warning.main';
    return 'primary.main';
};

export default function Assignments() {

    const { id } = useParams();
    const { showNotification } = useNotification();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await api.get(`/assignments/filter?courseId=${id}`);
                setAssignments(response.data.items);
                console.log("Načítané assignments:", response.data.items);
                console.log("Prvý assignment:", response.data.items[0]);
            } catch (error) {
                console.error(error);
                showNotification("Nepodarilo sa načítať zadania", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchAssignments();
    }, [id]);

    const filteredAssignments = statusFilter === 'all'
        ? assignments
        : assignments.filter(() => true);

    const assignmentTypes = Array.from(
        new Map(
            assignments.map((a) => [a.taskSetType.identifier, a.taskSetType.name])
        ).entries()
    ).map(([id, label]) => ({ id, label }));

    if (loading) {
        return <CircularProgress sx={{ mt: 4 }} />;
    }
    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Zadania
            </Typography>

            <Box
                sx={{
                    backgroundColor: '#f0f4ff',
                    p: 2,
                    borderRadius: 2,
                    mb: 3,
                }}
            >
                <Typography variant="body1" fontWeight="medium" gutterBottom>
                    Filtrovať podľa stavu:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button
                        variant={statusFilter === 'all' ? 'contained' : 'outlined'}
                        onClick={() => setStatusFilter('all')}
                    >
                        Všetky
                    </Button>
                    {Object.entries(statusLabels).map(([key, label]) => (
                        <Button
                            key={key}
                            variant={statusFilter === key ? 'contained' : 'outlined'}
                            onClick={() => setStatusFilter(key)}
                        >
                            {label}
                        </Button>
                    ))}
                </Stack>
            </Box>

            {assignmentTypes.map((type) => {
                const assignmentsOfType = filteredAssignments.filter(
                    (a) => a.taskSetType.identifier === type.id
                );

                if (assignmentsOfType.length === 0) return null;

                const totalPoints = 0; // mock
                const maxPoints = assignmentsOfType.reduce(
                    (sum, a) => sum + (a.pointsOverride ?? 0),
                    0
                );

                return (
                    <Box key={type.id} mb={4}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                {type.label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {totalPoints} / {maxPoints} points
                            </Typography>
                        </Box>

                        <Card>
                            <CardContent sx={{ p: 0 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f0f4ff' }}>
                                            <TableCell>Zadanie</TableCell>
                                            <TableCell>Deadline</TableCell>
                                            <TableCell>Body</TableCell>
                                            <TableCell>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {assignmentsOfType.map((a) => {
                                            const deadline = a.uploadEndTime ? new Date(a.uploadEndTime) : null;

                                            return (
                                                <TableRow
                                                    key={a.id}
                                                    hover
                                                    sx={{ cursor: 'pointer' }}
                                                    onClick={() => navigate(`/student/courses/${id}/assignments/${a.id}/tasks`)}
                                                >
                                                    <TableCell>{a.name}</TableCell>

                                                    <TableCell sx={{ color: deadline ? getDeadlineColor(deadline) : undefined }}>
                                                        {deadline ? deadline.toLocaleString() : '—'}
                                                    </TableCell>

                                                    <TableCell>
                                                        - / {a.pointsOverride !== null && a.pointsOverride !== undefined ? a.pointsOverride : '—'}
                                                    </TableCell>
                                                    <TableCell>{getStatusChip('open')}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </Box>
                );
            })}
        </Box>
    );
}
