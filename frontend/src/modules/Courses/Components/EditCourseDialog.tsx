import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button, Typography,
} from '@mui/material';
  import React from 'react';
  import { Period } from '../../Periods/Types/Period';
  
  type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: () => void;
  
    name: string;
    setName: (value: string) => void;
    selectedPeriodId: number | '';
    setSelectedPeriodId: (id: number | '') => void;
    capacity: number;
    setCapacity: (value: number) => void;
    groupChangeDeadline: string | null;
    setGroupChangeDeadline: (value: string | null) => void;
    enrollmentLimit: string | null;
    setEnrollmentLimit: (value: string | null) => void;
    hiddenInList: boolean;
    setHiddenInList: (value: boolean) => void;
    autoAcceptStudents: boolean;
    setAutoAcceptStudents: (value: boolean) => void;
    periods: Period[];
  
    nameError: string | null;
    capacityError: string | null;
    periodError: string | null;
    groupChangeError: string | null;
    enrollmentLimitError: string | null;

    imageFile: File | null;
    setImageFile: (file: File | null) => void;
    
  };
  
  const EditCourseDialog = ({
    open,
    onClose,
    onSubmit,
    name,
    setName,
    selectedPeriodId,
    setSelectedPeriodId,
    capacity,
    setCapacity,
    groupChangeDeadline,
    setGroupChangeDeadline,
    enrollmentLimit,
    setEnrollmentLimit,
    hiddenInList,
    setHiddenInList,
    autoAcceptStudents,
    setAutoAcceptStudents,
    periods,
    nameError,
    periodError,
    capacityError,
    groupChangeError,
    enrollmentLimitError,
    imageFile,
    setImageFile,
  }: Props) => {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Upraviť kurz</DialogTitle>
        <DialogContent
          dividers
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
        >
          <TextField
            label="Názov kurzu"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!nameError}
            helperText={nameError}
            fullWidth
          />
          <TextField
            select
            label="Obdobie"
            value={selectedPeriodId}
            onChange={(e) =>
              setSelectedPeriodId(
                e.target.value === '' ? '' : Number(e.target.value)
              )
            }
            error={!!periodError}
            helperText={periodError}
            fullWidth
          >
            {periods.map((period) => (
              <MenuItem key={period.id} value={period.id}>
                {period.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Kapacita"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            error={!!capacityError}
            helperText={capacityError}
            fullWidth
          />
          <TextField
            label="Termín na zmenu skupiny"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={groupChangeDeadline ?? ''}
            onChange={(e) =>
              setGroupChangeDeadline(e.target.value ? e.target.value : null)
            }
            error={!!groupChangeError}
            helperText={groupChangeError}
            fullWidth
          />
          <TextField
            label="Časový limit zápisu na kurz"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={enrollmentLimit ?? ''}
            onChange={(e) =>
              setEnrollmentLimit(e.target.value ? e.target.value : null)
            }
            error={!!enrollmentLimitError}
            helperText={enrollmentLimitError}
            fullWidth
          />
          <TextField
            select
            label="Skryť v zozname"
            value={hiddenInList ? 'true' : 'false'}
            onChange={(e) => setHiddenInList(e.target.value === 'true')}
            fullWidth
          >
            <MenuItem value="false">Nie</MenuItem>
            <MenuItem value="true">Áno</MenuItem>
          </TextField>
          <TextField
            select
            label="Automaticky prijať študentov"
            value={autoAcceptStudents ? 'true' : 'false'}
            onChange={(e) => setAutoAcceptStudents(e.target.value === 'true')}
            fullWidth
          >
            <MenuItem value="false">Nie</MenuItem>
            <MenuItem value="true">Áno</MenuItem>
          </TextField>
          <Button variant="outlined" component="label">
            Nahrať obrázok (titulka)
            <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setImageFile(file);
                }}
            />
          </Button>
          {imageFile && (
              <Typography variant="body2" color="text.secondary">
                {imageFile.name}
              </Typography>
          )}

        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Zrušiť</Button>
          <Button onClick={onSubmit} variant="contained">
            Uložiť
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default EditCourseDialog;
  