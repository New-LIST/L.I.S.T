import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

export default function CourseDetail() {
    const { id } = useParams();

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="bold">
                Detail kurzu
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
                ID kurzu: {id}
            </Typography>
        </Box>
    );
}
