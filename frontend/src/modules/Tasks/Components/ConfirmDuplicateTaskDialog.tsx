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

export default function ConfirmDuplicateTaskDialog({ open, onClose, onConfirm, taskName }: Props) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Duplikovať úlohu</DialogTitle>
            <DialogContent>
                <Typography>
                    Naozaj chceš vytvoriť kópiu úlohy <strong>{taskName}</strong>?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Zrušiť</Button>
                <Button onClick={onConfirm} variant="contained" color="primary">
                    Duplikovať
                </Button>
            </DialogActions>
        </Dialog>
    );
}
