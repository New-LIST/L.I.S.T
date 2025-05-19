import { Box, Card, CardContent, Typography, Divider, CircularProgress } from '@mui/material';
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../../services/api";
import { useNotification } from "../../../../shared/components/NotificationContext";
import { Course } from "../../Types/Course.ts";


const CourseDescription = () => {
    const { id } = useParams();
    const { showNotification } = useNotification();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCourse = async () => {
            try {
                const res = await api.get<Course>(`/courses/${id}`);
                setCourse(res.data);
            } catch {
                showNotification("Nepodarilo sa načítať kurz.", "error");
            } finally {
                setLoading(false);
            }
        };

        loadCourse();
    }, [id]);

    if (loading || !course) {
        return <CircularProgress sx={{ mt: 4 }} />;
    }

    return (
        <Box>
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h5" fontWeight="bold">
                        {course.name} / {course.periodName}
                    </Typography>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Popis kurzu
                    </Typography>
                    <Box
                        sx={{ mt: 1 }}
                        dangerouslySetInnerHTML={{ __html: course.description ?? "<p>Žiadny popis nebol zadaný.</p>" }}
                    />

                    <Divider sx={{ my: 3 }} />

                    <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="primary"
                        gutterBottom
                    >
                        Informácie o kurze
                    </Typography>
                    <Box display="grid" gridTemplateColumns="1fr 2fr" rowGap={1}>
                        <Typography color="text.secondary">Učiteľ:</Typography>
                        <Typography>{course.teacherName}</Typography>
                        <Typography color="text.secondary">Obdobie:</Typography>
                        <Typography>{course.periodName}</Typography>
                        <Typography color="text.secondary">Kapacita:</Typography>
                        <Typography>{course.capacity}</Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default CourseDescription;
