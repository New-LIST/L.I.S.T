import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { Card, Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,Typography, Container, Button, List, ListItem, ListItemText, IconButton, CircularProgress, CardContent, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'
import { useNotification } from '../../../shared/components/NotificationContext';
import CreatePeriodDialog from '../Components/CreatePeriodDialog';
import EditPeriodDialog from '../Components/EditPeriodDialog';
import ConfirmDeletePeriodDialog from '../Components/ConfirmDeletePeriodDialog';
import {Period} from '../Types/Period'

const Periods = () => {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [periodToDelete, setPeriodToDelete] = useState<Period | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [periodToEdit, setPeriodToEdit] = useState<Period | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

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

  const resetForm = () => {
    setNewName('');
    setNameError(null);
    setEditError(null);
    setEditDialogOpen(false);
    setOpenDialog(false);
    setConfirmOpen(false);
    setEditName('');
    setPeriodToDelete(null);
    setPeriodToEdit(null);
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
      showNotification('Obdobie bolo úspešne pridané.', 'success');
      fetchPeriods();
    } catch (err) {
      console.error(err);
      showNotification('Nepodarilo sa pridať nové obdobie.', 'error');
    } finally {
      setLoading(false);
      resetForm();
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
      resetForm();
    }
  };

  const openEditDialog = (period: Period) => {
    setPeriodToEdit(period);
    setEditName(period.name);
    setEditError(null);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async (newName: string) => {
    if (!newName.trim()) {
      setEditError('Názov nemôže byť prázdny.');
      return;
    }
  
    try {
      await api.put(`/periods/${periodToEdit!.id}`, { name: newName.trim() });
      showNotification('Obdobie bolo aktualizované.', 'success');
      fetchPeriods();
      setEditDialogOpen(false);
    } catch (err) {
      resetForm();
      console.error(err);
      showNotification('Nepodarilo sa upraviť obdobie.', 'error');
    }
  };
  
  

  useEffect(() => {
    fetchPeriods();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
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
              <Table size = "small">
              <TableHead>
              <TableRow>
                <TableCell>Názov odbodbia</TableCell>
                <TableCell align="right">Akcie</TableCell>
              </TableRow>
              </TableHead>
              <TableBody>
                {periods.map((period) => (
                  <TableRow key = {period.id}>
                    <TableCell>{period.name}</TableCell>
                    <TableCell align="right">
                      <Box>
                      <IconButton
                        onClick={() => openEditDialog(period)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => requestDeletePeriod(period)}
                      >
                        <DeleteIcon />
                      </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <CreatePeriodDialog
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
      <EditPeriodDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleSaveEdit}
        currentName={editName}
        setCurrentName={setEditName}
        error={editError}
      />
    </Container>
  );
};

export default Periods;
