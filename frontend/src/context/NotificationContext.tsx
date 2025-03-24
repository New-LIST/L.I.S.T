import React, { createContext, useContext, useState } from "react";
import { Snackbar, Alert } from "@mui/material";

type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [type, setType] = useState<NotificationType>("info");

    const showNotification = (msg: string, notifType: NotificationType = "info") => {
        setMessage(msg);
        setType(notifType);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <Snackbar open={open} autoHideDuration={4000} onClose={handleClose} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <Alert onClose={handleClose} severity={type} variant="filled">
                    {message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
};

export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
};
