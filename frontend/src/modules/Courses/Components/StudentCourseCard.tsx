import { Button, Card, CardContent, CardMedia, Typography } from '@mui/material';
import {Course} from "../Types/Course.ts";
import {useNavigate} from "react-router-dom";

export default function CourseCard({ id, name, teacher, imageUrl, isMine }: Course) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (isMine) {
            navigate(`/student/courses/${id}`);
        }
    };

    return (
        <Card
            onClick={handleClick}
            sx={{
                width: 250,
                borderRadius: 2,
                boxShadow: 2,
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                cursor: isMine ? 'pointer' : 'default',
                '&:hover': isMine
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
                {teacher && (
                    <Typography variant="body2" color="text.secondary">
                        {teacher}
                    </Typography>
                )}
            </CardContent>

            {!isMine && (
                <Button variant="contained" color="primary" sx={{ m: 2 }}>
                    Pridať sa
                </Button>
            )}
        </Card>
    );
}
