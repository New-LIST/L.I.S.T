import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  CircularProgress,
  IconButton,
} from "@mui/material";
import api from "../../../services/api";
import { Log } from "../Types/Log";
import { PagedResult } from "../../../shared/Interfaces/PagedResult";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";

export default function LogsTable() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get<PagedResult<Log>>("/logs", {
        params: {
          page: page + 1,
          pageSize: rowsPerPage,
          filter: filter || undefined,
        },
      });
      setLogs(response.data.items);
      setTotalCount(response.data.totalCount);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage, filter]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (log: Log) => {
    setSelectedLog(log);
  };

  const handleCloseDialog = () => {
    setSelectedLog(null);
  };

  const getActionText = (action: string) => {
    switch (action) {
      case "POST":
        return "pridal";
      case "UPDATE":
        return "upravil";
      case "DELETE":
        return "odstránil";
      default:
        return action.toLowerCase();
    }
  };

  const getTargetText = (target: string) => {
    switch (target) {
      case "courses":
        return "course";
      case "periods":
        return "period";
      case "course-task-set-rel":
        return "zostavu v kurze";
      case "tasks":
        return "task";
      default:
        return target.toLowerCase();
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <TextField
        label="Filter"
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value);
          setPage(0);
        }}
        fullWidth
        sx={{ mb: 2 }}
      />

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Popis</TableCell>
                  <TableCell align="right">Akcia</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {`${log.userId} ${getActionText(log.action)} ${
                        getTargetText(log.target)
                      } s názvom "${log.targetName ?? "(bez názvu)"}"`}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleOpenDialog(log)}
                        size="small"
                      >
                        <InfoOutlineIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      <Dialog open={!!selectedLog} onClose={handleCloseDialog}>
        <DialogTitle>Podrobnosti logu</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <DialogContentText component="div">
              <div>
                <strong>Id:</strong> {selectedLog.targetId}
              </div>
              <div>
                <strong>UserId:</strong> {selectedLog.userId}
              </div>
              <div>
                <strong>Action:</strong> {selectedLog.action}
              </div>
              <div>
                <strong>Target:</strong> {selectedLog.target}
              </div>
              <div>
                <strong>TargetId:</strong> {selectedLog.targetId}
              </div>
              <div>
                <strong>TargetName:</strong>{" "}
                {selectedLog.targetName ?? "(bez názvu)"}
              </div>
              <div>
                <strong>Timestamp:</strong>{" "}
                {new Date(selectedLog.timestamp).toLocaleString()}
              </div>
              <div>
                <strong>IpAdress:</strong>{" "}
                {selectedLog.ipAdress ?? "unknown"}
              </div>
            </DialogContentText>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
}
