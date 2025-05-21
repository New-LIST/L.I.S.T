import { Button, Card, CardContent, CardMedia, Typography } from '@mui/material';
import {Course} from "../Types/Course.ts";
import {useNavigate} from "react-router-dom";
import api from "../../../services/api.ts";
import { useNotification } from "../../../shared/components/NotificationContext.tsx"; // uprav cestu

export default function CourseCard({ id, name, teacherName, imageUrl, isMine, periodName, currentEnrollment, capacity, enrollmentLimit, allowed, onJoined }: Course) {
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const handleClick = () => {
        if (isMine) {
            navigate(`/student/courses/${id}`);
        }
    };
    const joinCourse = async () => {
        try {
            await api.post("/participants", { courseId: id });
            showNotification("Úspešne si požiadal o pridanie do kurzu.", "success");
            onJoined?.(id);
        } catch (err: any) {
            console.error("Chyba pri pripájaní do kurzu:", err);
            const msg = err.response?.data ?? "Nepodarilo sa pridať do kurzu.";
            showNotification(msg, "error");
        }
    };

    return (
        <Card
            onClick={isMine && allowed ? handleClick : undefined}
            sx={{
                width: 250,
                borderRadius: 2,
                boxShadow: 2,
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                cursor: isMine && allowed ? 'pointer' : 'default',
                '&:hover': isMine && allowed
                    ? {
                        boxShadow: 4,
                        transform: 'translateY(-2px)',
                    }
                    : undefined,
            }}
        >
            <CardMedia
                component="div"
                sx={{
                    height: 100,
                    backgroundColor: imageUrl ? undefined : '#42a5f5',
                    backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">
                    {name}
                </Typography>

                {periodName && (
                    <Typography variant="body2" color="text.secondary">
                        {periodName}
                    </Typography>
                )}

                {teacherName && (
                    <Typography variant="body2" color="text.secondary">
                        {teacherName}
                    </Typography>
                )}
            </CardContent>

            {(!isMine || (isMine && allowed === false)) && (() => {
                const now = new Date();
                const enrollmentDeadline = enrollmentLimit ? new Date(enrollmentLimit) : null;

                const isFull = currentEnrollment >= capacity;
                const isAfterDeadline = enrollmentDeadline !== null && now > enrollmentDeadline;
                const isPending = isMine && allowed === false;
                const disabled = isFull || isAfterDeadline || isPending;
                const buttonText = isFull
                    ? 'Kurz je plný'
                    : isAfterDeadline
                        ? 'Zápis ukončený'
                        : isPending
                            ? 'Čaká sa na schválenie'
                            : 'Pridať sa';
                console.log({ isMine, allowed });
                return (
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ m: 2 }}
                        disabled={disabled}
                        onClick={isPending ? undefined : joinCourse}
                    >
                        {buttonText}
                    </Button>
                );
            })()}

        </Card>
    );
}
