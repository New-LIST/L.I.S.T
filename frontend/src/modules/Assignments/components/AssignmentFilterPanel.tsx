import {
  Box, TextField, Button, MenuItem, Typography, IconButton, Select, FormControl, InputLabel
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAllCourses } from "../hooks/useAllCourses";
import { useAllTeachers } from "../hooks/useAllTeachers";
import { useState } from "react";

type Props = {
  onClose: () => void;
  onFilter: (filters: { name?: string; courseId?: number; userId?: number }) => void;
};

const AssignmentFilterPanel = ({ onClose, onFilter }: Props) => {
  const courses = useAllCourses();
  const teachers = useAllTeachers();

  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState<number | undefined>(undefined);
  const [userId, setUserId] = useState<number | undefined>(undefined);

  const applyFilter = () => {
    onFilter({
      name: name || undefined,
      courseId,
      userId
    });
    onClose();
  };

  return (
    <Box p={2} border={1} borderColor="grey.300" borderRadius={2} mb={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Filtrovanie</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </Box>

      <Box display="flex" flexDirection="column" gap={2} mt={2}>
        <TextField
          label="Názov zadania"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel id="course-select-label">Kurz</InputLabel>
          <Select
            labelId="course-select-label"
            value={courseId ?? ""}
            label="Kurz"
            onChange={(e) => setCourseId(Number(e.target.value) || undefined)}
          >
            <MenuItem value="">– Všetky –</MenuItem>
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>{course.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="teacher-select-label">Učiteľ</InputLabel>
          <Select
            labelId="teacher-select-label"
            value={userId ?? ""}
            label="Učiteľ"
            onChange={(e) => setUserId(Number(e.target.value) || undefined)}
          >
            <MenuItem value="">– Všetci –</MenuItem>
            {teachers.map((teacher) => (
              <MenuItem key={teacher.id} value={teacher.id}>{teacher.email}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box textAlign="right">
          <Button variant="contained" onClick={applyFilter}>Použiť filter</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AssignmentFilterPanel;
