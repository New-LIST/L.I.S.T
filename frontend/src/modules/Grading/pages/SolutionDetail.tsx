// src/modules/assignments/pages/SolutionDetail.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  CircularProgress,
  Button
} from '@mui/material';
import api from '../../../services/api';
import InfoTab from '../components/InfoTab';
import FilesTab from '../components/FilesTab';
import TestsTab from '../components/TestsTab';
import AssignmentPreview from '../../Assignments/components/AssignmentPreview';

interface EvaluationHeader {
  assignmentName: string;
  courseName: string;
  studentFullName: string;
  studentEmail: string;
}

const SolutionDetail: React.FC = () => {
  const { assignmentId, solutionId } = useParams<{ assignmentId: string; solutionId: string }>();
  const [tab, setTab] = useState(0);
  const [info, setInfo] = useState<EvaluationHeader | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!assignmentId || !solutionId) return;
    api.get<EvaluationHeader>(`/assignments/${assignmentId}/solutions/${solutionId}/header`)
      .then(res => setInfo(res.data))
      .catch(console.error);
  }, [assignmentId, solutionId]);

  if (!info) {
    return <Box textAlign="center" mt={4}><CircularProgress/></Box>;
  }

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Box p={3}>
       <Paper
        sx={{
          p: 2,
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h6">
          {info.assignmentName} - {info.courseName}
        </Typography>
        <Typography color="text.secondary">
          {info.studentFullName} ({info.studentEmail})
        </Typography>
        <Button
          variant="outlined"
          onClick={() =>
            navigate(-1)
          }
        >
          Späť na hodnotenie
        </Button>
      </Paper>

      <Tabs value={tab} onChange={handleChange} indicatorColor="primary" textColor="primary" centered>
        <Tab label="Info" />
        <Tab label="Súbory" />
        <Tab label="Testy" />
        <Tab label="Prehľad zadania" />
      </Tabs>

      <Box mt={1}>
        {tab === 0 && <InfoTab assignmentId={+assignmentId!} solutionId={+solutionId!} />}
        {tab === 1 && <FilesTab assignmentId={+assignmentId!} solutionId={+solutionId!} />}
        {tab === 2 && <TestsTab assignmentId={+assignmentId!} solutionId={+solutionId!} />}
        {tab === 3 && <AssignmentPreview assignmentId={+assignmentId!}/>}
      </Box>
    </Box>
  );
};

export default SolutionDetail;
