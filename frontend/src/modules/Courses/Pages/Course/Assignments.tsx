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
    Button, Stack
} from '@mui/material';
import {useState} from "react";

const assignmentTypes = [
    { id: 'homework', label: 'Domáce úlohy' },
    { id: 'exam', label: 'Midtermy' },
    { id: 'project', label: 'Projekty' },
];

const statusLabels: Record<string, string> = {
    graded: 'Ohodnotené',
    submitted: 'Odovzdané',
    open: 'Otvorené',
    late: 'Odovzdané neskoro',
    missing: 'Neodovzdané',
};

const mockAssignments = [
    { id: 'K01', name: 'Introduction', type: 'homework', deadline: 'Čas vypršal', points: 11, maxPoints: 18, status: 'graded' },
    { id: 'K02', name: 'Scheduling', type: 'homework', deadline: 'Čas vypršal', points: 18, maxPoints: 22, status: 'graded' },
    { id: 'K03', name: 'Lock Analyzer', type: 'homework', deadline: 'Čas vypršal', points: null, maxPoints: 25, status: 'submitted' },
    { id: 'K04', name: 'Memory', type: 'homework', deadline: 'Čas vypršal', points: null, maxPoints: 20, status: 'late' },
    { id: 'K05', name: 'Paging and TLB', type: 'homework', deadline: 'Čas vypršal', points: null, maxPoints: 18, status: 'missing' },
    { id: 'K06', name: 'Multi-level feedback', type: 'homework', deadline: 'Due in 3 days', points: null, maxPoints: 20, status: 'open' },

    { id: 'M01', name: 'Midterm Exam', type: 'exam', deadline: 'Due in 21 days', points: null, maxPoints: 40, status: 'open' },
    { id: 'F01', name: 'Final Exam', type: 'exam', deadline: 'Due in 45 days', points: null, maxPoints: 50, status: 'open' },

    { id: 'P01', name: 'Memory Simulator', type: 'project', deadline: 'Čas vypršal', points: 17, maxPoints: 20, status: 'graded' },
    { id: 'P02', name: 'Thread Management', type: 'project', deadline: 'Due in 7 days', points: null, maxPoints: 35, status: 'open' },
];

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

const getDeadlineColor = (deadline: string) => {
    if (deadline.includes('passed')) return 'text.secondary';
    if (deadline.includes('3 days')) return 'error.main';
    if (deadline.includes('7 days')) return 'warning.main';
    return 'primary.main';
};

export default function Assignments() {

    const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
    const filteredAssignments = statusFilter === 'all'
        ? mockAssignments
        : mockAssignments.filter(a => a.status === statusFilter);
    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Zadania
            </Typography>

            {/* FILTER BAR */}
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
                const assignments = filteredAssignments.filter((a) => a.type === type.id);
                if (assignments.length === 0) return null;

                const totalPoints = assignments.reduce((sum, a) => sum + (a.points || 0), 0);
                const maxPoints = assignments.reduce((sum, a) => sum + a.maxPoints, 0);

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
                                        {assignments.map((a) => (
                                            <TableRow key={a.id} hover>
                                                <TableCell>{`${a.id} - ${a.name}`}</TableCell>
                                                <TableCell sx={{ color: getDeadlineColor(a.deadline) }}>{a.deadline}</TableCell>
                                                <TableCell>
                                                    {a.points !== null ? `${a.points} / ${a.maxPoints}` : `- / ${a.maxPoints}`}
                                                </TableCell>
                                                <TableCell>{getStatusChip(a.status)}</TableCell>
                                            </TableRow>
                                        ))}
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
