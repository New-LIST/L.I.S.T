import {
  Container,
  Typography,
  Box,
  TextField,
  Stack,
  Button,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import "tinymce/tinymce";
import "tinymce/themes/silver/theme";
import "tinymce/icons/default/icons";
import "tinymce/models/dom/model";

import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/code";
import "tinymce/plugins/image";
import "tinymce/plugins/table";

import api from "../../../services/api";
import { useNotification } from "../../../shared/components/NotificationContext";
import TaskPreview from "../Components/TaskPreview";
import TaskCategoryTab from "../Components/TaskCategoryTab";

const TaskEditor = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const { showNotification } = useNotification();

  const [mode, setMode] = useState<"edit" | "preview" | "categories">("edit");

  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [comment, setComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode) return;

    const loadTask = async () => {
      try {
        const response = await api.get(`/tasks/${id}`);
        const task = response.data;
        setName(task.name);
        setText(task.text ?? "");
        setAuthorName(task.authorFullname ?? "unknown");
        setComment(task.internalComment ?? "");
      } catch {
        showNotification("Nepodarilo sa načítať úlohu.", "error");
        navigate("/dash/tasks");
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [id]);

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      let updatedText = text;

      const matches = [
        ...text.matchAll(/<img[^>]+src=["'](data:image\/[^"']+)["'][^>]*>/g),
      ];

      for (const match of matches) {
        const base64Data = match[1];

        const blob = await (await fetch(base64Data)).blob();
        const formData = new FormData();
        formData.append("file", blob, "image.png");

        const response = await api.post("/tasks/upload-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });

        const { location } = response.data;

        updatedText = updatedText.replace(base64Data, location);
      }

      if (isEditMode) {
        await api.put(`/tasks/${id}`, {
          name,
          text: updatedText,
          internalComment: comment,
        });
        showNotification("Úloha bola upravená.", "success");
      } else {
        await api.post("/tasks", {
          name,
          text: updatedText,
          internalComment: comment,
        });
        showNotification("Úloha bola vytvorená.", "success");
      }

      navigate("/dash/tasks");
    } catch {
      showNotification("Chyba pri ukladaní úlohy.", "error");
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Tabs
        value={mode}
        onChange={(_, newValue) => setMode(newValue)}
        centered
        sx={{ mb: 3 }}
      >
        <Tab label="Editor" value="edit" />
        <Tab label="Prehľad" value="preview" />
        {isEditMode && <Tab label="Kategórie" value="categories" />}
      </Tabs>

      {mode === "edit" &&
        <Stack spacing={3}>
          <TextField
            label="Názov úlohy"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />

          <Box>
            <Typography variant="subtitle1" fontWeight="medium" mb={1}>
              Text úlohy
            </Typography>
            <Editor
              value={text}
              onEditorChange={(content) => setText(content)}
              init={{
                height: 600,
                menubar: false,
                plugins: "lists link image table code",
                toolbar:
                  "undo redo | fontfamily fontsize | bold italic underline | forecolor backcolor | alignleft aligncenter alignright | bullist numlist outdent indent | link image | table | code ",
                fontsize_formats: "8pt 10pt 12pt 14pt 18pt 24pt 36pt",
                font_formats:
                  "Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; Verdana=verdana,geneva,sans-serif; Times New Roman=times new roman,times,serif;",
                content_style:
                  "body { font-family:Roboto,Arial,sans-serif; font-size:14px }",
                skin_url: "/tinymce/skins/ui/oxide",
                content_css: "/tinymce/skins/content/default/content.css",
                license_key: "gpl",
                model: "dom",

                file_picker_types: "image",
                file_picker_callback: (callback, value, meta) => {
                  if (meta.filetype === "image") {
                    const input = document.createElement("input");
                    input.setAttribute("type", "file");
                    input.setAttribute("accept", "image/*");

                    input.onchange = function () {
                      const file = (this as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = function () {
                          const base64 = reader.result as string;
                          callback(base64, { title: file.name });
                        };
                        reader.readAsDataURL(file);
                      }
                    };

                    input.click();
                  }
                },
              }}
            />
          </Box>

          <TextField
            label="Interný komentár (neviditeľný pre študentov)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate("/dash/tasks")}>
              Zrušiť
            </Button>
            <Button variant="contained" onClick={handleSave}>
              {isEditMode ? "Uložiť" : "Pridať"}
            </Button>
          </Stack>
        </Stack>
        }
        {mode === "preview" &&
        <TaskPreview
          name={name}
          text={text}
          comment={comment}
          authorName={authorName}
        />
        }
      {mode === "categories" && id && <TaskCategoryTab taskId={parseInt(id)} />}
    </Container>
  );
};

export default TaskEditor;
