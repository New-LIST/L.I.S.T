import { Container, Typography, Button, Stack } from "@mui/material";
import { Editor } from "@tinymce/tinymce-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../services/api";
import { useNotification } from "../../../shared/components/NotificationContext";

import "tinymce/tinymce";
import "tinymce/themes/silver/theme";
import "tinymce/icons/default/icons";
import "tinymce/models/dom/model";

import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/code";
import "tinymce/plugins/image";
import "tinymce/plugins/table";

const CourseDescriptionEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCourse = async () => {
            try {
                const response = await api.get(`/courses/${id}`);
                setDescription(response.data.description ?? "");
            } catch {
                showNotification("Nepodarilo sa načítať popis kurzu.", "error");
                navigate("/dash/courses");
            } finally {
                setLoading(false);
            }
        };
        loadCourse();
    }, [id]);

    const handleSave = async () => {
        try {
            await api.put(`/courses/${id}/description`, { description });
            showNotification("Popis bol uložený.", "success");
            navigate("/dash/courses");
        } catch {
            showNotification("Chyba pri ukladaní.", "error");
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Úprava popisu kurzu
            </Typography>

            <Editor
                value={description}
                onEditorChange={(content) => setDescription(content)}
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


            <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
                <Button variant="outlined" onClick={() => navigate("/dash/courses")}>
                    Zrušiť
                </Button>
                <Button variant="contained" onClick={handleSave}>
                    Uložiť
                </Button>
            </Stack>
        </Container>
    );
};

export default CourseDescriptionEditor;
