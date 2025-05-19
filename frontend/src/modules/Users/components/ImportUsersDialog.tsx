import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Input} from "@mui/material";
import {ChangeEvent, useState} from "react";
import api from "../../../services/api.ts";
import {AxiosError, AxiosResponse} from "axios";
import { useNotification } from "../../../shared/components/NotificationContext.tsx";

type DialogProps = {
    isOpen: boolean;
    onClose: () => void;
}

export const ImportUsersDialog = ({isOpen, onClose}: DialogProps) => {
    const { showNotification } = useNotification();
    
    const [file, setFile] = useState<File>();

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };
    
    const handleUpload = async () => {
        if (!file) {
            return false;
        }
        
        const formData = new FormData();
        formData.append("file", file);

        await api.post('/users/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then((response: AxiosResponse<string>) => {
                console.log(response);
                showNotification(response.data, "success");
            })
            .catch((error: AxiosError) => {
                console.log(error);
                showNotification("Users could not be imported.", "error");
            });
        
    };

    return (
        <Dialog fullWidth open={isOpen} onClose={() => {}}>
            <DialogTitle>Import CSV subor</DialogTitle>
            <DialogContent dividers
                           sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
                <Input id="file" name="file" type="file" onChange={handleFileChange} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    onClose();
                }}
                        variant="text"
                        color="warning">
                    Zrušiť
                </Button>
                <Button onClick={async () => { 
                    await handleUpload();
                    onClose();
                }}
                        variant="contained"
                >Import</Button>
            </DialogActions>
        </Dialog>
    );
}