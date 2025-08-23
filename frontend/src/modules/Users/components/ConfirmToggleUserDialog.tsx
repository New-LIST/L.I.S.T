import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from '@mui/material';
import React from 'react';
import {User} from "../types/User.ts";

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    user: User;
}

const ConfirmToggleUserDialog = ({ open, onClose, onConfirm, user }: Props) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            {user.inactive ?
                <DialogTitle>Potvrdenie aktivovania</DialogTitle>
                :
                <DialogTitle>Potvrdenie deaktivovania</DialogTitle>
            }
            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography>
                    Naozaj chceš {user.inactive ? "aktivovať" : "deaktivovať" } používateľa <strong>{user.fullname}</strong>?
                </Typography>
                {user.inactive ?
                    <Typography>
                        Aktivácia používateľa mu umožňuje prihlásiť sa a používať systém
                    </Typography>
                    :
                    <Typography>
                        Deaktivácia používateľa mu zakáže prihlásenie a používanie systému.
                    </Typography>
                }
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Zrušiť</Button>
                <Button onClick={onConfirm} color="error" variant="contained">
                    {user.inactive ? "Aktivovať" : "Deaktivovať" }
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmToggleUserDialog;
