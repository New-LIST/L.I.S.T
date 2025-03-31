import {Box, Button, FormControl, Input} from "@mui/material";
import * as React from "react";
import {User} from "../types/User.ts";
import api from "../../../services/api.ts";
import {AxiosError, AxiosResponse} from "axios";

const ImportUsers = () => {
    const importUsers = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);
        
        
        await api.post('/users/import', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then((response: AxiosResponse<User>) => {
                console.log(response);
            })
            .catch((error: AxiosError) => {
                console.log(error);
            });
    };
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <form encType="multipart/form-data" onSubmit={importUsers} noValidate>
                <FormControl fullWidth margin="normal">
                    <Input id="file" name="file" type="file" />
                </FormControl>
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
                    Add User
                </Button>
            </form>
        </Box>
    );
}

export default ImportUsers;