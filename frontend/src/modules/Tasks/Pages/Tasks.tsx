import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { Task } from "../Types/Task";
import api from "../../../services/api";
import { useNotification } from "../../../shared/components/NotificationContext";
import ConfirmDeleteDialog from "../Components/ConfirmDeleteTaskDialog.tsx";
import { useNavigate } from "react-router-dom";
import TaskFilterBar from "../Components/TaskFilterBar";
import { CategoryFilterBlock } from "../Types/CategoryFilterBlock";

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showNotification } = useNotification();
  const [filters, setFilters] = useState({
    name: "",
    author: "",
    comment: "",
    categoryBlocks: [] as CategoryFilterBlock[],
  });

  const navigate = useNavigate();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | undefined> = {
        name: filters.name,
        author: filters.author,
      };

      if (filters.categoryBlocks.length > 0) {
        params.categoryFilter = filters.categoryBlocks
          .map((b) => {
            const hasInclude = b.include.length > 0;
            const hasExclude = b.exclude.length > 0;

            if (!hasInclude && !hasExclude) return null;

            let part = hasInclude ? b.include.join(",") : "";
            if (hasExclude) part += `;!${b.exclude.join(",")}`;
            return part;
          })
          .filter(Boolean)
          .join("|");
      }

      const response = await api.get("/tasks/filter", { params });
      setTasks(response.data);
    } catch {
      showNotification("Nepodarilo sa načítať úlohy.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      await api.delete(`/tasks/${taskToDelete.id}`);
      showNotification("Úloha bola vymazaná.", "success");
      fetchTasks();
    } catch {
      showNotification("Chyba pri vymazaní úlohy.", "error");
    } finally {
      setConfirmOpen(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Úlohy
      </Typography>
      <Button
        variant="contained"
        sx={{ mb: 2 }}
        onClick={() => navigate("/dash/tasks/new")}
      >
        Pridať úlohu
      </Button>
      <TaskFilterBar onFilterChange={(f) => setFilters(f)} />
      <Card>
        <CardContent>
          {loading ? (
            <CircularProgress />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Názov</TableCell>
                  <TableCell>Autor</TableCell>
                  <TableCell>Vnútorný komentár</TableCell>
                  <TableCell>Akcie</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.name}</TableCell>
                    <TableCell>{task.authorFullname}</TableCell>
                    <TableCell>{task.internalComment}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => navigate(`/dash/tasks/${task.id}/edit`)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          setTaskToDelete(task);
                          setConfirmOpen(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {taskToDelete && (
        <ConfirmDeleteDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
          itemName={taskToDelete.name}
        />
      )}
    </Container>
  );
};

export default Tasks;
