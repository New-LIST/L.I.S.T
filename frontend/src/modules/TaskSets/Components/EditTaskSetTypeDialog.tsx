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
    onSubmit: (newName: string, newIdentifier: string) => void;
    currentName: string;
    setCurrentName: (name: string) => void;
    currentIdentifier: string;
    setCurrentIdentifier: (name: string) => void;
    error: string | null;
  };
  
  const EditTaskSetTypeDialog = ({
    open,
    onClose,
    onSubmit,
    currentName,
    setCurrentName,
    currentIdentifier,
    setCurrentIdentifier,
    error,
  }: Props) => {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Upraviť typ zostavy</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Nový názov"
            value={currentName}
            onChange={(e) => setCurrentName(e.target.value)}
            error={!!error}
            helperText={error}
            fullWidth
          />
          <TextField
            label="Nový identifier"
            value={currentIdentifier}
            onChange={(e) => setCurrentIdentifier(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Zrušiť</Button>
          <Button onClick={() => onSubmit(currentName, currentIdentifier)} variant="contained">
            Uložiť
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default EditTaskSetTypeDialog;
  