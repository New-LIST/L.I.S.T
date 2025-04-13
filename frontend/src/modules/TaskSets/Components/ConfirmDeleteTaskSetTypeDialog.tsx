import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
  } from '@mui/material';
  import React from 'react';
  
  interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: () => void;
    typeName: string;
  }
  
  const ConfirmDeleteTaskSetTypeDialog = ({ open, onClose, onSubmit, typeName }: Props) => {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Potvrdenie vymazania</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography>
            Naozaj chceš vymazať typ zostavy <strong>{typeName}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Zrušiť</Button>
          <Button onClick={onSubmit} color="error" variant="contained">
            Vymazať
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default ConfirmDeleteTaskSetTypeDialog;