import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    IconButton,
    CircularProgress,
    TextField
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../../../services/api.ts';
import { useNotification } from '../../../shared/components/NotificationContext';

interface Participant {
    userId: number;
    userName: string;
    email: string;
    allowed: boolean;
}

export default function Participants() {
    const { id } = useParams();
    const location = useLocation();
    const courseName = location.state?.courseName ?? '';
    const periodName = location.state?.periodName ?? '';
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 250);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const res = await api.get<Participant[]>(`/participants/course/${id}`);
                const sorted = [...res.data].sort((a, b) => Number(a.allowed) - Number(b.allowed));
                setParticipants(sorted);
            } catch (err) {
                console.error(err);
                showNotification("Nepodarilo sa načítať účastníkov.", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchParticipants();
    }, [id]);

    const approveParticipant = async (userId: number) => {
        try {
            await api.patch('/participants/approve', {
                courseId: Number(id),
                userId
            });
            setParticipants(prev =>
                prev.map(p => p.userId === userId ? { ...p, allowed: true } : p)
            );
            showNotification("Účastník bol potvrdený.", "success");
        } catch (err: any) {
            const msg = err.response?.data ?? "Nepodarilo sa potvrdiť účastníka.";
            showNotification(msg, "error");
        }
    };

    const removeParticipant = async (userId: number) => {
        try {
            await api.delete(`/participants/remove`, {
                params: {
                    courseId: Number(id),
                    userId
                }
            });
            setParticipants(prev => prev.filter(p => p.userId !== userId));
            showNotification("Účastník bol odstránený.", "success");
        } catch (err) {
            console.error(err);
            showNotification("Nepodarilo sa odstrániť účastníka.", "error");
        }
    };

    const filteredParticipants = participants.filter(p =>
        p.userName.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );

    return (
        <Container maxWidth="md" sx={{ mt: 5 }}>
            <Typography variant="h4" gutterBottom>
                Účastníci kurzu – {courseName} ({periodName})
            </Typography>

            <Card>
                <CardContent>
                    <Box sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            label="Vyhľadaj podľa mena"
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </Box>

                    {loading ? (
                        <CircularProgress />
                    ) : (
                        <Table size = "small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Meno</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Stav</TableCell>
                                    <TableCell align="right">Akcie</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredParticipants.map(p => (
                                    <TableRow key={p.userId}>
                                        <TableCell>{p.userName}</TableCell>
                                        <TableCell>{p.email}</TableCell>
                                        <TableCell>
                                            {p.allowed ? 'Potvrdený' : 'Čaká na schválenie'}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box>
                                                {!p.allowed && (
                                                    <IconButton onClick={() => approveParticipant(p.userId)}>
                                                        <CheckIcon color="success" />
                                                    </IconButton>
                                                )}
                                                <IconButton onClick={() => removeParticipant(p.userId)}>
                                                    <ClearIcon color="error" />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
}
