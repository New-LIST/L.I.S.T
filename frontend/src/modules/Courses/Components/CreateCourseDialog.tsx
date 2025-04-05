import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Button,
  } from '@mui/material';
  import React from 'react';
  import { Period } from '../../Periods/Types/Period';
  
  type Props = {
    open: boolean;
    onClose: () => void;
    onCreate: (name: string, periodId: number | "") => void;
    name: string;
    setName: (value: string) => void;
    selectedPeriodId: number | "";
    setSelectedPeriodId: (id: number | "") => void;
    nameError: string | null;
    periods: Period[];
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
    capacityError: string | null;
    periodError: string | null;
    groupChangeError: string | null;
    enrollmentLimitError: string | null;

  };
  
  const CreateCourseDialog = ({
    open,
    onClose,
    onCreate,
    name,
    setName,
    selectedPeriodId,
    setSelectedPeriodId,
    nameError,
    periods,
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
    capacityError,
    periodError,
    groupChangeError,
    enrollmentLimitError,

  }: Props) => {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Pridať nový kurz</DialogTitle>
        <DialogContent
          dividers
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
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
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            error={!!periodError}
            helperText={periodError}
            fullWidth
            required
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
            required
            fullWidth
          />

          <TextField
            label="Termín na zmenu skupiny"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={groupChangeDeadline ?? ""}
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
            value={enrollmentLimit ?? ""}
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
            value={hiddenInList ? "true" : "false"}
            onChange={(e) => setHiddenInList(e.target.value === "true")}
            fullWidth
          >
            <MenuItem value="false">Nie</MenuItem>
            <MenuItem value="true">Áno</MenuItem>
          </TextField>

          <TextField
            select
            label="Automaticky prijať študentov"
            value={autoAcceptStudents ? "true" : "false"}
            onChange={(e) => setAutoAcceptStudents(e.target.value === "true")}
            fullWidth
          >
            <MenuItem value="false">Nie</MenuItem>
            <MenuItem value="true">Áno</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Zrušiť</Button>
          <Button
            onClick={() => {
              onCreate(name, selectedPeriodId);
            }}
            variant="contained"
          >
            Pridať
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default CreateCourseDialog;
  