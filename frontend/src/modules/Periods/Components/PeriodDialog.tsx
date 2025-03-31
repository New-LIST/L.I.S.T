import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import React from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  name: string;
  setName: (value: string) => void;
  nameError: string | null;
};

const PeriodDialog = ({
  open,
  onClose,
  onSubmit,
  name,
  setName,
  nameError,
}: Props) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Pridať nové obdobie
      </DialogTitle>
      <DialogContent
        dividers
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
      >
        <TextField
          label="Názov obdobia"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!nameError}
          helperText={nameError}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Zrušiť</Button>
        <Button onClick={onSubmit} variant="contained">
          Pridať
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PeriodDialog;
