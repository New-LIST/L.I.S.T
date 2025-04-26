import { Box, Paper, Typography, Divider } from '@mui/material';

type Props = {
    name: string;
    text: string;
};

const TaskCard = ({ name, text }: Props) => {
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
        </Paper>
    );
};

export default TaskCard;
