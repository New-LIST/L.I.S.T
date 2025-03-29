import React, { createContext, useContext, useState } from "react";
import {Alert, Stack } from "@mui/material";
import { v4 as uuidv4 } from "uuid";

type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
    id: string;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const MAX_NOTIFICATIONS = 6;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = (message: string, type: NotificationType = "info") => {
        const id = uuidv4();
        const newNotification: Notification = { id, message, type };

        setNotifications((prev) => {
            const next = [...prev, newNotification];
            // If limit exceeded, returns only last N
            return next.slice(-MAX_NOTIFICATIONS);
        });

        // Auto-remove after timeout
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 4000);
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div
                style={{
                    position: "fixed",
                    top: "1rem",
                    right: "1rem",
                    zIndex: 9999,
                }}
            >
                <Stack spacing={1}>
                    {notifications.map((n) => (
                        <Alert
                            key={n.id}
                            severity={n.type}
                            variant="filled"
                            sx={{ width: '300px' }}
                            onClose={() =>
                                setNotifications((prev) => prev.filter((notif) => notif.id !== n.id))
                            }
                        >
                            {n.message}
                        </Alert>
                    ))}
                </Stack>
            </div>
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
