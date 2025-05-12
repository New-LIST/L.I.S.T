import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  TableContainer,
  Paper,
  TablePagination,
  Button,
  Menu,
  MenuItem,
  Checkbox,
} from "@mui/material";
import { useState } from "react";
import { useAssignments } from "../hooks/useAssignments";
import { Assignment } from "../types/Assignment";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import AssignmentFilterPanel from "../components/AssignmentFilterPanel";
import { useNotification } from "../../../shared/components/NotificationContext";
import api from "../../../services/api"; // pridali sme import API

import { useNavigate } from "react-router-dom";

const optionalColumns = [
  { key: "id", label: "ID" },
  { key: "course", label: "Kurz" },
  { key: "teacher", label: "Autor" },
  { key: "created", label: "Vytvorené" },
  { key: "updated", label: "Upravené" },
  { key: "publishStartTime", label: "Publikované od" },
  { key: "uploadEndTime", label: "Odovzdať do" },
  { key: "published", label: "Zverejnené" },
];

const AssignmentsPage = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [visibleCols, setVisibleCols] = useState<string[]>([
    "course",
    "teacher",
    "publishStartTime",
  ]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sort, setSort] = useState<string>("created");
  const [desc, setDesc] = useState<boolean>(true);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState<{
    name?: string;
    courseId?: number;
    userId?: number;
  }>({});
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);

  const open = Boolean(anchorEl);
  const { data, loading, refetch } = useAssignments({
    page: page + 1,
    pageSize,
    sort,
    desc,
    ...filters,
  });

  const toggleColumn = (key: string) => {
    setVisibleCols((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const renderSortableHeader = (label: string, key: string) => (
    <TableCell
      onClick={() => handleSortChange(key)}
      style={{ cursor: "pointer" }}
    >
      {label}{" "}
      {sort === key ? (
        desc ? (
          <ArrowDownwardIcon fontSize="small" />
        ) : (
          <ArrowUpwardIcon fontSize="small" />
        )
      ) : null}
    </TableCell>
  );

  const handleSortChange = (key: string) => {
    if (sort === key) {
      setDesc(!desc); // toggle direction
    } else {
      setSort(key);
      setDesc(false); // default to ascending when new key is selected
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/dash/assignments/edit/${id}`);
  };

  const handleConfirmDelete = async () => {
    if (toDeleteId == null) return;
    try {
      await api.delete(`/assignments/${toDeleteId}`);
      // môžeš namiesto reload robiť refetch hooku
      showNotification("Zadanie bolo úspešne vymazané", "success");
      refetch();
    } catch {
      showNotification("Nepodarilo sa vymazať zadanie", "error");
    } finally {
      setDeleteDialogOpen(false);
      setToDeleteId(null);
    }
  };

  const handleDeleteClick = (id: number) => {
    setToDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setToDeleteId(null);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Zoznam zadaní</Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            onClick={() => navigate("/dash/assignments/create")}
          >
            Pridať zadanie
          </Button>
          <Button variant="outlined" onClick={() => setFilterVisible(true)}>
            Filter
          </Button>

          <Button
            variant="outlined"
            onClick={handleOpenMenu}
            startIcon={<MoreVertIcon />}
          >
            Stĺpce
          </Button>
          <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
            {optionalColumns.map((col) => (
              <MenuItem key={col.key} onClick={() => toggleColumn(col.key)}>
                <Checkbox checked={visibleCols.includes(col.key)} />
                {col.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>
      {filterVisible && (
        <AssignmentFilterPanel
          onClose={() => setFilterVisible(false)}
          onFilter={(f) => {
            setPage(0); // reset page
            setFilters(f);
          }}
        />
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {visibleCols.includes("id") && renderSortableHeader("ID", "id")}
              <TableCell>Názov</TableCell>
              {visibleCols.includes("course") &&
                renderSortableHeader("Kurz", "course")}
              {visibleCols.includes("teacher") &&
                renderSortableHeader("Autor", "teacher")}
              {visibleCols.includes("created") &&
                renderSortableHeader("Vytvorené", "created")}
              {visibleCols.includes("updated") &&
                renderSortableHeader("Upravené", "updated")}
              {visibleCols.includes("publishStartTime") && (
                <TableCell>Publikované od</TableCell>
              )}
              {visibleCols.includes("uploadEndTime") && (
                <TableCell>Odovzdať do</TableCell>
              )}
              {visibleCols.includes("published") && (
                <TableCell>Zverejnené</TableCell>
              )}
              <TableCell align="right">Akcie</TableCell>
            </TableRow>
          </TableHead>
          {loading ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={10}>Načítavam...</TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {data.items.map((assignment: Assignment) => (
                <TableRow key={assignment.id}>
                  {visibleCols.includes("id") && (
                    <TableCell>{assignment.id}</TableCell>
                  )}
                  <TableCell>{assignment.name}</TableCell>
                  {visibleCols.includes("course") && (
                    <TableCell>{assignment.course?.name}</TableCell>
                  )}
                  {visibleCols.includes("teacher") && (
                    <TableCell>
                      {assignment.teacher?.fullname ??
                        assignment.teacher?.email}
                    </TableCell>
                  )}
                  {visibleCols.includes("created") && (
                    <TableCell>
                      {new Date(assignment.created).toLocaleDateString()}
                    </TableCell>
                  )}
                  {visibleCols.includes("updated") && (
                    <TableCell>
                      {new Date(assignment.updated).toLocaleDateString()}
                    </TableCell>
                  )}
                  {visibleCols.includes("publishStartTime") && (
                    <TableCell>
                      {assignment.publishStartTime
                        ? new Date(
                            assignment.publishStartTime
                          ).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  )}
                  {visibleCols.includes("uploadEndTime") && (
                    <TableCell>
                      {assignment.uploadEndTime
                        ? new Date(
                            assignment.uploadEndTime
                          ).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  )}
                  {visibleCols.includes("published") && (
                    <TableCell>
                      {assignment.published ? "Áno" : "Nie"}
                    </TableCell>
                  )}
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(assignment.id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClick(assignment.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
        <TablePagination
          component="div"
          count={data.totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Potvrď vymazanie"
        message="Naozaj chceš vymazať toto zadanie?"
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};

export default AssignmentsPage;
