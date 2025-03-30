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
    onConfirm: () => void;
    courseName: string;
  }
  
  const ConfirmDeleteCourseDialog = ({ open, onClose, onConfirm, courseName }: Props) => {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Potvrdenie vymazania</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography>
            Naozaj chceš vymazať kurz <strong>{courseName}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Zrušiť</Button>
          <Button onClick={onConfirm} color="error" variant="contained">
            Vymazať
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default ConfirmDeleteCourseDialog;
  