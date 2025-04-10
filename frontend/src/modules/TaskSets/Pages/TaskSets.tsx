import { useParams } from "react-router-dom";
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
import api from "../../../services/api";
import { TaskSetType } from "../Types/TaskSetType";
import { CourseTaskSetRel } from "../Types/CourseTaskSetRel";
import { useNotification } from "../../../shared/components/NotificationContext";
import FormulaEditor from "../Components/FormulaEditor";


const TaskSets = () => {
  const { id } = useParams<{ id: string }>();
  const [types, setTypes] = useState<TaskSetType[]>([]);
  const [taskSets, setTaskSets] = useState<CourseTaskSetRel[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number>(0);
  const [formula, setFormula] = useState("");
  const [minPoints, setMinPoints] = useState<number | null>(null);
  const [uploadSolution, setUploadSolution] = useState(false);
  const [includeInTotal, setIncludeInTotal] = useState(true);
  const [virtual, setVirtual] = useState(false);
  const [minPointsInPercentage, setMinPointsInPercentage] = useState(false);

  const { showNotification } = useNotification();

  const fetchData = async () => {
    try {
      const [typesRes, relsRes] = await Promise.all([
        api.get("/task-set-types"),
        api.get(`/course-task-set-rel/by-course/${id}`),
      ]);
      setTypes(typesRes.data);
      setTaskSets(relsRes.data);
    } catch (err) {
      showNotification("Nepodarilo sa načítať dáta.", "error");
    }
  };

  const resetForm = async () => {
    setFormula("");
    setMinPoints(null);
    setUploadSolution(false);
    setIncludeInTotal(true);
    setVirtual(false);
    setMinPointsInPercentage(false);
    fetchData();
  };

  const handleCreate = async () => {
    try {
      await api.post("/course-task-set-rel", {
        courseId: Number(id),
        taskSetTypeId: selectedTypeId,
        uploadSolution,
        includeInTotal,
        virtual,
        formula: virtual ? formula : null,
        minPoints,
        minPointsInPercentage,
      });
      // reset stavu
      resetForm();
      showNotification("Zostava úspešne pridaná.", "success");
    } catch {
      showNotification("Nepodarilo sa pridať zostavu.", "error");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/course-task-set-rel/${id}`);
      fetchData();
      showNotification("Zostava bola odstránená.", "success");
    } catch {
      showNotification("Zmazanie zlyhalo.", "error");
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  return (
    <Container maxWidth={false} sx={{ mt: 5 }}>
      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Zostavy úloh pre kurz
        </Typography>

        <Box display="flex" flexDirection="column" gap={2} mb={4}>
          <TextField
            select
            label="Typ zostavy"
            value={selectedTypeId}
            onChange={(e) => setSelectedTypeId(Number(e.target.value))}
            fullWidth
          >
            {types.map((type) => (
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
    variables={["points"]}
    maxVariables={["maxPoints"]}
  />
)}

          <Button variant="contained" onClick={handleCreate}>
            Pridať zostavu
          </Button>
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
                          <IconButton onClick={() => handleDelete(rel.id)}>
                            <DeleteIcon />
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
    </Container>
  );
};

export default TaskSets;
