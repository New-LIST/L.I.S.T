import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../../services/api";
import { Course } from "../../Courses/Types/Course";
import { TaskSetType } from "../../TaskSets/Types/TaskSetType";
import { useNotification } from "../../../shared/components/NotificationContext";
import { Assignment } from "../types/Assignment";

type Props = {
  onCreated: (id: number) => void;
  defaultValues?: Assignment;
};

const AssignmentFormInfo = ({ onCreated, defaultValues }: Props) => {
  // inicializácia stavu z defaultValues alebo prázdne
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [courseId, setCourseId] = useState<number | "">("");
  const [taskSetTypeId, setTaskSetTypeId] = useState<number | "">("");
  const [published, setPublished] = useState(defaultValues?.published ?? false);
  const [publishStartTime, setPublishStartTime] = useState<string | null>(
    defaultValues?.publishStartTime
      ? defaultValues.publishStartTime.slice(0, 16)
      : null
  );
  const [uploadEndTime, setUploadEndTime] = useState<string | null>(
    defaultValues?.uploadEndTime
      ? defaultValues.uploadEndTime.slice(0, 16)
      : null
  );
  const [pointsOverride, setPointsOverride] = useState<number | null>(
    defaultValues?.pointsOverride ?? null
  );
  const [instructions, setInstructions] = useState(
    defaultValues?.instructions ?? ""
  );
  const [internalComment, setInternalComment] = useState(
    defaultValues?.internalComment ?? ""
  );

  const [courses, setCourses] = useState<Course[]>([]);
  const [taskSetTypes, setTaskSetTypes] = useState<TaskSetType[]>([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    api.get<Course[]>("/courses").then((res) => setCourses(res.data));
  }, []);

  useEffect(() => {
    if (courses.length > 0 && defaultValues?.courseId) {
      setCourseId(defaultValues.courseId);
    }
  }, [courses, defaultValues?.courseId]);

  useEffect(() => {
    if (courseId) {
      api
        .get<TaskSetType[]>(`/course-task-set-rel/${courseId}/types`)
        .then((res) => setTaskSetTypes(res.data));
    } else {
      setTaskSetTypes([]);
    }
  }, [courseId]);

  useEffect(() => {
    if (taskSetTypes.length > 0 && defaultValues?.taskSetTypeId) {
      setTaskSetTypeId(defaultValues.taskSetTypeId);
    }
  }, [taskSetTypes, defaultValues?.taskSetTypeId]);

  const handleSubmit = async () => {
    if (!name || !courseId || !taskSetTypeId) {
      showNotification("Vyplň názov, kurz a typ zostavy", "error");
      return;
    }

    const dto = {
      name,
      courseId,
      taskSetTypeId,
      published,
      // Konvertujeme späť na ISO string bez Zulu znaku
      publishStartTime: publishStartTime
        ? new Date(publishStartTime).toISOString()
        : null,
      uploadEndTime: uploadEndTime
        ? new Date(uploadEndTime).toISOString()
        : null,
      pointsOverride,
      instructions: instructions.trim() ? instructions : null,
      internalComment: internalComment.trim() ? internalComment : null,
    };

    if (defaultValues?.id) {
      // PUT pre editáciu
      await api.put(`/assignments/${defaultValues.id}`, dto);
      showNotification("Zostava upravená", "success");
    } else {
      // POST pre vytvorenie
      const res = await api.post("/assignments", dto);
      showNotification("Zostava vytvorená", "success");
      onCreated(res.data.id);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} mx="auto" maxWidth={800}>
      <TextField
        label="Názov zadania"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <FormControl fullWidth required>
        <InputLabel>Kurz</InputLabel>
        <Select
          value={courseId ?? ""}
          onChange={(e) => setCourseId(Number(e.target.value))}
          label="Kurz"
        >
          {courses.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth required disabled={!courseId}>
        <InputLabel>Typ zostavy</InputLabel>
        <Select
          value={taskSetTypeId ?? ""}
          onChange={(e) => setTaskSetTypeId(Number(e.target.value))}
          label="Typ zostavy"
        >
          {taskSetTypes.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControlLabel
        control={
          <Checkbox
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
        }
        label="Zverejniť"
      />

      <TextField
        label="Dátum a čas publikovania"
        type="datetime-local"
        InputLabelProps={{ shrink: true }}
        value={publishStartTime ?? ""}
        onChange={(e) => setPublishStartTime(e.target.value)}
        fullWidth
      />

      <TextField
        label="Termín na odovzdanie"
        type="datetime-local"
        InputLabelProps={{ shrink: true }}
        value={uploadEndTime ?? ""}
        onChange={(e) => setUploadEndTime(e.target.value)}
        fullWidth
      />

      <TextField
        label="Počet bodov (voliteľné)"
        type="number"
        InputLabelProps={{ shrink: true }}
        value={pointsOverride ?? ""}
        onChange={(e) =>
          setPointsOverride(
            e.target.value === "" ? null : Number(e.target.value)
          )
        }
        fullWidth
      />

      <TextField
        label="Inštrukcie"
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        multiline
        rows={3}
        fullWidth
      />

      <TextField
        label="Interný komentár"
        value={internalComment}
        onChange={(e) => setInternalComment(e.target.value)}
        multiline
        rows={2}
        fullWidth
      />

      <Box textAlign="right" mt={2}>
        <Button variant="contained" onClick={handleSubmit}>
          {defaultValues?.id ? "Uložiť zmeny" : "Vytvoriť zadanie"}
        </Button>
      </Box>
    </Box>
  );
};

export default AssignmentFormInfo;
