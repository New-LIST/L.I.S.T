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
  Box,
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
  const [userFilter, setUserFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get<PagedResult<Log>>("/logs", {
        params: {
          page: page + 1,
          pageSize: rowsPerPage,
          textfilter: filter || undefined,
          userFilter: userFilter || undefined,
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
  }, [page, rowsPerPage, filter, userFilter]);

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

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Filtrovať podľa textu"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(0);
          }}
          fullWidth
        />
        <TextField
          label="Filtrovať podľa používateľa"
          value={userFilter}
          onChange={(e) => {
            setUserFilter(e.target.value);
            setPage(0);
          }}
          fullWidth
        />
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <TableContainer>
            <Table size = "small">
              <TableHead>
                <TableRow>
                  <TableCell>Popis</TableCell>
                  <TableCell align="right">Akcia</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{log.text}</TableCell>
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
              <div style={{ marginBottom: "1em" }}>
                <strong>Popis:</strong> {selectedLog.text}
              </div>
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
                <strong>IpAdress:</strong> {selectedLog.ipAdress ?? "unknown"}
              </div>
            </DialogContentText>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
}
