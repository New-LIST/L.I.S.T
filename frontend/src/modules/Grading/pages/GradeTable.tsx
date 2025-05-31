// src/modules/assignments/pages/GradeTable.tsx

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  Button,
  Checkbox,
  TableSortLabel,
  SxProps,
  Theme,
  FormControlLabel,
  Popover,
} from "@mui/material";
import api from "../../../services/api";
import {
  GradeMatrixDto,
  GradeMatrixType,
  StudentGrade,
} from "../types/gradeMatrix";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";

interface SolutionDto {
  id: number;
  studentId: number;
}

const GradeTable: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [matrix, setMatrix] = useState<GradeMatrixDto | null>(null);
  const [solutionsMap, setSolutionsMap] = useState<
    Record<number, Record<number, number>>
  >({});

  // stavy pre voliteľné stĺpce
  const [visibleCols, setVisibleCols] = useState<string[]>([]);
  // stavy pre triedenie
  const [sortBy, setSortBy] = useState<string>("fullName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const openTree = Boolean(anchorEl);
  const handleOpenTree = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleCloseTree = () => setAnchorEl(null);
  const [simplified, setSimplified] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    api
      .get<GradeMatrixDto>(`gradetable/course/${courseId}`)
      .then((res) => setMatrix(res.data))
      .catch((err) => console.error(err));
  }, [courseId]);

  useEffect(() => {
    if (!matrix) return;
    // defaultné viditeľné stĺpce po načítaní matrixu
    const defaultCols = matrix.types
      .flatMap((t) => [
        `sec_${t.relId}`,
        ...t.assignments.map((a) => `assg_${a.assignmentId}`),
      ])
      .concat(["grand"]);
    setVisibleCols(defaultCols);

    // načítanie riešení
    const allAssignIds = matrix.types
      .flatMap((t) => t.assignments.map((a) => a.assignmentId))
      .filter((v, i, self) => self.indexOf(v) === i);

    Promise.all(
      allAssignIds.map((id) =>
        api
          .get<SolutionDto[]>(`/assignments/${id}/solutions`)
          .then((res) => ({ id, sols: res.data }))
      )
    )
      .then((results) => {
        const map: typeof solutionsMap = {};
        results.forEach(({ id, sols }) => {
          map[id] = {};
          sols.forEach((s) => {
            map[id][s.studentId] = s.id;
          });
        });
        setSolutionsMap(map);
      })
      .catch((err) => console.error(err));
  }, [matrix]);

  // pomocné funkcie
  const formatNum = (num?: number | null) =>
    num != null
      ? num.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : "–";

  const abbreviate = (name: string, maxLength = 10): string => {
    if (name.length <= maxLength) return name;
    const acronym = name
      .split(/\s+/)
      .map((w) => w[0].toUpperCase())
      .join("");
    return acronym.length <= maxLength ? acronym : acronym.slice(0, maxLength);
  };

  const calcGrandTotal = (s: StudentGrade, types: GradeMatrixType[]) =>
    types
      .filter((t) => t.includeInTotal)
      .reduce((sum, t) => sum + (s.sectionTotals[t.relId] || 0), 0);

  const meetsMin = (total: number, t: GradeMatrixType): boolean => {
    if (t.minPoints == null) return true;
    const threshold = t.minPointsInPercentage
      ? (t.minPoints / 100) * t.maxPoints
      : t.minPoints;
    return total >= threshold;
  };

  const meetsAllMin = (s: StudentGrade, types: GradeMatrixType[]): boolean =>
    types
      .filter((t) => t.includeInTotal && t.minPoints != null)
      .every((t) => meetsMin(s.sectionTotals[t.relId] ?? 0, t));

  // definícia všetkých stĺpcov
  const allColumns = useMemo(() => {
    if (!matrix) return [];
    const cols: {
      id: string;
      label: string;
      type: "section" | "assignment" | "grand";
      relId?: number;
      assignmentId?: number;
    }[] = [];
    matrix.types.forEach((t) => {
      cols.push({
        id: `sec_${t.relId}`,
        label: t.taskSetTypeName,
        type: "section",
        relId: t.relId,
      });
      t.assignments.forEach((a) => {
        cols.push({
          id: `assg_${a.assignmentId}`,
          label: a.assignmentName,
          type: "assignment",
          assignmentId: a.assignmentId,
        });
      });
    });
    cols.push({ id: "grand", label: "Spolu", type: "grand" });
    return cols;
  }, [matrix]);

  // zoradenie študentov podľa sortBy a sortDir
  const displayedStudents = useMemo(() => {
    if (!matrix) return [];
    return [...matrix.students].sort((a, b) => {
      const accessor =
        allColumns.find((c) => c.id === sortBy)?.type === "assignment"
          ? (s: StudentGrade) => s.points[Number(sortBy.split("_")[1])] ?? 0
          : allColumns.find((c) => c.id === sortBy)?.type === "section"
          ? (s: StudentGrade) =>
              s.sectionTotals[Number(sortBy.split("_")[1])] ?? 0
          : (s: StudentGrade) =>
              sortBy === "fullName"
                ? s.fullName.toLowerCase()
                : calcGrandTotal(s, matrix.types);

      const va = accessor(a) as number | string;
      const vb = accessor(b) as number | string;
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [matrix?.students, sortBy, sortDir, allColumns]);

  const colsToRender = simplified
    ? allColumns.filter((c) => c.type === "section" || c.type === "grand")
    : allColumns.filter((c) => visibleCols.includes(c.id));

  if (!matrix) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box component="h2">
            {matrix.courseName} — {matrix.periodName}
          </Box>
          <Box>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Späť
            </Button>
          </Box>
        </Box>
      </Paper>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={simplified}
              onChange={(e) => setSimplified(e.target.checked)}
            />
          }
          label="Zjednodušená"
        />
        <Button
          startIcon={<MoreVertIcon />}
          variant="outlined"
          onClick={handleOpenTree}
        >
          Stĺpce
        </Button>
      </Box>
      <Popover
        open={openTree}
        anchorEl={anchorEl}
        onClose={handleCloseTree}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        PaperProps={{ sx: { p: 1, minWidth: 200 } }}
      >
        <SimpleTreeView
          checkboxSelection
          multiSelect
          selectedItems={visibleCols}
          onItemSelectionToggle={(_, id, isSel) =>
            id.startsWith("sec_")
              ? (() => {
                  const rel = Number(id.split("_")[1]);
                  const t = matrix.types.find((x) => x.relId === rel)!;
                  const children = t.assignments.map(
                    (a) => `assg_${a.assignmentId}`
                  );
                  setVisibleCols((cols) =>
                    isSel
                      ? Array.from(new Set([...cols, id, ...children]))
                      : cols.filter((x) => x !== id && !children.includes(x))
                  );
                })()
              : id.startsWith("assg_")
              ? setVisibleCols((cols) =>
                  isSel ? [...cols, id] : cols.filter((x) => x !== id)
                )
              : id === "grand"
              ? setVisibleCols((cols) =>
                  isSel ? [...cols, "grand"] : cols.filter((x) => x !== "grand")
                )
              : null
          }
        >
          {matrix.types.map((t) => (
            <TreeItem
              key={`sec_${t.relId}`}
              itemId={`sec_${t.relId}`}
              label={t.taskSetTypeName}
            >
              {t.assignments.map((a) => (
                <TreeItem
                  key={`assg_${a.assignmentId}`}
                  itemId={`assg_${a.assignmentId}`}
                  label={a.assignmentName}
                />
              ))}
            </TreeItem>
          ))}
          <TreeItem itemId="grand" label="Spolu" />
        </SimpleTreeView>
      </Popover>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "fullName"}
                  direction={sortBy === "fullName" ? sortDir : "asc"}
                  onClick={() => {
                    if (sortBy === "fullName")
                      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
                    else {
                      setSortBy("fullName");
                      setSortDir("asc");
                    }
                  }}
                >
                  Študent
                </TableSortLabel>
              </TableCell>
              {colsToRender
                .filter((c) => visibleCols.includes(c.id))
                .map((c) => {
                  // farebne oznacime hlavicku pre sekcie
                  const cellSx: SxProps<Theme> = {
                    textAlign: "center",
                  };
                  if (c.type === "section" && c.relId != null) {
                    const t = matrix.types.find((x) => x.relId === c.relId)!;
                    cellSx.fontWeight = "bold";
                    cellSx.bgcolor = t.includeInTotal ? "#ABF88F" : "#fcdb44";
                  }
                  if (c.type === "grand") {
                    cellSx.fontWeight = "bold";
                    cellSx.bgcolor = "#ABF88F";
                  }
                  return (
                    <TableCell
                      key={c.id}
                      sortDirection={sortBy === c.id ? sortDir : false}
                      sx={cellSx}
                    >
                      <TableSortLabel
                        active={sortBy === c.id}
                        direction={sortBy === c.id ? sortDir : "asc"}
                        onClick={() => {
                          if (sortBy === c.id)
                            setSortDir((dir) =>
                              dir === "asc" ? "desc" : "asc"
                            );
                          else {
                            setSortBy(c.id);
                            setSortDir("asc");
                          }
                        }}
                        title={c.label}
                      >
                        {abbreviate(c.label)}
                      </TableSortLabel>
                    </TableCell>
                  );
                })}
            </TableRow>
          </TableHead>

          <TableBody>
            {displayedStudents.map((s) => (
              <TableRow key={s.studentId}>
                <TableCell>{s.fullName}</TableCell>
                {colsToRender
                  .filter((c) => visibleCols.includes(c.id))
                  .map((c) => {
                    let content: React.ReactNode = null;
                    const cellSx: SxProps<Theme> = { textAlign: "left" };
                    if (c.type === "section" && c.relId != null) {
                      const total = s.sectionTotals[c.relId] ?? 0;
                      const t = matrix.types.find((x) => x.relId === c.relId)!;
                      cellSx.fontWeight = "bold";
                      cellSx.bgcolor = !t.includeInTotal
                        ? "#fcdb44"
                        : meetsMin(total, t)
                        ? "#ABF88F"
                        : "#ffd22d";
                      content = formatNum(total);
                    } else if (
                      c.type === "assignment" &&
                      c.assignmentId != null
                    ) {
                      const pts = s.points[c.assignmentId];
                      const solId = solutionsMap[c.assignmentId]?.[s.studentId];
                      content =
                        pts == null ? (
                          "–"
                        ) : (
                          <Button
                            size="small"
                            style={{ justifyContent: "flex-start" }}
                            onClick={() =>
                              navigate(
                                `/dash/grade/course/${courseId}/assignments/${c.assignmentId}/solutions/${solId}/evaluate`
                              )
                            }
                          >
                            {formatNum(pts)}
                          </Button>
                        );
                    } else if (c.type === "grand") {
                      const total = calcGrandTotal(s, matrix.types);
                      cellSx.fontWeight = "bold";
                      cellSx.bgcolor = meetsAllMin(s, matrix.types)
                        ? "#ABF88F"
                        : "#ffd22d";
                      content = formatNum(total);
                    }

                    return (
                      <TableCell key={c.id} sx={cellSx} title={c.label}>
                        {content}
                      </TableCell>
                    );
                  })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GradeTable;
