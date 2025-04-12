import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
import React from "react";
import { TaskSetType } from "../Types/TaskSetType";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  name: string;
  setName: (value: string) => void;
  identifier: string;
  setIdentifier: (value: string) => void;
  nameError: string | null;
};

const CreateTaskSetTypeDialog = ({
  open,
  onClose,
  onSubmit,
  name,
  setName,
  identifier,
  setIdentifier,
  nameError,
}: Props) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Pridať nový typ zostavy</DialogTitle>
      <DialogContent
        dividers
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        <TextField
          label="Názov typu"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!nameError}
          helperText={nameError}
          fullWidth
        />
        <TextField
          label="Identifikátor"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          
          fullWidth
        />
      </DialogContent>
      <DialogActions>
                <Button onClick={onClose}>Zrušiť</Button>
                <Button
                  onClick={() => {
                    onSubmit();
                  }}
                  variant="contained"
                >
                  Pridať
                </Button>
              </DialogActions>
    </Dialog>
  );
};
export default CreateTaskSetTypeDialog;
