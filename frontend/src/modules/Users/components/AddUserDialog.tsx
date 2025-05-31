import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel, FormLabel, Radio,
    RadioGroup,
    TextField
} from "@mui/material";
import {User} from "../types/User.ts";
import {useState} from "react";

type DialogProps = {
    isOpen: boolean;
    onSubmit: (user: User) => void;
    onClose: () => void;
}

export const AddUserDialog = ({isOpen, onSubmit, onClose}: DialogProps) => {
    const [fullName, setFullName] = useState("");
    const [fullNameError, setFullNameError] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [role, setRole] = useState<string>("Student");
    const [roleError, setRoleError] = useState<string | null>(null);
    
    const resetValues = () => {
        setFullName("");
        setFullNameError(null);
        setEmail("");
        setEmailError(null);
        setPassword("");
        setPasswordError(null);
        setRole("Student");
        setRoleError(null);
    }

    const validate = () => {
        if (fullName.trim().length === 0) {
            setFullNameError("Pridajte Meno a Priezvisko");
        } else {
            setFullNameError(null);
        }
        if (email.trim().length === 0) {
            setEmailError("Pridajte E-mail");
        } else {
            setEmailError(null);
        }
        if (password.length < 6 || password.trim() === "") {
            setPasswordError("Heslo musi obsahovat aspon 6 znakov");
        } else {
            setPasswordError(null);
        }
        if (role.trim().length === 0) {
            setRoleError("Pridajte Rolu");
        } else {
            setRoleError(null);
        }
    }
    const isValid = (): boolean => {
        validate()
        if (fullName.trim().length === 0)
            return false;
        if (email.trim().length === 0)
            return false;
        if (password.length < 6 || password.trim() === "")
            return false;
        return role.trim().length !== 0;
    }
    
    return (
        <Dialog fullWidth open={isOpen} onClose={() => {}}>
            <DialogTitle>Pridať Nový Použivateľ</DialogTitle>
            <DialogContent dividers
                           sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
                <TextField
                    id="fullname"
                    name="fullname"
                    type="text"
                    label="Meno a Priezvisko"
                    onChange={(e) => {
                        setFullName(e.target.value);
                        if (e.target.value === "") {
                            setFullNameError("Pridajte Meno a Priezvisko");
                        } else {
                            setFullNameError(null);
                        }
                    }}
                    error={!!fullNameError}
                    helperText={fullNameError}
                    required />
                <TextField
                    id="email"
                    name="email"
                    type="email"
                    label="E-mail"
                    placeholder="example@email.sk"
                    autoComplete="email"
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (e.target.value === "") {
                            setEmailError("Pridajte E-mail");
                        } else {
                            setEmailError(null);
                        }
                    }}
                    error={!!emailError}
                    helperText={emailError}
                    required />
                <TextField
                    id="password"
                    name="password"
                    type="password"
                    label="Heslo"
                    placeholder="••••••"
                    autoComplete="current-password"
                    onChange={(e) => {
                        setPassword(e.target.value);
                        if (e.target.value.trim().length < 6) {
                            setPasswordError("Heslo musi obsahovat aspon 6 znakov");
                        } else {
                            setPasswordError(null);
                        }
                    }}
                    error={!!passwordError}
                    helperText={passwordError}
                    required />
                <FormLabel>Role: {roleError}</FormLabel>
                <RadioGroup
                    aria-labelledby="role"
                    name="role"
                    onChange={(e) => setRole(e.target.value)}
                >
                    <FormControlLabel checked={role === "Teacher"} control={<Radio />} onClick={() => setRole("Teacher") } label="Teacher" />
                    <FormControlLabel checked={role === "Assistant"} control={<Radio /> } onClick={() => setRole("Assistant") } label="Assistant" />
                    <FormControlLabel checked={role === "Student"} control={<Radio />} onClick={() => setRole("Student") } label="Student" />
                </RadioGroup>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    resetValues();
                    onClose();
                }}
                        variant="text"
                        color="warning">
                    Zrušiť   
                </Button>
                <Button onClick={() => {
                    if (isValid()) {
                        const user: User = {
                            id: 0,
                            fullname: fullName,
                            email: email,
                            password: password,
                            role: role
                        };
                        onSubmit(user);
                        resetValues();
                        onClose();
                    } else {
                        console.error("Invalid email or password");
                    }
                }}
                        variant="contained"
                >
                    Pridať
                </Button>
            </DialogActions>
        </Dialog>
    );
}