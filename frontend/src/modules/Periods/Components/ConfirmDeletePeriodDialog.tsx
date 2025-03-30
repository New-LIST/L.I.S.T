import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
  } from '@mui/material';
  import React from 'react';
  
  type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    periodName: string;
    courseCount: number;
  }
  
  const ConfirmDeletePeriodDialog = ({
    open,
    onClose,
    onConfirm,
    periodName,
    courseCount,
  }: Props) => {

    const formatCourseCount = (count: number): string => {
      if (count === 1) return 'kurz';
      if (count >= 2 && count <= 4) return `kurzy`;
      return `kurzov`;
    };


    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Potvrdenie vymazania</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography>
            Naozaj chceš vymazať obdobie <strong>{periodName}</strong>?
          </Typography>
          <Typography>
            Toto obdobie obsahuje <strong>{courseCount}</strong> {formatCourseCount(courseCount)}.
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
  
  export default ConfirmDeletePeriodDialog;
  