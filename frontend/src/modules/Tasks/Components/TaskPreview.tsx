import { Box, Typography, Divider } from '@mui/material';
import TaskCard from './TaskCard';

type Props = {
    name: string;
    text: string;
    comment: string;
    authorName: string;
};

const TaskPreview = ({ name, text, comment, authorName }: Props) => {
    return (
        <Box>
            <TaskCard name={name} text={text} authorName = {authorName} />

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
