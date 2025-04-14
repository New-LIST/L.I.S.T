import { Box, Card, CardContent, Typography, Divider } from '@mui/material';

const CourseDescription = () => {
    const courseName = 'Operating Systems';
    const term = 'Summer 2023/2024';

    return (
        <Box>
            {}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h5" fontWeight="bold">
                        {courseName} / {term}
                    </Typography>
                </CardContent>
            </Card>

            {}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Course Description
                    </Typography>
                    <Typography paragraph>
                        This course covers the fundamental concepts of operating systems design and implementation.
                    </Typography>
                    <Typography paragraph>
                        Students will learn about process management, scheduling algorithms, memory management, file systems, and security.
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                        Course Information
                    </Typography>
                    <Box display="grid" gridTemplateColumns="1fr 2fr" rowGap={1}>
                        <Typography color="text.secondary">Instructor:</Typography>
                        <Typography>Pavel Petrovic</Typography>
                        <Typography color="text.secondary">Credits:</Typography>
                        <Typography>6</Typography>
                        <Typography color="text.secondary">Semester:</Typography>
                        <Typography>Summer 2023/2024</Typography>
                        <Typography color="text.secondary">Schedule:</Typography>
                        <Typography>Mon 10:00–11:30, Wed 14:00–15:30</Typography>
                        <Typography color="text.secondary">Location:</Typography>
                        <Typography>Building A, Room 305</Typography>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                        Learning Outcomes
                    </Typography>
                    <ul style={{ paddingLeft: '1.5rem', marginTop: 0 }}>
                        <li><Typography>Understand core OS concepts and principles</Typography></li>
                        <li><Typography>Analyze various OS algorithms and their tradeoffs</Typography></li>
                        <li><Typography>Design and implement basic OS components</Typography></li>
                        <li><Typography>Apply theoretical knowledge to practical problems</Typography></li>
                    </ul>
                </CardContent>
            </Card>
        </Box>
    );
};

export default CourseDescription;
