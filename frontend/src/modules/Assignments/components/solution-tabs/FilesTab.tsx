import React, { useEffect, useState } from 'react';
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  CircularProgress
} from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../../../../services/api';

interface FilesTabProps {
  assignmentId: number;
  solutionId: number;
}

const FilesTab: React.FC<FilesTabProps> = ({ assignmentId, solutionId }) => {
  const [versions, setVersions] = useState<number[]>([]);
  const [version, setVersion]   = useState<number | null>(null);

  const [files, setFiles]       = useState<string[]>([]);
  const [file, setFile]         = useState<string>('');

  const [code, setCode]         = useState<string>('');
  const [loading, setLoading]   = useState({
    versions: false,
    files: false,
    code: false
  });

  // A) Načteme seznam verzí (čísla)
  useEffect(() => {
    setLoading(l => ({ ...l, versions: true }));
    api.get<{ version: number }[]>(`/assignments/${assignmentId}/solutions/${solutionId}/versions`)
      .then(res => {
        const nums = res.data.map(v => v.version);
        setVersions(nums);
        if (nums.length) setVersion(nums[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(l => ({ ...l, versions: false })));
  }, [assignmentId, solutionId]);

  // B) Po výběru `version` načteme soubory
  useEffect(() => {
    if (version == null) return;
    setLoading(l => ({ ...l, files: true }));
    api.get<string[]>(`/assignments/${assignmentId}/solutions/${solutionId}/versions/${version}/files`)
      .then(res => {
        setFiles(res.data);
        if (res.data.length) setFile(res.data[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(l => ({ ...l, files: false })));
  }, [assignmentId, solutionId, version]);

  // C) Po výběru `file` načteme obsah
  useEffect(() => {
    if (version == null || !file) return;
    setLoading(l => ({ ...l, code: true }));
    api.get<string>(
      `/assignments/${assignmentId}/solutions/${solutionId}/versions/${version}/files/${encodeURIComponent(file)}`,
      { responseType: 'text' }
    )
      .then(res => setCode(res.data))
      .catch(console.error)
      .finally(() => setLoading(l => ({ ...l, code: false })));
  }, [assignmentId, solutionId, version, file]);

  return (
    <Box display="grid" gap={2}>
      {/* select verzí */}
      <FormControl fullWidth>
        <InputLabel>Verzia</InputLabel>
        <Select
          value={version ?? ''}
          label="Verzia"
          onChange={e => setVersion(Number(e.target.value))}
        >
          {loading.versions
            ? <MenuItem value=""><CircularProgress size={20}/></MenuItem>
            : versions.map(v => (
                <MenuItem key={v} value={v}>{v}</MenuItem>
              ))
          }
        </Select>
      </FormControl>

      {/* select souborů */}
      <FormControl fullWidth>
        <InputLabel>Súbor</InputLabel>
        <Select
          value={file}
          label="Súbor"
          onChange={e => setFile(e.target.value as string)}
        >
          {loading.files
            ? <MenuItem value=""><CircularProgress size={20}/></MenuItem>
            : files.map(f => (
                <MenuItem key={f} value={f}>{f}</MenuItem>
              ))
          }
        </Select>
      </FormControl>

      {/* zobrazení kódu */}
      <Paper variant="outlined" sx={{ p:1, height:400, overflow:'auto' }}>
        {loading.code
          ? <Box textAlign="center"><CircularProgress/></Box>
          : (
            <SyntaxHighlighter
              language="cpp"
              style={materialLight}
              showLineNumbers
              wrapLines
            >
              {code}
            </SyntaxHighlighter>
          )
        }
      </Paper>
    </Box>
  );
};

export default FilesTab;
