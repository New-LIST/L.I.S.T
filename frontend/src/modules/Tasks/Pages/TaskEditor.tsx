import {Container, Typography, Box, TextField, Stack, Button, CircularProgress, Tabs, Tab} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import 'tinymce/tinymce'; // základ
import 'tinymce/themes/silver/theme'; // ← NEVYNECHAŤ
import 'tinymce/icons/default/icons'; // ← NEVYNECHAŤ
import 'tinymce/models/dom/model'; // ← TOTO JE NOVÉ – fix na "nothing rendered" problém

// pluginy ktoré použiješ
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/code';

import api from '../../../services/api';
import { useNotification } from '../../../shared/components/NotificationContext';
import TaskPreview from '../Components/TaskPreview';
const TaskEditor = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const { showNotification } = useNotification();

    const [mode, setMode] = useState<'edit' | 'preview'>('edit');

    const [name, setName] = useState('');
    const [text, setText] = useState('');
    const [comment, setComment] = useState('');
    const [authorName, setAuthorName] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(isEditMode);


    useEffect(() => {
        if (!isEditMode) return;

        const loadTask = async () => {
            try {
                const response = await api.get(`/tasks/${id}`);
                const task = response.data;
                setName(task.name);
                setText(task.text ?? '');
                setAuthorName(task.authorFullname ?? 'unknown');
                setComment(task.internalComment ?? '');
            } catch {
                showNotification('Nepodarilo sa načítať úlohu.', 'error');
                navigate('/dash/tasks');
            } finally {
                setLoading(false);
            }
        };

        loadTask();
    }, [id]);

    const handleSave = async () => {
        if (!name.trim()) return;

        try {
            if (isEditMode) {
                await api.put(`/tasks/${id}`, {
                    name,
                    text,
                    internalComment: comment,
                });
                showNotification('Úloha bola upravená.', 'success');
            } else {
                await api.post('/tasks', {
                    name,
                    text,
                    internalComment: comment,
                });
                showNotification('Úloha bola vytvorená.', 'success');
            }

            navigate('/dash/tasks');
        } catch {
            showNotification('Chyba pri ukladaní úlohy.', 'error');
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
            </Tabs>

            {mode === 'edit' ? (
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
                                height: 300,
                                menubar: false,
                                plugins: ['lists', 'link', 'code'],
                                toolbar: 'undo redo | bold italic | bullist numlist | link | code',
                                content_style: 'body { font-family:Roboto,Arial,sans-serif; font-size:14px }',
                                skin_url: '/tinymce/skins/ui/oxide',
                                content_css: '/tinymce/skins/content/default/content.css',
                                license_key: 'gpl',
                                model: 'dom',
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
                        <Button variant="outlined" onClick={() => navigate('/dash/tasks')}>
                            Zrušiť
                        </Button>
                        <Button variant="contained" onClick={handleSave}>
                            {isEditMode ? 'Uložiť' : 'Pridať'}
                        </Button>
                    </Stack>
                </Stack>
            ) : (
                <TaskPreview name={name} text={text} comment={comment} authorName = {authorName} />
            )}
        </Container>
    );
};

export default TaskEditor;
