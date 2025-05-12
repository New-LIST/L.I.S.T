import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography
  } from '@mui/material';
  
  type Props = {
    open: boolean;
    title: string;
    message: string;
    onClose: () => void;
    onConfirm: () => void;
  };
  
  const ConfirmDialog = ({ open, title, message, onClose, onConfirm }: Props) => {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Typography>{message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Zrušiť</Button>
          <Button onClick={onConfirm} variant="contained">
            Vymazať
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default ConfirmDialog;
  