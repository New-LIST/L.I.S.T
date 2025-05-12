import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import api from "../../../services/api";
import { TaskSetType } from "../Types/TaskSetType";
import { CourseTaskSetRel } from "../Types/CourseTaskSetRel";
import { useNotification } from "../../../shared/components/NotificationContext";
import FormulaEditor from "../Components/FormulaEditor";
import { validateFormula } from "../Utils/validateFormula";
import ConfirmDeleteTaskSetDialog from "../Components/ConfirmDeleteTaskSetDialog";

const TaskSets = () => {
  const { id } = useParams<{ id: string }>();
  const [types, setTypes] = useState<TaskSetType[]>([]);
  const [taskSets, setTaskSets] = useState<CourseTaskSetRel[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [formula, setFormula] = useState("");
  const [minPoints, setMinPoints] = useState<number | null>(null);
  const [uploadSolution, setUploadSolution] = useState(false);
  const [includeInTotal, setIncludeInTotal] = useState(true);
  const [virtual, setVirtual] = useState(false);
  const [minPointsInPercentage, setMinPointsInPercentage] = useState(false);
  const [variables, setVariables] = useState<string[]>([]);
  const [taskTypeError, setTaskTypeError] = useState<string | null>(null);
  const [formulaError, setFormulaError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [affectedCount, setAffectedCount] = useState<number>(0);

  const location = useLocation();
  const courseName = location.state?.courseName ?? '';
  const periodName = location.state?.periodName ?? '';

  const usedTypeIds = new Set(taskSets.map((rel) => rel.taskSetTypeId));
  const availableTypes = types.filter(
    (type) => !usedTypeIds.has(type.id) || type.id === selectedTypeId
  );

  const { showNotification } = useNotification();

  const fetchData = async () => {
    try {
      const [typesRes, relsRes, identifiersRes] = await Promise.all([
        api.get("/task-set-types"),
        api.get(`/course-task-set-rel/by-course/${id}`),
        api.get(`/task-set-types/identifiers/by-course/${id}`),
      ]);
      setTypes(typesRes.data);
      setTaskSets(relsRes.data);
      setVariables(identifiersRes.data);
      const usedTypeIds = new Set(taskSets.map((rel) => rel.taskSetTypeId));
      const availableTypes = types.filter(
        (type) => !usedTypeIds.has(type.id) || type.id === selectedTypeId
      );
    } catch (err) {
      showNotification("Nepodarilo sa načítať dáta.", "error");
    }
  };

  const resetForm = async () => {
    setFormula("");
    setSelectedTypeId(null);
    setMinPoints(null);
    setUploadSolution(false);
    setIncludeInTotal(true);
    setVirtual(false);
    setMinPointsInPercentage(false);
    setTaskTypeError(null);
    setFormulaError(null);
    setEditingId(null);
    setOpenConfirmDelete(false);
    setDeletingId(null);
    setAffectedCount(0);
  };

  const askDelete = async (id: number) => {
    try {
      const res = await api.get(`/course-task-set-rel/${id}/dependent-count`);
      setAffectedCount(res.data);
      setDeletingId(id);
      setOpenConfirmDelete(true);
    } catch {
      showNotification("Nepodarilo sa načítať závislosti.", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/course-task-set-rel/${deletingId}`);
      resetForm();
      fetchData();
      showNotification("Zostava bola odstránená.", "success");
    } catch {
      showNotification("Zmazanie zlyhalo.", "error");
    }
  };

  const handleSubmit = async () => {
    setTaskTypeError(null);
    let hasError = false;

    if (selectedTypeId === null) {
      setTaskTypeError("Musíš vybrať typ zostavy");
      hasError = true;
    }

    if (virtual) {
      const result = validateFormula(formula, variables);
      if (!result.valid) {
        setFormulaError(result.error ?? null);
        hasError = true;
      }
    }

    if (hasError) return;

    try {
      const payload = {
        id: editingId ?? 0,
        courseId: Number(id),
        taskSetTypeId: selectedTypeId,
        uploadSolution,
        includeInTotal,
        virtual,
        formula: virtual ? formula : null,
        minPoints,
        minPointsInPercentage,
      };

      if (editingId !== null) {
        await api.put(`/course-task-set-rel/${editingId}`, payload);
        showNotification("Zostava bola upravená.", "success");
      } else {
        await api.post("/course-task-set-rel", payload);
        showNotification("Zostava úspešne pridaná.", "success");
      }

      resetForm();
      fetchData();
    } catch {
      showNotification("Operácia zlyhala.", "error");
    }
  };

  const handleEdit = (rel: CourseTaskSetRel) => {
    setEditingId(rel.id);
    setSelectedTypeId(rel.taskSetTypeId);
    setFormula(rel.formula ?? "");
    setMinPoints(rel.minPoints ?? null);
    setUploadSolution(rel.uploadSolution);
    setIncludeInTotal(rel.includeInTotal);
    setVirtual(rel.virtual);
    setMinPointsInPercentage(rel.minPointsInPercentage);
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  return (
    <Container maxWidth={false} sx={{ mt: 5 }}>
      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Zostavy úloh pre kurz – {courseName} ({periodName})
        </Typography>

        <Box display="flex" flexDirection="column" gap={2} mb={4}>
          <TextField
            select
            label="Typ zostavy"
            value={selectedTypeId ?? ""}
            onChange={(e) =>
              setSelectedTypeId(
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            fullWidth
            error={!!taskTypeError}
            helperText={taskTypeError}
          >
            {availableTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Minimálne body"
            type="number"
            value={minPoints ?? ""}
            onChange={(e) =>
              setMinPoints(
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            fullWidth
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={minPointsInPercentage}
                onChange={(e) => setMinPointsInPercentage(e.target.checked)}
              />
            }
            label="Minimum v percentách"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={uploadSolution}
                onChange={(e) => setUploadSolution(e.target.checked)}
              />
            }
            label="Umožniť odovzdanie riešení"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={includeInTotal}
                onChange={(e) => setIncludeInTotal(e.target.checked)}
              />
            }
            label="Započítať do celkového hodnotenia"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={virtual}
                onChange={(e) => setVirtual(e.target.checked)}
              />
            }
            label="Virtuálna zostava (vzorec)"
          />

          {virtual && (
            <FormulaEditor
              value={formula}
              onChange={setFormula}
              variables={variables}
              error={formulaError}
            />
          )}

          <Button variant="contained" onClick={handleSubmit}>
            {editingId !== null ? "Zmeň zostavu" : "Pridať zostavu"}
          </Button>
          {editingId && (
            <Button variant="outlined" onClick={resetForm} sx={{ ml: 2 }}>
              Zrušiť
            </Button>
          )}
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Existujúce zostavy
            </Typography>
            <Box sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Typ zostavy úloh</TableCell>
                    <TableCell>Identifikátor</TableCell>
                    <TableCell>Povoliť upload riešení</TableCell>
                    <TableCell>Min body</TableCell>
                    <TableCell>Započítavať body</TableCell>
                    <TableCell>Vzorec</TableCell>
                    <TableCell>Akcie</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {taskSets.map((rel) => {
                    const type = types.find((t) => t.id === rel.taskSetTypeId);
                    return (
                      <TableRow key={rel.id}>
                        <TableCell>{type?.name || "-"}</TableCell>
                        <TableCell>{type?.identifier || "-"}</TableCell>
                        <TableCell>
                          {rel.uploadSolution ? "Áno" : "Nie"}
                        </TableCell>
                        <TableCell>
                          {rel.minPoints !== null && rel.minPoints !== undefined
                            ? rel.minPointsInPercentage
                              ? `${rel.minPoints}%`
                              : rel.minPoints
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {rel.includeInTotal ? "Áno" : "Nie"}
                        </TableCell>
                        <TableCell>{rel.formula || "-"}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => askDelete(rel.id)}>
                            <DeleteIcon />
                          </IconButton>
                          <IconButton onClick={() => handleEdit(rel)}>
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <ConfirmDeleteTaskSetDialog
        open={openConfirmDelete}
        onClose={() => setOpenConfirmDelete(false)}
        onConfirm={handleDelete}
        affectedCount={affectedCount}
      />
    </Container>
  );
};

export default TaskSets;
