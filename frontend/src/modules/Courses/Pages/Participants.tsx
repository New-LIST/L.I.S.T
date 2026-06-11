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
    TextField,
    TableFooter,
    TablePagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../../../services/api.ts';
import { useNotification } from '../../../shared/components/NotificationContext';
import type { CourseGroup } from '../Types/CourseGroup';
import { useTranslation } from 'react-i18next';

interface Participant {
    userId: number;
    userName: string;
    email: string;
    allowed: boolean;
    groupId: number | null;
    groupName: string | null;
}

export default function Participants() {
    const { t } = useTranslation();
    const { id } = useParams();
    const location = useLocation();
    const courseName = location.state?.courseName ?? '';
    const periodName = location.state?.periodName ?? '';
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [groups, setGroups] = useState<CourseGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();
    const [manualEmail, setManualEmail] = useState('');
    const [manualGroupId, setManualGroupId] = useState<number | null>(null);
    const [manualAllowed, setManualAllowed] = useState(true);
    const [selectedParticipantIds, setSelectedParticipantIds] = useState<number[]>([]);
    const [bulkGroupId, setBulkGroupId] = useState<number | "">("");
    const [bulkAssigning, setBulkAssigning] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 250);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const [participantsRes, groupsRes] = await Promise.all([
                    api.get<Participant[]>(`/participants/course/${id}`),
                    api.get<CourseGroup[]>(`/groups/course/${id}`)
                ]);
                const sorted = [...participantsRes.data].sort((a, b) => Number(a.allowed) - Number(b.allowed));
                setParticipants(sorted);
                setGroups(groupsRes.data);
            } catch (err) {
                console.error(err);
                showNotification(t("Could not load participants"), "error");
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
            showNotification(t("Participant approved"), "success");
        } catch (err: any) {
            const msg = err.response?.data ?? t("Could not approve participant");
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
            setSelectedParticipantIds(prev => prev.filter(id => id !== userId));
            showNotification(t("Participant removed"), "success");
        } catch (err) {
            console.error(err);
            showNotification(t("Could not remove participant"), "error");
        }
    };

    const addParticipantManually = async () => {
        if (!manualEmail.trim()) {
            showNotification(t("Student email is required"), "error");
            return;
        }

        try {
            const res = await api.post('/participants/manual', {
                courseId: Number(id),
                email: manualEmail.trim(),
                groupId: manualGroupId,
                allowed: manualAllowed
            });

            setParticipants(prev => [...prev, res.data]);
            setManualEmail('');
            setManualGroupId(null);
            setManualAllowed(true);
            showNotification(t("Student added to course"), "success");
        } catch (err: any) {
            const msg = err.response?.data ?? t("Could not add student to course");
            showNotification(msg, "error");
        }
    };

    const filteredParticipants = participants.filter(p =>
        p.userName.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );

    const paginatedParticipants = filteredParticipants.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const paginatedParticipantIds = paginatedParticipants.map(p => p.userId);
    const selectedOnPageCount = paginatedParticipantIds.filter(userId =>
        selectedParticipantIds.includes(userId)
    ).length;
    const allOnPageSelected = paginatedParticipantIds.length > 0 &&
        selectedOnPageCount === paginatedParticipantIds.length;

    const toggleParticipantSelection = (userId: number, checked: boolean) => {
        setSelectedParticipantIds(prev =>
            checked
                ? Array.from(new Set([...prev, userId]))
                : prev.filter(id => id !== userId)
        );
    };

    const togglePageSelection = (checked: boolean) => {
        setSelectedParticipantIds(prev => {
            if (!checked) {
                return prev.filter(userId => !paginatedParticipantIds.includes(userId));
            }

            return Array.from(new Set([...prev, ...paginatedParticipantIds]));
        });
    };

    const assignSelectedToGroup = async () => {
        if (selectedParticipantIds.length === 0) {
            showNotification(t("Select students for group"), "error");
            return;
        }

        if (bulkGroupId === "") {
            showNotification(t("Select target group"), "error");
            return;
        }

        setBulkAssigning(true);
        let successCount = 0;
        let failedCount = 0;
        let lastError = "";

        for (const userId of selectedParticipantIds) {
            try {
                const res = await api.patch('/participants/group', {
                    courseId: Number(id),
                    userId,
                    groupId: bulkGroupId
                });

                setParticipants(prev =>
                    prev.map(p =>
                        p.userId === userId
                            ? { ...p, groupId: res.data.groupId ?? null, groupName: res.data.groupName ?? null }
                            : p
                    )
                );
                successCount += 1;
            } catch (err: any) {
                failedCount += 1;
                lastError = err.response?.data ?? t("Could not assign some students");
            }
        }

        if (successCount > 0) {
            showNotification(t("Assigned selected students to group", { count: successCount }), "success");
            setSelectedParticipantIds([]);
            api.get<CourseGroup[]>(`/groups/course/${id}`).then(res => setGroups(res.data));
        }

        if (failedCount > 0) {
            showNotification(`${failedCount} ${t("Could not assign some students")} ${lastError}`, "error");
        }

        setBulkAssigning(false);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 5 }}>
            <Typography variant="h4" gutterBottom>
                {t("Participants")} – {courseName} ({periodName})
            </Typography>

            <Card>
                <CardContent>
                    <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <TextField
                            label={t("Email Student")}
                            size="small"
                            value={manualEmail}
                            onChange={e => setManualEmail(e.target.value)}
                            sx={{ minWidth: 260 }}
                        />
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel id="manual-group-select">{t("Group")}</InputLabel>
                            <Select
                                labelId="manual-group-select"
                                label={t("Group")}
                                value={manualGroupId?.toString() ?? ""}
                                onChange={(e) => setManualGroupId(e.target.value ? Number(e.target.value) : null)}
                            >
                                <MenuItem value="">{t("No Group")}</MenuItem>
                                {groups.map(group => (
                                    <MenuItem key={group.id} value={group.id.toString()}>
                                        {group.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={manualAllowed}
                                    onChange={(e) => setManualAllowed(e.target.checked)}
                                />
                            }
                            label={t("Approved")}
                        />
                        <Button variant="contained" onClick={addParticipantManually}>
                            {t("Add Student")}
                        </Button>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            label={t("Search by name")}
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </Box>

                    <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 220 }}>
                            <InputLabel id="bulk-group-select">{t("Target Group")}</InputLabel>
                            <Select
                                labelId="bulk-group-select"
                                label={t("Target Group")}
                                value={bulkGroupId}
                                onChange={(e) => {
                                    const value = e.target.value as number | "";
                                    setBulkGroupId(value === "" ? "" : Number(value));
                                }}
                            >
                                <MenuItem value="">{t("Select Group")}</MenuItem>
                                {groups.map(group => (
                                    <MenuItem key={group.id} value={group.id}>
                                        {group.name} ({group.participantCount}/{group.capacity})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            onClick={assignSelectedToGroup}
                            disabled={bulkAssigning || selectedParticipantIds.length === 0 || bulkGroupId === ""}
                        >
                            {t("Add Selected To Group")}
                        </Button>
                        <Typography variant="body2" color="text.secondary">
                            {t("Selected Count")}: {selectedParticipantIds.length}
                        </Typography>
                    </Box>

                    {loading ? (
                        <CircularProgress />
                    ) : (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={allOnPageSelected}
                                            indeterminate={selectedOnPageCount > 0 && !allOnPageSelected}
                                            onChange={(e) => togglePageSelection(e.target.checked)}
                                        />
                                    </TableCell>
                                    <TableCell>{t("Name")}</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>{t("Group")}</TableCell>
                                    <TableCell>{t("Status")}</TableCell>
                                    <TableCell align="right">{t("Actions")}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedParticipants.map(p => (
                                    <TableRow key={p.userId}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedParticipantIds.includes(p.userId)}
                                                onChange={(e) => toggleParticipantSelection(p.userId, e.target.checked)}
                                            />
                                        </TableCell>
                                        <TableCell>{p.userName}</TableCell>
                                        <TableCell>{p.email}</TableCell>
                                        <TableCell>{p.groupName ?? t("No Group")}</TableCell>
                                        <TableCell>
                                            {p.allowed ? t("Confirmed") : t("Waiting Approval")}
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
                            <TableFooter>
                                <TableRow>
                                    <TablePagination
                                        count={filteredParticipants.length}
                                        page={page}
                                        onPageChange={(_e, newPage) => setPage(newPage)}
                                        rowsPerPage={rowsPerPage}
                                        onRowsPerPageChange={(e) => {
                                            setRowsPerPage(parseInt(e.target.value, 10));
                                            setPage(0);
                                        }}
                                        rowsPerPageOptions={[5, 15, 25]}
                                        labelRowsPerPage={t("Participants per page")}
                                    />
                                </TableRow>
                            </TableFooter>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
}
