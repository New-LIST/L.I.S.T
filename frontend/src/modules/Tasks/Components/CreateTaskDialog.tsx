import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Stack
} from '@mui/material';
import { useState } from 'react';
import api from '../../../services/api';
import { useNotification } from '../../../shared/components/NotificationContext';

type Props = {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
};

const CreateTaskDialog = ({ open, onClose, onCreated }: Props) => {
    const [name, setName] = useState('');
    const [text, setText] = useState('');
    const [comment, setComment] = useState('');
    const { showNotification } = useNotification();

    const handleSubmit = async () => {
        if (!name.trim()) return;

        try {
            await api.post('/tasks', {
                name,
                text,
                internalComment: comment,
            });
            showNotification('Úloha bola vytvorená.', 'success');
            onCreated();
            onClose();
        } catch {
            showNotification('Chyba pri vytváraní úlohy.', 'error');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Nová úloha</DialogTitle>
            <DialogContent>
                <Stack spacing={2} mt={1}>
                    <TextField label="Názov" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
                    <TextField label="Text" fullWidth value={text} onChange={(e) => setText(e.target.value)} />
                    <TextField label="Interný komentár" fullWidth value={comment} onChange={(e) => setComment(e.target.value)} />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Zrušiť</Button>
                <Button variant="contained" onClick={handleSubmit}>Pridať</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateTaskDialog;
