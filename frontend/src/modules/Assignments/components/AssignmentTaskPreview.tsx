import React from 'react';
import { Box, Typography, Divider, Paper } from '@mui/material';


type Props = {
  name: string;
  text: string;
  authorName: string;
  pointsTotal: number;
  bonus: boolean;
};

const AssignmentTaskPreview: React.FC<Props> = ({
  name,
  text,
  pointsTotal,
  bonus,
  authorName,
}) => (
  <Paper
            elevation={2}
            sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                backgroundColor: '#fff',
            }}
        >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
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

            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Typography variant="h6" fontWeight="bold">
                    {bonus ? `Bonus ${pointsTotal} bodov` : `${pointsTotal} bodov`}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                    Author: {authorName}
                </Typography>
            </Box>
            <Divider sx={{ mb: 4 }} />
        </Paper>
);

export default AssignmentTaskPreview;
