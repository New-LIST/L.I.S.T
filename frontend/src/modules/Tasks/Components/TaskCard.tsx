import { Box, Paper, Typography, Divider } from '@mui/material';

type Props = {
    name: string;
    text: string;
    authorName: string;
};

const TaskCard = ({ name, text, authorName }: Props) => {
    return (
        <Paper
            elevation={2}
            sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                backgroundColor: '#fff',
            }}
        >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                {name}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Box
                sx={{
                    '& img': { maxWidth: '100%' },
                    '& p': { mb: 1.5 },
                }}
                dangerouslySetInnerHTML={{ __html: text }}
            />
            <Divider sx={{ mt: 2 }} />

            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="caption" color="text.secondary">
                    Vytvoril: {authorName}
                </Typography>
            </Box>
        </Paper>
    );
};

export default TaskCard;
