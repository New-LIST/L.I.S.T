import * as React from 'react';
import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    FormLabel,
    FormControl,
    Link,
    TextField,
    Typography,
    Stack,
    Card,
    Alert
} from '@mui/material';
import ForgotPassword from '../components/ForgotPassword.tsx';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api.ts';
import axios from "axios";
import {removeStoredAuth} from "../utils/auth.ts";

export default function SignIn() {
    const [emailError, setEmailError] = React.useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
    const [generalError, setGeneralError] = React.useState('');
    const [isForgotPasswordDialogOpen, setIsForgotPasswordDialogOpen] = React.useState(false);
    const [rememberMe, setRememberMe] = React.useState(false);

    const navigate = useNavigate();

    const openForgotPasswordDialog = () => setIsForgotPasswordDialogOpen(true);
    const closeForgotPasswordDialog = () => setIsForgotPasswordDialogOpen(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        removeStoredAuth();
        if (!validateInputs()) return;

        const data = new FormData(event.currentTarget);
        const email = data.get('email') as string;
        const password = data.get('password') as string;
        try {
            const response = await api.post('/auth/login', { email, password });
            console.log('Login successful:', response.data);

            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('token', response.data.token);
            storage.setItem('user', JSON.stringify(response.data.user));

            navigate('/');
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                const serverMessage = error.response.data;

                if (serverMessage.message === 'Invalid email or password.') {
                    setGeneralError('Zlý email alebo heslo');
                } else {
                    setGeneralError(serverMessage.message || 'Prihlásenie zlyhalo.');
                }
            }


        }
    };

    const validateInputs = () => {
        const email = document.getElementById('email') as HTMLInputElement;
        const password = document.getElementById('password') as HTMLInputElement;

        let isValid = true;
        setGeneralError('');
        if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
            setEmailError(true);
            setEmailErrorMessage('Prosím zadaj správny email');
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }

        if (!password.value) {
            setPasswordError(true);
            setPasswordErrorMessage('Prosím zadaj heslo');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        return isValid;
    };

    return (
        <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={2}
            sx={{ minHeight: '100vh', padding: 2, backgroundColor: '#f5f5f5' }}
        >
            <Card sx={{ padding: 4, width: '100%', maxWidth: 450 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Vitaj v L.I.S.Te 2.0
                </Typography>
                {generalError && <Alert severity="error">{generalError}</Alert>}
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <FormControl fullWidth margin="normal">
                        <FormLabel>Email</FormLabel>
                        <TextField
                            id="email"
                            name="email"
                            type="email"
                            placeholder="tvoj@email.sk"
                            autoComplete="email"
                            required
                            error={emailError}
                            helperText={emailErrorMessage}
                        />
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <FormLabel>Heslo</FormLabel>
                        <TextField
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••"
                            autoComplete="current-password"
                            required
                            error={passwordError}
                            helperText={passwordErrorMessage}
                        />
                    </FormControl>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Zapamätaj si ma"
                    />
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
                        Prihlás sa
                    </Button>
                    <Link
                        component="button"
                        variant="body2"
                        type="button"
                        onClick={openForgotPasswordDialog}
                        sx={{ display: 'block', mt: 2, textAlign: 'center' }}
                    >
                        Zabudnul si heslo?
                    </Link>
                </Box>
            </Card>

            <ForgotPassword
                open={isForgotPasswordDialogOpen}
                handleClose={closeForgotPasswordDialog}
            />
        </Stack>
    );
}
