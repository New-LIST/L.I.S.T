import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Button,
  } from '@mui/material';
  import React from 'react';
  import { Period } from '../../Periods/Types/Period';
  
  type Props = {
    open: boolean;
    onClose: () => void;
    onCreate: (name: string, periodId: number | '') => void;

    name: string;
    setName: (value: string) => void;
    selectedPeriodId: number | '';
    setSelectedPeriodId: (id: number | '') => void;
    nameError: string | null;
    periods: Period[];
  }
  
  const CourseDialog = ({
    open,
    onClose,
    onCreate,
    name,
    setName,
    selectedPeriodId,
    setSelectedPeriodId,
    nameError,
    periods,
  }: Props) => {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Pridať nový kurz</DialogTitle>
        <DialogContent
          dividers
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
        >
          <TextField
            label="Názov kurzu"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!nameError}
            helperText={nameError}
            fullWidth
          />
          <TextField
            select
            label="Obdobie"
            value={selectedPeriodId}
            onChange={(e) =>
                setSelectedPeriodId(e.target.value === '' ? '' : Number(e.target.value))
            }
            fullWidth
          >
            {periods.map((period) => (
              <MenuItem key={period.id} value={period.id}>
                {period.name}
              </MenuItem>
            ))}     
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Zrušiť</Button>
          <Button
            onClick={() =>  {
                onCreate(name, selectedPeriodId);
              }}
            variant="contained"
          >
            Pridať
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default CourseDialog;
  