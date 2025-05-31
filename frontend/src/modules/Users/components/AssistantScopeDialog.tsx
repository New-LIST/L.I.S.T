import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    FormGroup,
    FormControlLabel,
    Checkbox
} from "@mui/material";
import { useEffect, useState } from "react";
import { User } from "../types/User.ts";
import { AssistantPermissions } from "../types/AssistantPermissions.ts";
import { useNotification } from "../../../shared/components/NotificationContext.tsx";
import api from "../../../services/api.ts";

type Props = {
    open: boolean;
    user: User | null;
    onClose: () => void;
};

const defaultPermissions = (userId: number): AssistantPermissions => ({
    userId,
    canAddStudents: false,
    canManageStudents: false,
    canManageTaskTypes: false,
    canManagePeriods: false,
    canManageCategories: false,
    canViewLogs: false
});

export const AssistantScopeDialog = ({ open, onClose, user }: Props) => {
    const [permissions, setPermissions] = useState<AssistantPermissions | null>(null);
    const { showNotification } = useNotification();

    useEffect(() => {
        if (open && user) {
            api.get(`/assistant-permissions/${user.id}`)
                .then(res => setPermissions(res.data))
                .catch(() => setPermissions(defaultPermissions(user.id)));
        }
    }, [open, user]);

    const handleChange = (field: keyof AssistantPermissions) => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!permissions) return;
        setPermissions({ ...permissions, [field]: e.target.checked });
    };

    const handleSave = async () => {
        if (!permissions) return;
        try {
            await api.post("/assistant-permissions", permissions);
            showNotification("Práva asistenta boli uložené", "success");
            onClose();
        } catch (err) {
            console.error(err);
            showNotification("Nepodarilo sa uložiť práva asistenta", "error");
        }
    };

    return (
        <Dialog fullWidth open={open} onClose={onClose}>
            <DialogTitle>Nastavenie práv asistenta</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography gutterBottom>
                    Práva asistenta pre: <b>{user?.fullname}</b>
                </Typography>

                {permissions && (
                    <FormGroup>
                        <FormControlLabel
                            control={<Checkbox checked={permissions.canAddStudents} onChange={handleChange("canAddStudents")} />}
                            label="Môže pridávať študentov"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={permissions.canManageStudents} onChange={handleChange("canManageStudents")} />}
                            label="Môže upravovať a mazať študentov"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={permissions.canManageTaskTypes} onChange={handleChange("canManageTaskTypes")} />}
                            label="Môže spravovať typy úloh"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={permissions.canManagePeriods} onChange={handleChange("canManagePeriods")} />}
                            label="Môže spravovať obdobia"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={permissions.canManageCategories} onChange={handleChange("canManageCategories")} />}
                            label="Môže spravovať kategórie"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={permissions.canViewLogs} onChange={handleChange("canViewLogs")} />}
                            label="Môže zobrazovať logy"
                        />
                    </FormGroup>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Zrušiť</Button>
                <Button onClick={handleSave} variant="contained">Uložiť</Button>
            </DialogActions>
        </Dialog>
    );
};
