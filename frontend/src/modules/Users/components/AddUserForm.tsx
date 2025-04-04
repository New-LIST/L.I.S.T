import {Box, Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField} from "@mui/material";
import * as React from "react";
import api from "../../../services/api.ts";
import {AxiosError, AxiosResponse} from "axios";
import {User} from "../types/User.ts";

const AddUserForm = () => {
    let role: string = "Student";
    const submitUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const name = data.get("fullname") as string;
        const email = data.get('email') as string;
        const password = data.get('password') as string;
        const user: User = {
            fullname: name,
            email: email,
            password: password,
            role: role
        }
        await api.post('/users', user)
            .then((response: AxiosResponse<User>) => {
                console.log(response);
            })
            .catch((error: AxiosError) => {
                console.log(error);
            });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box component="form" onSubmit={submitUser} noValidate sx={{ mt: 1 }}>
                <FormControl fullWidth margin="normal">
                    <FormLabel>FullName</FormLabel>
                    <TextField
                        id="fullname"
                        name="fullname"
                        type="text"
                    />
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <FormLabel>Email</FormLabel>
                    <TextField
                        id="email"
                        name="email"
                        type="email"
                        placeholder="example@email.sk"
                        autoComplete="email"
                        required
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
                    />
                </FormControl>
                <FormControl>
                    <FormLabel id="demo-controlled-radio-buttons-group">Role</FormLabel>
                    <RadioGroup
                        aria-labelledby="demo-controlled-radio-buttons-group"
                        name="controlled-radio-buttons-group"
                        value={role}
                    >
                        <FormControlLabel value="Teacher" control={<Radio />} label="Teacher" />
                        <FormControlLabel value="Assistant" control={<Radio />} label="Assistant" />
                        <FormControlLabel value="Student" control={<Radio />} label="Student" />
                    </RadioGroup>
                </FormControl>
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
                    Add User
                </Button>
            </Box>
        </Box>
    );
}

export default AddUserForm;