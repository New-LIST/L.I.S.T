// src/pages/Assignments/components/UploadSolutionForm.tsx

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Stack,
  Chip,
} from "@mui/material";
import api from "../../../services/api.ts";
import { useNotification } from "../../../shared/components/NotificationContext";
import UploadFileIcon from "@mui/icons-material/UploadFile";



type UploadSolutionFormProps = {
  assignmentId: number;
};

const UploadSolutionForm: React.FC<UploadSolutionFormProps> = ({
  assignmentId,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [comment, setComment] = useState<string>("");  // komentár
  const [uploading, setUploading] = useState<boolean>(false);
  const { showNotification } = useNotification();

  // Keď študent vyberie ZIP súbor
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Keď sa mení text v komentári
  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  };

  // Odoslanie ZIP + komentár na backend
  const handleSubmit = async () => {
    if (!selectedFile) {
      showNotification("Vyberte súbor pred odoslaním.", "error");
      return;
    }


    try {
      // Vytvoríme FormData a pripojíme "file" + "comment"
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("comment", comment);

      // Odosielame na endpoint:
      //   POST /api/assignments/{assignmentId}/solutions/versions
      await api.post(
        `/assignments/${assignmentId}/solutions/versions`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      showNotification("Riešenie bolo úspešne odovzdané", "success");
      setSelectedFile(null);
      setComment("");
    } catch (e) {
      console.error("Chyba pri odoslaní riešenia:", e);
      showNotification("Nastala chyba pri odoslaní riešenia", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
     <Box>
      <Stack direction="column" spacing={2}>
        {/* Tlačidlo na výber súboru */}
        <Box>
          <input
            id="upload-file-input"
            type="file"
            style={{ display: "none" }}
            onChange={handleFileChange}
            disabled={uploading}
          />
          <label htmlFor="upload-file-input">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadFileIcon />}
              disabled={uploading}
            >
              Vybrať súbor
            </Button>
          </label>
          {selectedFile && (
            <Chip
              label={selectedFile.name}
              size="small"
              sx={{
                ml: 2,
                maxWidth: 200,
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            />
          )}
        </Box>

        {/* Textové pole pre komentár */}
        <TextField
          label="Komentár k riešeniu"
          value={comment}
          onChange={handleCommentChange}
          fullWidth
          multiline
          rows={3}
          disabled={uploading}
        />

        {/* Tlačidlo na odoslanie */}
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={uploading || !selectedFile}
          >
            {uploading ? "Odosielam..." : "Odoslať riešenie"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default UploadSolutionForm;
