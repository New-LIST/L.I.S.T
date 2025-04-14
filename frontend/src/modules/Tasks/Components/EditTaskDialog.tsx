import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Stack
} from '@mui/material';
import { useState } from 'react';
import api from '../../../services/api';
import { useNotification } from '../../../shared/components/NotificationContext';
import { Task } from '../Types/Task';

type Props = {
    open: boolean;
    onClose: () => void;
    task: Task;
    onSaved: () => void;
};

const EditTaskDialog = ({ open, onClose, task, onSaved }: Props) => {
    const [name, setName] = useState(task.name);
    const [text, setText] = useState(task.text ?? '');
    const [comment, setComment] = useState(task.internalComment ?? '');
    const { showNotification } = useNotification();

    const handleSave = async () => {
        try {
            await api.put(`/tasks/${task.id}`, {
                name,
                text,
                internalComment: comment,
            });
            showNotification('Úloha bola upravená.', 'success');
            onSaved();
            onClose();
        } catch {
            showNotification('Chyba pri úprave úlohy.', 'error');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Upraviť úlohu</DialogTitle>
            <DialogContent>
                <Stack spacing={2} mt={1}>
                    <TextField label="Názov" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
                    <TextField label="Text" fullWidth value={text} onChange={(e) => setText(e.target.value)} />
                    <TextField label="Interný komentár" fullWidth value={comment} onChange={(e) => setComment(e.target.value)} />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Zrušiť</Button>
                <Button variant="contained" onClick={handleSave}>Uložiť</Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditTaskDialog;
