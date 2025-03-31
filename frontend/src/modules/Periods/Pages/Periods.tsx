import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { TextField,Card,Typography, Container, Button, List, ListItem, ListItemText, IconButton, CircularProgress, Alert, CardContent, } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PeriodDialog from '../Components/PeriodDialog';
import { useNotification } from '../../../shared/components/NotificationContext';
import ConfirmDeletePeriodDialog from '../Components/ConfirmDeletePeriodDialog';
import {Period} from '../Types/Period'

const Periods = () => {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [periodToDelete, setPeriodToDelete] = useState<Period | null>(null);

  const fetchPeriods = async () => {
    setLoading(true);
    try {
      const response = await api.get("/periods");
      setPeriods(response.data);
    } catch (err) {
      console.error(err);
      showNotification('Nepodarilo sa načítať zoznam období.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setNameError('Názov obdobia nemôže byť prázdny.');
      return;
    }

    const exists = periods.some(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setNameError('Obdobie s týmto názvom už existuje.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/periods', { name: trimmed });
      setOpenDialog(false);
      setNewName('');
      setNameError(null);
      setError(null);
      showNotification('Obdobie bolo úspešne pridané.', 'success');
      fetchPeriods();
    } catch (err) {
      console.error(err);
      showNotification('Nepodarilo sa pridať nové obdobie.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const requestDeletePeriod = (period: Period) => {
    setPeriodToDelete(period);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!periodToDelete) return;
    try {
      await api.delete(`/periods/${periodToDelete.id}`);
      showNotification('Obdobie bolo vymazané.', 'success');
      fetchPeriods();
    } catch (err) {
      console.error(err);
      showNotification('Nepodarilo sa vymazať obdobie.', 'error');
    } finally {
      setConfirmOpen(false);
      setPeriodToDelete(null);
    }
  };
  

  useEffect(() => {
    fetchPeriods();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Obdobia
      </Typography>

      <Button
        onClick={() => setOpenDialog(true)}
        variant="contained"
        sx={{ mb: 2 }}
      >
        Pridať nové obdobie
      </Button>

      <Card>
        <CardContent>
          {loading ? (
            <CircularProgress />
          ) : (
            <List>
              {periods.map((period) => (
                <ListItem
                  key={period.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => requestDeletePeriod(period)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={period.name} />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
      <PeriodDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setNewName("");
          setNameError(null);
        }}
        onSubmit={handleCreate}
        name={newName}
        setName={setNewName}
        nameError={nameError}
      />
      {periodToDelete && (
        <ConfirmDeletePeriodDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
          periodName={periodToDelete.name}
          courseCount={periodToDelete.courseCount}
        />
      )}
    </Container>
  );
};

export default Periods;
