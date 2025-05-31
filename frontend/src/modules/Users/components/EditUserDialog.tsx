import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    TextField
} from "@mui/material";
import { User } from "../types/User";
import { useState, useEffect } from "react";

type Props = {
    isOpen: boolean;
    user: User | null;
    onSubmit: (updatedUser: User) => void;
    onClose: () => void;
};

export const EditUserDialog = ({ isOpen, user, onSubmit, onClose }: Props) => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<User["role"]>("Student");

    useEffect(() => {
        if (user) {
            setFullName(user.fullname);
            setEmail(user.email);
            setRole(user.role);
        }
    }, [user]);

    if (!user) return null;

    return (
        <Dialog fullWidth open={isOpen} onClose={onClose}>
            <DialogTitle>Upraviť používateľa</DialogTitle>
            <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                <TextField
                    label="Meno a priezvisko"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                />
                <TextField
                    label="E-mail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <FormLabel>Rola</FormLabel>
                <RadioGroup
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as User["role"])}
                >
                    <FormControlLabel value="Teacher" control={<Radio />} label="Teacher" />
                    <FormControlLabel value="Assistant" control={<Radio />} label="Assistant" />
                    <FormControlLabel value="Student" control={<Radio />} label="Student" />
                </RadioGroup>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="text" color="warning">Zrušiť</Button>
                <Button
                    onClick={() => {
                        onSubmit({ ...user, fullname: fullName, email, role });
                        onClose();
                    }}
                    variant="contained"
                >
                    Uložiť zmeny
                </Button>
            </DialogActions>
        </Dialog>
    );
};
