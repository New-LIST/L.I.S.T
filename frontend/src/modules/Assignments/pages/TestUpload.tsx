// src/modules/assignments/components/TestUpload.tsx

import React, { useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import api from '../../../services/api';

const TestUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Uloží vybraný súbor do stavu
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Pošle vybraný súbor na backend
  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post<{ id: number; version: number; storageKey: string }>(
        '/assignments/1/solutions/versions',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      alert(`Uploaded version ${res.data.version}`);
      setSelectedFile(null); // vyčistí výber po úspechu
    } catch (err) {
      console.error('Upload error', err);
      alert('Upload failed');
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Test Assignment 1 Upload
      </Typography>
      <Box display="flex" alignItems="center" gap={2}>
        <Button variant="contained" component="label">
          Vybrať ZIP
          <input
            type="file"
            hidden
            onChange={handleFileSelect}
          />
        </Button>

        {selectedFile && (
          <Typography variant="body1">{selectedFile.name}</Typography>
        )}

        <Button
          variant="contained"
          color="primary"
          disabled={!selectedFile}
          onClick={handleUpload}
        >
          Odovzdať
        </Button>
      </Box>
    </Box>
  );
};

export default TestUpload;
