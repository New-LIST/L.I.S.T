// src/modules/assignments/components/solution-tabs/TestsTab.tsx

import React from 'react';
import { Box, Typography } from '@mui/material';

interface TestsTabProps {
  assignmentId: number;
  solutionId: number;
}

const TestsTab: React.FC<TestsTabProps> = ({ assignmentId, solutionId }) => (
  <Box>
    <Typography variant="body1" color="text.secondary">
      Tu bude výsledok automatických testov (placeholder).
    </Typography>
  </Box>
);

export default TestsTab;
