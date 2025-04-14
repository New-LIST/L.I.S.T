import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from '@mui/material';
import React from 'react';

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    taskName: string;
};

const ConfirmDeleteTaskDialog = ({ open, onClose, onConfirm, taskName }: Props) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Potvrdenie vymazania</DialogTitle>
            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography>
                    Naozaj chceš vymazať úlohu <strong>{taskName}</strong>?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Táto akcia je nevratná.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Zrušiť</Button>
                <Button onClick={onConfirm} color="error" variant="contained">
                    Vymazať
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDeleteTaskDialog;
