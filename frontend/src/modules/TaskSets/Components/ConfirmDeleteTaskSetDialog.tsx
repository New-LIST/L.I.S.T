import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  affectedCount: number;
};

const ConfirmDeleteTaskSetDialog = ({ open, onClose, onConfirm, affectedCount }: Props) => {


  const formatTaskSetCount1 = (count: number): string => {
    if (count === 1) return 'vymaže';
    if (count >= 2 && count <= 4) return `vymažú`;
    return `vymaže`;
  };

  const formatTaskSetCount2 = (count: number): string => {
    if (count === 1) return 'vymaže 1 ďaľšia zostava';
    if (count >= 2 && count <= 4) return `daľšie zostavy`;
    return `daľších zostav`;
  };


  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Potvrdenie vymazania</DialogTitle>
      <DialogContent dividers>
        <Typography>
          Zmazaním tejto zostavy sa {formatTaskSetCount1(affectedCount)} <strong> {affectedCount} </strong> {formatTaskSetCount2(affectedCount)}, ktoré na ňu odkazujú vo vzorci.
        </Typography>
        <Typography>Chceš pokračovať?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Zrušiť</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Vymazať všetky
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteTaskSetDialog;
