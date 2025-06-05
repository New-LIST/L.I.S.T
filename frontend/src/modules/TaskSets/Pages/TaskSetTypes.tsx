import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import {
  Card,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Container,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  CardContent,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNotification } from "../../../shared/components/NotificationContext";
import { TaskSetType } from "../Types/TaskSetType";
import ConfirmDeleteTaskSetTypeDialog from "../Components/ConfirmDeleteTaskSetTypeDialog";
import EditTaskSetTypeDialog from "../Components/EditTaskSetTypeDialog";
import CreateTaskSetTypeDialog from "../Components/CreateTaskSetTypeDialog";

const TaskSetTypes = () => {
  const [taskSetTypes, setTaskSetTypes] = useState<TaskSetType[]>([]);
  const [newName, setNewName] = useState("");
  const [newIdentifier, setNewIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [taskSetTypeId, setTaskSetTypeId] = useState<number | null>(null);

  const fetchTaskSetTypes = async () => {
    setLoading(true);
    try {
      const response = await api.get("/task-set-types");
      setTaskSetTypes(response.data);
    } catch (err) {
      console.error(err);
      showNotification("Nepodarilo sa načítať typy zostáv.", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewName("");
    setNewIdentifier("");
    setOpenCreateDialog(false);
    setNameError(null);
    setOpenConfirmDelete(false);
    setOpenEditDialog(false);
    setTaskSetTypeId(null);
  };

  const handleCreate = async () => {
    const trimmed = newName.trim();
    setNameError(null);
    if (!trimmed) {
      setNameError("Názov kurzu nemôže byť prázdny.");
      return;
    }

    try {
      await api.post("/task-set-types", {
        name: newName,
        identifier: newIdentifier.trim() === "" ? null : newIdentifier.trim(),
      });
      resetForm();
      fetchTaskSetTypes();
      showNotification("Typ zostavy bol úspešne pridaný.", "success");
    } catch (err) {
      console.error(err);
      showNotification("nepodarilo sa pridať typ zostavy.", "error");
    }
  };

  const handleEdit = async () => {
    setNameError(null);

    if (!newName.trim()) {
      setNameError("Názov typu nemôže byť prázdny.");
      return;
    }

    try {
      await api.put(`/task-set-types/${taskSetTypeId}`, {
        id: taskSetTypeId,
        name: newName,
        identifier: newIdentifier.trim() === "" ? null : newIdentifier.trim(),
      });

      resetForm();
      fetchTaskSetTypes();
      showNotification("Typ zostavy bol upravený.", "success");
    } catch (err) {
      console.error(err);
      showNotification("Nepodarilo sa upraviť typ zostavy.", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/task-set-types/${taskSetTypeId}`);
      resetForm();
      fetchTaskSetTypes();
      showNotification("Typ zostavy bol vymazaný.", "success");
    } catch (err) {
      console.error(err);
      showNotification("Nepodarilo sa vymazať typ zostavy.", "error");
    }
  };

  useEffect(() => {
    fetchTaskSetTypes();
  }, []);

  //const handleCreate = async

  return (
    <Container maxWidth={"lg"} sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Typy zostáv
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpenCreateDialog(true)}
        sx={{ mb: 2 }}
      >
        Pridať nový typ zostavy
      </Button>
      <Card>
        <CardContent>
          {loading ? (
            <CircularProgress />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Názov typu</TableCell>
                  <TableCell>Identifikator</TableCell>
                  <TableCell align="right">Akcie</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {taskSetTypes.map((taskSetType) => (
                  <TableRow key={taskSetType.id}>
                    <TableCell>{taskSetType.name}</TableCell>
                    <TableCell>{taskSetType.identifier || "-"}</TableCell>
                    <TableCell align="right">
                      <Box>
                        <IconButton
                          onClick={() => {
                            setTaskSetTypeId(taskSetType.id);
                            setNewName(taskSetType.name);
                            setNewIdentifier(taskSetType.identifier ?? "");
                            setOpenEditDialog(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            setTaskSetTypeId(taskSetType.id);
                            setNewName(taskSetType.name);
                            setOpenConfirmDelete(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <CreateTaskSetTypeDialog
        open={openCreateDialog}
        onClose={resetForm}
        onSubmit={handleCreate}
        name={newName}
        setName={setNewName}
        identifier={newIdentifier}
        setIdentifier={setNewIdentifier}
        nameError={nameError}
      />
      <EditTaskSetTypeDialog
        open={openEditDialog}
        onClose={resetForm}
        onSubmit={handleEdit}
        currentName={newName}
        setCurrentName={setNewName}
        currentIdentifier={newIdentifier}
        setCurrentIdentifier={setNewIdentifier}
        error={nameError}
      />
      <ConfirmDeleteTaskSetTypeDialog
        open={openConfirmDelete}
        onClose={resetForm}
        onSubmit={handleDelete}
        typeName={newName}
      />
    </Container>
  );
};

export default TaskSetTypes;