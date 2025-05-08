import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, Paper, TextField, TablePagination, CircularProgress
} from "@mui/material";
import api from "../../../services/api";import { Log  } from "../Types/Log";
import { PagedResult } from "../../../shared/Interfaces/PagedResult";

type Order = "asc" | "desc";
type Sortable = keyof Log;

export default function LogsTable() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<Sortable>("timestamp");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get<PagedResult<Log>>("/logs", {
        params: {
          page: page + 1,
          pageSize: rowsPerPage,
          sort: orderBy,
          desc: order === "desc",
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
  }, [page, rowsPerPage, order, orderBy, filter]);

  const handleSort = (property: Sortable) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
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
                  {["userId", "action", "target", "targetId", "timestamp"].map((key) => (
                    <TableCell key={key}>
                      <TableSortLabel
                        active={orderBy === key}
                        direction={orderBy === key ? order : "asc"}
                        onClick={() => handleSort(key as Sortable)}
                      >
                        {key}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{log.userId}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.target}</TableCell>
                    <TableCell>{log.targetId}</TableCell>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
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
    </Paper>
  );
}
