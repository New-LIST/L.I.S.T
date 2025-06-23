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
  Box,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Collapse,
  TableFooter,
  TablePagination
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { Task } from "../Types/Task";
import api from "../../../services/api";
import { useNotification } from "../../../shared/components/NotificationContext";
import ConfirmDeleteTaskDialog from "../Components/ConfirmDeleteTaskDialog.tsx";
import { useNavigate } from "react-router-dom";
import TaskFilterBar from "../Components/TaskFilterBar";
import { CategoryFilterBlock } from "../Types/CategoryFilterBlock";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import ConfirmDuplicateTaskDialog from "../Components/ConfirmDuplicateTaskDialog.tsx";

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showNotification } = useNotification();
  const [filters, setFilters] = useState({
    name: "",
    author: "",
    categoryBlocks: [] as CategoryFilterBlock[],
  });
  const [filterEnabled, setFilterEnabled] = useState(false);

  const [taskToDuplicate, setTaskToDuplicate] = useState<Task | null>(null);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | undefined> = {
        name: filters.name,
        author: filters.author,
      };

      if (filterEnabled && filters.categoryBlocks.length > 0) {
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

  const handleDuplicate = async (taskId: number) => {
    try {
      await api.post(`/tasks/${taskId}/duplicate`);
      showNotification("Úloha bola duplikovaná.", "success");
      fetchTasks();
    } catch (err) {
      console.error(err);
      showNotification("Nepodarilo sa duplikovať úlohu.", "error");
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

  const toggleGroup = (groupId: number) => {
    setExpandedGroups((prev) =>
        prev.includes(groupId)
            ? prev.filter((id) => id !== groupId)
            : [...prev, groupId]
    );
  };

  useEffect(() => {
    fetchTasks();
  }, [filters, filterEnabled]);

  const groupedTasks = tasks.reduce((acc, task) => {
    const rootId = task.parentTaskId ?? task.id;
    if (!acc[rootId]) acc[rootId] = [];
    acc[rootId].push(task);
    return acc;
  }, {} as Record<number, Task[]>);

  const rootTaskIds = Object.keys(groupedTasks)
      .map((id) => parseInt(id))
      .filter((id) => groupedTasks[id].some((t) => t.id === id || !t.parentTaskId));

  return (
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Typography sx={{ mb: 1 }} variant="h4">Úlohy</Typography>
        <Button variant="contained" onClick={() => navigate("/dash/tasks/new")}>Pridať úlohu</Button>
        <Box mb={2}>
          <FormControlLabel
              control={<Checkbox checked={filterEnabled} onChange={(e) => setFilterEnabled(e.target.checked)} />}
              label="Filtrovanie"
          />
        </Box>

        {filterEnabled && (
            <Box mb={3}>
              <TaskFilterBar onFilterChange={(f) => setFilters(f)} />
            </Box>
        )}

        <Card>
          <CardContent>
            {loading ? (
                <CircularProgress />
            ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Názov</TableCell>
                      <TableCell>Autor</TableCell>
                      <TableCell>Vnútorný komentár</TableCell>
                      <TableCell>Akcie</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rootTaskIds.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((rootId) => {
                      const group = groupedTasks[rootId];
                      const root = group.find((t) => t.id === rootId) ?? group[0];
                      const variants = group.filter((t) => t.id !== root.id);
                      return (
                          <React.Fragment key={root.id}>
                            <TableRow>
                              <TableCell sx={{ py: 0.2 }}>
                                {root.name}
                                {variants.length > 0 && (
                                    <IconButton size="small" onClick={() => toggleGroup(root.id)}>
                                      {expandedGroups.includes(root.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </IconButton>
                                )}
                              </TableCell>
                              <TableCell sx={{ py: 0.2 }}>{root.authorFullname}</TableCell>
                              <TableCell sx={{ py: 0.2 }}>{root.internalComment}</TableCell>
                              <TableCell sx={{ py: 0.2 }}>
                                <Tooltip title="Upraviť úlohu" placement="top">
                                  <IconButton onClick={() => navigate(`/dash/tasks/${root.id}/edit`)}>
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Duplikovať úlohu" placement="top">
                                  <IconButton onClick={() => {
                                    setTaskToDuplicate(root);
                                    setDuplicateDialogOpen(true);
                                  }}>
                                    <CopyAllIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Vymazať úlohu" placement="top">
                                  <IconButton onClick={() => {
                                    setTaskToDelete(root);
                                    setConfirmOpen(true);
                                  }}>
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                            {variants.length > 0 && (
                                <TableRow
                                    sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
                                >
                                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                                    <Collapse in={expandedGroups.includes(root.id)} timeout="auto" unmountOnExit>
                                      <Table size="small">
                                        <TableBody>
                                          {variants.map((variant) => (
                                              <TableRow key={variant.id}>
                                                <TableCell sx={{ py: 0.2 }}>{variant.name}</TableCell>
                                                <TableCell sx={{ py: 0.2 }}>{variant.authorFullname}</TableCell>
                                                <TableCell sx={{ py: 0.2 }}>{variant.internalComment}</TableCell>
                                                <TableCell sx={{ py: 0.2 }}>
                                                  <Tooltip title="Upraviť úlohu" placement="top">
                                                    <IconButton onClick={() => navigate(`/dash/tasks/${variant.id}/edit`)}>
                                                      <EditIcon />
                                                    </IconButton>
                                                  </Tooltip>
                                                  <Tooltip title="Duplikovať úlohu" placement="top">
                                                    <IconButton onClick={() => {
                                                      setTaskToDuplicate(variant);
                                                      setDuplicateDialogOpen(true);
                                                    }}>
                                                      <CopyAllIcon />
                                                    </IconButton>
                                                  </Tooltip>
                                                  <Tooltip title="Vymazať úlohu" placement="top">
                                                    <IconButton onClick={() => {
                                                      setTaskToDelete(variant);
                                                      setConfirmOpen(true);
                                                    }}>
                                                      <DeleteIcon />
                                                    </IconButton>
                                                  </Tooltip>
                                                </TableCell>
                                              </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </Collapse>
                                  </TableCell>
                                </TableRow>
                            )}
                          </React.Fragment>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TablePagination
                          count={rootTaskIds.length}
                          page={page}
                          onPageChange={(event, newPage) => setPage(newPage)}
                          rowsPerPage={rowsPerPage}
                          onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                          }}
                          rowsPerPageOptions={[5, 10, 25]}
                          labelRowsPerPage="Úloh na stránku:"
                      />
                    </TableRow>
                  </TableFooter>


                </Table>
            )}
          </CardContent>
        </Card>

        {taskToDelete && (
            <ConfirmDeleteTaskDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
                itemName={taskToDelete.name}
            />
        )}

        {taskToDuplicate && (
            <ConfirmDuplicateTaskDialog
                open={duplicateDialogOpen}
                onClose={() => {
                  setDuplicateDialogOpen(false);
                  setTaskToDuplicate(null);
                }}
                onConfirm={() => {
                  if (taskToDuplicate) {
                    handleDuplicate(taskToDuplicate.id);
                  }
                  setDuplicateDialogOpen(false);
                  setTaskToDuplicate(null);
                }}
                taskName={taskToDuplicate.name}
            />
        )}


      </Container>
  );
};

export default Tasks;
