import * as React from 'react';
import {
    Box,
    Button,
    FormLabel,
    FormControl,
    TextField,
    Stack,
    Card,
    Alert, Typography
} from '@mui/material';
import {useNavigate, useParams} from 'react-router-dom';
import api from '../../../services/api.ts';
import { useNotification } from "../../../shared/components/NotificationContext"

export default function PasswordChange() {
    const { id } = useParams<{ id: string }>();
    
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
    const [passwordConfirmationError, setPasswordConfirmationError] = React.useState(false);
    const [passwordConfirmationErrorMessage, setPasswordConfirmationErrorMessage] = React.useState('');
    const [generalError, setGeneralError] = React.useState('');
    
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateInputs()) return;
        
        const data = new FormData(event.currentTarget);
        const newPassword = data.get('password') as string;
        
        await api.post('/auth/reset-password', { RequestId: id, NewPassword: newPassword })
            .then(response => {
                console.log('Password changed successfully:', response.data);
                showNotification(
                    "Password changed successfully. You can now log in with your new password.", 
                    "success")
                navigate('/signin');
            })
            .catch(error => {
                console.error('Error changing password:', error);
                showNotification(
                    "Invalid request. Request has expired. Please request a new password reset.",
                    "error")
                navigate('/signin');
            });
    }
    
    const validateInputs = () => {
        const password = document.getElementById('password') as HTMLInputElement;
        const passwordConfirmation = document.getElementById('passwordConfirmation') as HTMLInputElement;

        let isValid = true;
        setGeneralError('');

        if (!password.value) {
            setPasswordError(true);
            setPasswordErrorMessage('Prosím zadaj heslo');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        if (!passwordConfirmation.value) {
            setPasswordConfirmationError(true);
            setPasswordConfirmationErrorMessage('Prosím zadaj heslo');
            isValid = false;
        } else if (password.value !== passwordConfirmation.value) {
            setPasswordConfirmationError(true);
            setPasswordConfirmationErrorMessage('Passwords do not match');
            isValid = false;
        } else {
            setPasswordConfirmationError(false);
            setPasswordConfirmationErrorMessage('');
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
                    Password Reset
                </Typography>
                {generalError && <Alert severity="error">{generalError}</Alert>}
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <FormControl fullWidth margin="normal">
                        <FormLabel>New Password</FormLabel>
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
                    <FormControl fullWidth margin="normal">
                        <FormLabel>Confirm New Password</FormLabel>
                        <TextField
                            id="passwordConfirmation"
                            name="passwordConfirmation"
                            type="password"
                            placeholder="••••••"
                            autoComplete="current-password"
                            required
                            error={passwordConfirmationError}
                            helperText={passwordConfirmationErrorMessage}
                        />
                    </FormControl>
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
                        Change Password
                    </Button>
                </Box>
            </Card>
        </Stack>
    );
}
