import {
    Box,
    Typography,
    Card,
    CardContent,
    LinearProgress, CircularProgress,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../../../../services/api';
import { getTypeColor } from './ColorHelper.ts';

interface CategoryData {
    id: string;
    label: string;
    points: number;
    maxPoints: number;
}

export default function ProgressCard() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<CategoryData[]>([]);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [assignmentsRes, pointsRes] = await Promise.all([
                    api.get(`/assignments/filter?courseId=${id}`),
                    api.get(`/solutions/courses/${id}/student-points`)
                ]);

                const pointsMap: Record<number, number> = {};
                pointsRes.data.forEach((p: { assignmentId: number; points: number }) => {
                    pointsMap[p.assignmentId] = p.points;
                });

                const grouped = new Map<string, CategoryData>();

                assignmentsRes.data.items
                    .filter((a: any) => a.published) // iba publikované
                    .forEach((a: any) => {
                        const typeId = a.taskSetType.identifier;
                        const typeName = a.taskSetType.name;
                        const points = pointsMap[a.id] ?? 0;
                        const maxPoints = a.pointsOverride ?? 0;

                        if (!grouped.has(typeId)) {
                            grouped.set(typeId, {
                                id: typeId,
                                label: typeName,
                                points: 0,
                                maxPoints: 0,
                            });
                        }

                        const g = grouped.get(typeId)!;
                        g.points += points;
                        g.maxPoints += maxPoints;
                    });

                setCategories(Array.from(grouped.values()));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return <CircularProgress sx={{ m: 3 }} />;
    }

    const totalPoints = categories.reduce((sum, c) => sum + c.points, 0);
    const maxPoints = categories.reduce((sum, c) => sum + c.maxPoints, 0);
    const overallPercentage = Math.round((totalPoints / maxPoints) * 100);

    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap">
                    <Box flex={1} minWidth={200} mr={2}>
                        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                            Celkový progress
                        </Typography>
                        <Typography variant="body2" color="primary">
                            {totalPoints} / {maxPoints} points
                        </Typography>
                        <LinearProgress
                            value={overallPercentage}
                            variant="determinate"
                            sx={{ height: 10, borderRadius: 5, my: 1 }}
                        />
                        <Box textAlign="right">
                            <Typography variant="caption" color="primary">
                                {overallPercentage}%
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box mt={3}>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                        Body podľa kategórií
                    </Typography>

                    <Box mt={2}>
                        {categories.map((cat) => {
                            const percent = Math.round((cat.points / cat.maxPoints) * 100);
                            const barColor = getTypeColor(cat.id);

                            return (
                                <Box key={cat.id} mb={1}>
                                    <Typography variant="body2" fontWeight="medium">
                                        {cat.label}
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={percent}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            mb: 0.5,
                                            backgroundColor: '#eee',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: barColor,
                                            },
                                        }}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                        {cat.points} / {cat.maxPoints} points ({percent}%)
                                    </Typography>
                                </Box>
                            );
                        })}

                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
