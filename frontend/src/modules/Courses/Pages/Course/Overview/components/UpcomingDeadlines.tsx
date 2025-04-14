import { Card, CardContent, Typography, Box } from '@mui/material';

const upcomingDeadlines = [
    { name: 'Paging and TLB', deadline: 'Due in 3 days', points: 20 },
    { name: 'Swapping', deadline: 'Due in 7 days', points: 29 },
    { name: 'Threads and locks', deadline: 'Due in 14 days', points: 18 },
    { name: 'Processes', deadline: 'Due in 20 days', points: 15 },
    { name: 'Memory Management', deadline: 'Due in 24 days', points: 20 },
    { name: 'Virtual Memory', deadline: 'Due in 30 days', points: 25 },
    { name: 'File Systems', deadline: 'Due in 35 days', points: 15 },
    { name: 'Networking', deadline: 'Due in 40 days', points: 30 },
    { name: 'Security', deadline: 'Due in 45 days', points: 10 },
    { name: 'Final Exam', deadline: 'Due in 50 days', points: 40 },
];

export default function UpcomingDeadlines() {
    return (
        <Card sx={{ flex: 1 }}>
            <CardContent
                sx={{
                    maxHeight: {
                        xs: 'auto',
                        md: 300,
                    },
                    overflowY: {
                        xs: 'visible',
                        md: 'auto',
                    },
                    pr: {
                        xs: 2,
                        md: 5,
                    },
                }}
            >
                <Typography variant="subtitle1" color="primary" fontWeight="medium" gutterBottom>
                    Prichádzajúce Deadliny
                </Typography>
                {upcomingDeadlines.map((item) => (
                    <Box
                        key={item.name}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        py={1}
                        borderBottom={1}
                        borderColor="#f0f0f0"
                    >
                        <Box>
                            <Typography variant="body2" fontWeight="medium">
                                {item.name}
                            </Typography>
                            <Typography variant="caption" color="error">
                                {item.deadline}
                            </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="medium">
                            {item.points} points
                        </Typography>
                    </Box>
                ))}
            </CardContent>
        </Card>
    );
}
