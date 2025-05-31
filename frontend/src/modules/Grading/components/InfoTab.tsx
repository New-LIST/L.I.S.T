// src/modules/assignments/components/solution-tabs/InfoTab.tsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Button
} from '@mui/material';
import api from '../../../services/api';
import { useNotification } from "../../../shared/components/NotificationContext";


interface InfoTabProps {
  assignmentId: number;
  solutionId: number;
}

export interface SolutionInfoDto {
  testsPoints: number;
  points: number | null;
  comment: string | null;
  revalidate: boolean;
  disableEvaluationByTests: boolean;
}

const InfoTab: React.FC<InfoTabProps> = ({ assignmentId, solutionId }) => {
  const [data, setData] = useState<SolutionInfoDto | null>(null);
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();
  

  useEffect(() => {
    api
      .get<SolutionInfoDto>(
        `/assignments/${assignmentId}/solutions/${solutionId}/evaluate`
      )
      .then(res => setData(res.data))
      .catch(console.error);
  }, [assignmentId, solutionId]);

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      await api.post(
        `/assignments/${assignmentId}/solutions/${solutionId}/evaluate`,
        data
      );
      showNotification("Úspešne ohodnotné", "success");
    } catch (err) {
      console.error(err);
      showNotification("Chyba pri ukladaní hodnotenia", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!data) {
    return (
      <Box textAlign="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display="grid" gap={2}>
      <TextField
        label="Body za testy"
        value={data.testsPoints}
        InputProps={{ readOnly: true }}
        fullWidth
      />

      <TextField
        label="Body"
        value={data.points ?? ''}
        type="number"
        onChange={e =>
          setData(old => {
            if (!old) return old;
            const val = e.target.value;
            return { ...old, points: val === '' ? null : Number(val) };
          })
        }
        fullWidth
      />

      <TextField
        label="Komentár"
        value={data.comment ?? ''}
        multiline
        rows={4}
        onChange={e =>
          setData(old =>
            old ? { ...old, comment: e.target.value } : old
          )
        }
        fullWidth
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={data.revalidate}
            onChange={(_, v) =>
              setData(old => (old ? { ...old, revalidate: v } : old))
            }
          />
        }
        label="Nebrať do úvahy riešenie"
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={data.disableEvaluationByTests}
            onChange={(_, v) =>
              setData(old =>
                old ? { ...old, disableEvaluationByTests: v } : old
              )
            }
          />
        }
        label="Zakázať hodnotenie testami"
      />

      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Ukladám…' : 'Uložiť zmeny'}
        </Button>
      </Box>
    </Box>
  );
};

export default InfoTab;
