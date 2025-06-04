import {
    Box,
    Typography,
    Card,
    CardContent,
    LinearProgress,
} from '@mui/material';

const categories = [
    { id: 'homework', label: 'Domáce úlohy', points: 66.1, maxPoints: 149 },
    { id: 'exam', label: 'Skúšky', points: 0, maxPoints: 90 },
    { id: 'project', label: 'Projekty', points: 17, maxPoints: 55 },
];

export default function ProgressCard() {
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
                            return (
                                <Box key={cat.id} mb={1}>
                                    <Typography variant="body2" fontWeight="medium">
                                        {cat.label}
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={percent}
                                        color={cat.id === 'homework' ? 'primary' : cat.id === 'project' ? 'secondary' : 'inherit'}
                                        sx={{ height: 8, borderRadius: 4, mb: 0.5 }}
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
