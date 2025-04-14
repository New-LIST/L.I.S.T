import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Button, Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody,
    IconButton, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { Task } from '../Types/Task';
import api from '../../../services/api';
import { useNotification } from '../../../shared/components/NotificationContext';
import CreateTaskDialog from '../Components/CreateTaskDialog.tsx';
import EditTaskDialog from '../Components/EditTaskDialog.tsx';
import ConfirmDeleteDialog from '../Components/ConfirmDeleteTaskDialog.tsx';

const Tasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const { showNotification } = useNotification();

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await api.get('/tasks');
            setTasks(response.data);
        } catch {
            showNotification('Nepodarilo sa načítať úlohy.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data: Partial<Task>) => {
        try {
            await api.post('/tasks', data);
            showNotification('Úloha bola pridaná.', 'success');
            fetchTasks();
        } catch {
            showNotification('Chyba pri vytváraní úlohy.', 'error');
        }
    };

    const handleUpdate = async (data: Task) => {
        try {
            await api.put(`/tasks/${data.id}`, data);
            showNotification('Úloha bola upravená.', 'success');
            fetchTasks();
        } catch {
            showNotification('Chyba pri úprave úlohy.', 'error');
        }
    };

    const handleDelete = async () => {
        if (!taskToDelete) return;
        try {
            await api.delete(`/tasks/${taskToDelete.id}`);
            showNotification('Úloha bola vymazaná.', 'success');
            fetchTasks();
        } catch {
            showNotification('Chyba pri vymazaní úlohy.', 'error');
        } finally {
            setConfirmOpen(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <Container maxWidth="md" sx={{ mt: 5 }}>
            <Typography variant="h4" gutterBottom>Úlohy</Typography>
            <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpenDialog(true)}>Pridať úlohu</Button>

            <Card>
                <CardContent>
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Názov</TableCell>
                                    <TableCell>Text</TableCell>
                                    <TableCell>Vnútorný komentár</TableCell>
                                    <TableCell>Akcie</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tasks.map(task => (
                                    <TableRow key={task.id}>
                                        <TableCell>{task.name}</TableCell>
                                        <TableCell>{task.text}</TableCell>
                                        <TableCell>{task.internalComment}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => {
                                                setTaskToEdit(task);
                                                setEditDialogOpen(true);
                                            }}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => {
                                                setTaskToDelete(task);
                                                setConfirmOpen(true);
                                            }}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <CreateTaskDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onCreated={fetchTasks}
            />

            {taskToEdit && (
                <EditTaskDialog
                    open={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                    task={taskToEdit}
                    onSaved={fetchTasks}
                />
            )}

            {taskToDelete && (
                <ConfirmDeleteDialog
                    open={confirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    onConfirm={handleDelete}
                    itemName={taskToDelete.name}
                />
            )}
        </Container>
    );
};

export default Tasks;
