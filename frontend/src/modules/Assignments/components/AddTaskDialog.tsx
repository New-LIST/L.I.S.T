import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  Button
} from "@mui/material";
import TaskPreview from "../../Tasks/Components/TaskPreview";
import { TaskPreviewData } from "../../Tasks/Types/TaskPreviewData";
type AddTaskDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: {
    pointsTotal: number;
    bonusTask: boolean;
    internalComment: string;
  }) => void;
  data: TaskPreviewData | null;
};

const AddTaskDialog = ({ open, onClose, onConfirm, data }: AddTaskDialogProps) => {
  const [pointsTotal, setPointsTotal] = useState(0);
  const [bonusTask, setBonusTask] = useState(false);
  const [internalComment, setInternalComment] = useState("");

  const handleConfirm = () => {
    onConfirm({ pointsTotal, bonusTask, internalComment });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Pridať úlohu do zostavy</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Body za túto úlohu"
            type="number"
            value={pointsTotal}
            onChange={(e) => setPointsTotal(Number(e.target.value))}
            fullWidth
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={bonusTask}
                onChange={(e) => setBonusTask(e.target.checked)}
              />
            }
            label="Je to bonusová úloha?"
          />
          <TextField
            label="Interný komentár"
            value={internalComment}
            onChange={(e) => setInternalComment(e.target.value)}
            multiline
            rows={3}
            fullWidth
          />
        </Box>
      <DialogActions>
        <Button onClick={onClose}>Zrušiť</Button>
        <Button variant="contained" onClick={handleConfirm}>
          Pridať
        </Button>
      </DialogActions>
      {data && (
        <Box mt={4}>
        <TaskPreview
          name={data.name}
          text={data.text}
          comment={data.comment}
          authorName={data.authorName}
        />
        </Box>
      )}
    </DialogContent>
    </Dialog>
  );
};

export default AddTaskDialog;
