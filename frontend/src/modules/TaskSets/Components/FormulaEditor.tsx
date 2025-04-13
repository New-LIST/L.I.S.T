import { Box, Button, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  variables: string[];
  error: string | null;

};

const FormulaEditor = ({ value, onChange, variables, error }: Props) => {
  const [formula, setFormula] = useState(value);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const insert = (text: string) => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? formula.length;
    const end = el.selectionEnd ?? formula.length;

    const newFormula = formula.slice(0, start) + text + formula.slice(end);
    setFormula(newFormula);
    onChange(newFormula);

    // Nastavíme kurzor za vložený text
    setTimeout(() => {
      const pos = start + text.length;
      el.setSelectionRange(pos, pos);
      el.focus();
    }, 0);
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Editor vzorca
      </Typography>

      <Stack direction="row" spacing={1} mb={2}>
        <Button variant="outlined" onClick={() => insert("(_ + _)")}>+</Button>
        <Button variant="outlined" onClick={() => insert("(_ - _)")}>-</Button>
        <Button variant="outlined" onClick={() => insert("(_ * _)")}>*</Button>
        <Button variant="outlined" onClick={() => insert("(_ / _)")}>/</Button>
      </Stack>

      <Stack direction="row" spacing={2} mb={2}>
        <Select
          displayEmpty
          value=""
          onChange={(e) => insert(`~${e.target.value}`)}
          size="small"
        >
          <MenuItem value="" disabled>Premenná</MenuItem>
          {variables.map((v) => (
            <MenuItem key={v} value={v}>{v}</MenuItem>
          ))}
        </Select>

        <Select
          displayEmpty
          value=""
          onChange={(e) => insert(`$${e.target.value}`)}
          size="small"
        >
          <MenuItem value="" disabled>Max premenná</MenuItem>
          {variables.map((v) => (
            <MenuItem key={v} value={v}>{v}</MenuItem>
          ))}
        </Select>
      </Stack>

      <TextField
        label="Výsledný vzorec"
        inputRef={inputRef}
        value={formula}
        onChange={(e) => {
          setFormula(e.target.value);
          onChange(e.target.value);
        }}
        error={!!error}
        helperText={error}
        fullWidth
        multiline
        minRows={2}
      />
    </Box>
  );
};

export default FormulaEditor;
