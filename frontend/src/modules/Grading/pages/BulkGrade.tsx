import React, { useEffect, useState } from 'react';
import { useParams }         from 'react-router-dom';
import {
  TableContainer,
  Table, TableHead, TableRow, TableCell, TableBody,
  Paper, Typography, Box, TextField, Button
} from '@mui/material';
import api from '../../../services/api';
import { useNotification } from '../../../shared/components/NotificationContext';

interface BulkGradeItem {
  studentId: number;
  fullName:  string;
  email:     string;
  points:    number | null;
}

const BulkGrade: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [items, setItems]   = useState<BulkGradeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const {showNotification} = useNotification();
  const [assignmentName, setAssignmentName] = useState<string>();


  useEffect(() => {
    api.get<{ name: string }>(`/assignments/${assignmentId}/assignmentName`)
      .then(r => setAssignmentName(r.data.name));
  }, [assignmentId]);

  useEffect(() => {
    if (!assignmentId) return;
    setLoading(true);
    api.get<BulkGradeItem[]>(`/assignments/${assignmentId}/solutions/bulk`)
      .then(res => setItems(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [assignmentId]);

  const onChange = (idx: number, val: string) => {
    const copy = [...items];
    copy[idx].points = val === '' ? null : Number(val);
    setItems(copy);
  };

  const onSave = async () => {
    if (!assignmentId) return;
    setSaving(true);
    const payload = items.map(i => ({
      studentId: i.studentId,
      points:    i.points
    }));
    try {
      await api.post(
        `/assignments/${assignmentId}/solutions/bulk`,
        payload
      );
      showNotification("Úspešne ohodnotené", "success");
    } catch (e) {
      console.error(e);
      showNotification("Nastala chyba pri hodnotení", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Hromadné hodnotenie zadania {assignmentName ?? assignmentId}
      </Typography>
      <TableContainer component={Paper}>
        <Table size = "small">
          <TableHead>
            <TableRow>
              <TableCell>Meno</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Body</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Načítavam…
                </TableCell>
              </TableRow>
            )}
            {!loading && items.map((it, idx) => (
              <TableRow key={it.studentId}>
                <TableCell>{it.fullName}</TableCell>
                <TableCell>{it.email}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={it.points ?? ''}
                    onChange={e => onChange(idx, e.target.value)}
                    size="small"
                    placeholder="—"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box mt={2} textAlign="right">
        <Button
          variant="contained"
          disabled={saving}
          onClick={onSave}
        >
          {saving ? 'Ukladám…' : 'Uložiť zmeny'}
        </Button>
      </Box>
    </Box>
  );
};

export default BulkGrade;
