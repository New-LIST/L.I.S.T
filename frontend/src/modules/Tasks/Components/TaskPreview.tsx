import { Box, Typography, Divider } from '@mui/material';
import TaskCard from './TaskCard';

type Props = {
    name: string;
    text: string;
    comment: string;
};

const TaskPreview = ({ name, text, comment }: Props) => {
    return (
        <Box>
            <TaskCard name={name} text={text} />

            <Divider sx={{ mb: 1 }} />

            <Typography variant="subtitle2" color="text.secondary">
                Interný komentár:
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {comment || '(Žiadny)'}
            </Typography>
        </Box>
    );
};

export default TaskPreview;
