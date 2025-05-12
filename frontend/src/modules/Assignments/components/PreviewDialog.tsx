import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TaskPreview from "../../Tasks/Components/TaskPreview";
import { TaskPreviewData
    
 } from "../../Tasks/Types/TaskPreviewData";
type PreviewDialogProps = {
  open: boolean;
  onClose: () => void;
  data: TaskPreviewData | null;
};

const PreviewDialog = ({ open, onClose, data }: PreviewDialogProps) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <span>Preview úlohy</span>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
    </DialogTitle>
    <DialogContent dividers>
      {data && (
        <TaskPreview
          name={data.name}
          text={data.text}
          comment={data.comment}
          authorName={data.authorName}
        />
      )}
    </DialogContent>
  </Dialog>
);

export default PreviewDialog;
