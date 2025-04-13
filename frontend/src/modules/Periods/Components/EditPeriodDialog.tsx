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
    onSave: (newName: string) => void;
    currentName: string;
    setCurrentName: (name: string) => void;
    error: string | null;
  };
  
  const EditPeriodDialog = ({
    open,
    onClose,
    onSave,
    currentName,
    setCurrentName,
    error,
  }: Props) => {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Upraviť obdobie</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Nový názov"
            value={currentName}
            onChange={(e) => setCurrentName(e.target.value)}
            error={!!error}
            helperText={error}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Zrušiť</Button>
          <Button onClick={() => onSave(currentName)} variant="contained">
            Uložiť
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default EditPeriodDialog;
  