import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Popover,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import {
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import api from "../../../services/api";
import {
  GradeMatrixDto,
  GradeMatrixType,
  StudentGrade,
} from "../types/gradeMatrix";
import { useTranslation } from "react-i18next";

interface SolutionDto {
  id: number;
  studentId: number;
}

type ViewMode = "detailed" | "simple";
type SortDirection = "asc" | "desc";
type GradeColumnType = "section" | "assignment" | "grand";

interface GradeColumn {
  id: string;
  label: string;
  type: GradeColumnType;
  relId?: number;
  assignmentId?: number;
  includeInTotal?: boolean;
}

const stickyStudentColumnSx: SxProps<Theme> = {
  position: "sticky",
  left: 0,
  zIndex: 3,
  minWidth: 220,
  maxWidth: 260,
  bgcolor: "background.paper",
  boxShadow: "1px 0 0 rgba(0, 0, 0, 0.08)",
};

const compactCellSx: SxProps<Theme> = {
  px: 1,
  py: 0.45,
  fontSize: 13,
  lineHeight: 1.2,
  borderColor: "divider",
  whiteSpace: "nowrap",
};

const GradeTable: React.FC = () => {
  const { t } = useTranslation();
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [matrix, setMatrix] = useState<GradeMatrixDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solutionsMap, setSolutionsMap] = useState<
    Record<number, Record<number, number>>
  >({});
  const [visibleCols, setVisibleCols] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("fullName");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("detailed");

  const openTree = Boolean(anchorEl);

  useEffect(() => {
    if (!courseId) return;

    setLoading(true);
    setError(null);
    api
      .get<GradeMatrixDto>(`gradetable/course/${courseId}`)
      .then((res) => setMatrix(res.data))
      .catch((err) => {
        console.error(err);
        setError(t("Could not load grade table"));
      })
      .finally(() => setLoading(false));
  }, [courseId, t]);

  const allColumns = useMemo<GradeColumn[]>(() => {
    if (!matrix) return [];

    const cols: GradeColumn[] = [];
    matrix.types.forEach((type) => {
      cols.push({
        id: `sec_${type.relId}`,
        label: type.taskSetTypeName,
        type: "section",
        relId: type.relId,
        includeInTotal: type.includeInTotal,
      });

      type.assignments.forEach((assignment) => {
        cols.push({
          id: `assg_${assignment.assignmentId}`,
          label: assignment.assignmentName,
          type: "assignment",
          assignmentId: assignment.assignmentId,
        });
      });
    });

    cols.push({ id: "grand", label: t("Total"), type: "grand" });
    return cols;
  }, [matrix, t]);

  useEffect(() => {
    if (!matrix) return;

    setVisibleCols(allColumns.map((column) => column.id));

    const allAssignmentIds = matrix.types
      .flatMap((type) =>
        type.assignments.map((assignment) => assignment.assignmentId)
      )
      .filter((id, index, self) => self.indexOf(id) === index);

    Promise.all(
      allAssignmentIds.map((id) =>
        api
          .get<SolutionDto[]>(`/assignments/${id}/solutions`)
          .then((res) => ({ id, solutions: res.data }))
      )
    )
      .then((results) => {
        const nextMap: Record<number, Record<number, number>> = {};
        results.forEach(({ id, solutions }) => {
          nextMap[id] = {};
          solutions.forEach((solution) => {
            nextMap[id][solution.studentId] = solution.id;
          });
        });
        setSolutionsMap(nextMap);
      })
      .catch((err) => console.error(err));
  }, [matrix, allColumns]);

  const hasGroups = useMemo(
    () => Boolean(matrix?.students.some((student) => student.group)),
    [matrix]
  );

  const colsToRender = useMemo(() => {
    if (viewMode === "simple") {
      return allColumns.filter(
        (column) => column.type === "section" || column.type === "grand"
      );
    }

    return allColumns.filter((column) => visibleCols.includes(column.id));
  }, [allColumns, viewMode, visibleCols]);

  const formatNum = (num?: number | null) =>
    num != null
      ? num.toLocaleString("sk-SK", { maximumFractionDigits: 2 })
      : "-";

  const formatCount = (
    count: number,
    singular: string,
    few: string,
    many: string
  ) => {
    const key = count === 1 ? singular : count >= 2 && count <= 4 ? few : many;
    return `${count} ${t(key)}`;
  };

  const abbreviate = (name: string, maxLength = 14): string => {
    if (name.length <= maxLength) return name;

    const acronym = name
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0].toUpperCase())
      .join("");

    return acronym.length > 1 && acronym.length <= maxLength
      ? acronym
      : `${name.slice(0, maxLength - 1)}...`;
  };

  const calcGrandTotal = (student: StudentGrade, types: GradeMatrixType[]) =>
    types
      .filter((type) => type.includeInTotal)
      .reduce(
        (sum, type) => sum + (student.sectionTotals[type.relId] ?? 0),
        0
      );

  const meetsMin = (total: number, type: GradeMatrixType): boolean => {
    if (type.minPoints == null) return true;

    const threshold = type.minPointsInPercentage
      ? (type.minPoints / 100) * type.maxPoints
      : type.minPoints;

    return total >= threshold;
  };

  const meetsAllMin = (student: StudentGrade, types: GradeMatrixType[]) =>
    types
      .filter((type) => type.includeInTotal && type.minPoints != null)
      .every((type) => meetsMin(student.sectionTotals[type.relId] ?? 0, type));

  const failedMinimumCount = useMemo(() => {
    if (!matrix) return 0;
    return matrix.students.filter((student) => !meetsAllMin(student, matrix.types))
      .length;
  }, [matrix]);

  const getSortValue = (student: StudentGrade, columnId: string) => {
    if (!matrix) return "";

    if (columnId === "fullName") return student.fullName.toLowerCase();
    if (columnId === "group") return (student.group ?? "").toLowerCase();
    if (columnId === "grand") return calcGrandTotal(student, matrix.types);

    const column = allColumns.find((item) => item.id === columnId);
    if (column?.type === "assignment" && column.assignmentId != null) {
      return student.points[column.assignmentId] ?? null;
    }

    if (column?.type === "section" && column.relId != null) {
      return student.sectionTotals[column.relId] ?? null;
    }

    return "";
  };

  const displayedStudents = useMemo(() => {
    if (!matrix) return [];

    return [...matrix.students].sort((left, right) => {
      const leftValue = getSortValue(left, sortBy);
      const rightValue = getSortValue(right, sortBy);

      if (leftValue == null && rightValue == null) {
        return left.fullName.localeCompare(right.fullName);
      }
      if (leftValue == null) return 1;
      if (rightValue == null) return -1;

      let result = 0;
      if (typeof leftValue === "number" && typeof rightValue === "number") {
        result = leftValue - rightValue;
      } else {
        result = String(leftValue).localeCompare(String(rightValue), "sk-SK");
      }

      if (result === 0) {
        result = left.fullName.localeCompare(right.fullName, "sk-SK");
      }

      return sortDir === "asc" ? result : -result;
    });
  }, [matrix, sortBy, sortDir, allColumns]);

  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortDir((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(columnId);
    setSortDir(columnId === "fullName" || columnId === "group" ? "asc" : "desc");
  };

  const handleToggleSection = (itemId: string, selected: boolean) => {
    if (!matrix) return;

    const relId = Number(itemId.split("_")[1]);
    const section = matrix.types.find((type) => type.relId === relId);
    if (!section) return;

    const childIds = section.assignments.map(
      (assignment) => `assg_${assignment.assignmentId}`
    );

    setVisibleCols((cols) =>
      selected
        ? Array.from(new Set([...cols, itemId, ...childIds]))
        : cols.filter((id) => id !== itemId && !childIds.includes(id))
    );
  };

  const handleToggleColumn = (itemId: string, selected: boolean) => {
    if (itemId.startsWith("sec_")) {
      handleToggleSection(itemId, selected);
      return;
    }

    setVisibleCols((cols) =>
      selected
        ? Array.from(new Set([...cols, itemId]))
        : cols.filter((id) => id !== itemId)
    );
  };

  const getColumnHeaderSx = (column: GradeColumn): SxProps<Theme> => {
    const base: SxProps<Theme> = {
      ...compactCellSx,
      top: 0,
      zIndex: 2,
      textAlign: "center",
      fontWeight: 700,
      bgcolor: "#f5f7fb",
      maxWidth: 150,
    };

    if (column.type === "section") {
      return {
        ...base,
        bgcolor: column.includeInTotal ? "#d8f5d1" : "#fff3c4",
      };
    }

    if (column.type === "grand") {
      return {
        ...base,
        bgcolor: "#bff2b2",
        borderLeft: "2px solid rgba(46, 125, 50, 0.35)",
      };
    }

    return base;
  };

  const getCellSx = (
    column: GradeColumn,
    student: StudentGrade
  ): SxProps<Theme> => {
    const base: SxProps<Theme> = {
      ...compactCellSx,
      textAlign: "center",
      minWidth: column.type === "assignment" ? 86 : 96,
      maxWidth: 140,
    };

    if (!matrix) return base;

    if (column.type === "section" && column.relId != null) {
      const type = matrix.types.find((item) => item.relId === column.relId);
      const total = student.sectionTotals[column.relId] ?? 0;

      return {
        ...base,
        fontWeight: 700,
        bgcolor: !type?.includeInTotal
          ? "#fff3c4"
          : meetsMin(total, type)
          ? "#e2f7dc"
          : "#ffe2a8",
      };
    }

    if (column.type === "grand") {
      return {
        ...base,
        fontWeight: 700,
        bgcolor: meetsAllMin(student, matrix.types) ? "#d8f5d1" : "#ffe2a8",
        borderLeft: "2px solid rgba(46, 125, 50, 0.35)",
      };
    }

    return base;
  };

  const renderSortableHeader = (
    id: string,
    label: string,
    sx?: SxProps<Theme>,
    title?: string
  ) => (
    <TableCell sortDirection={sortBy === id ? sortDir : false} sx={sx}>
      <Tooltip title={title ?? label}>
        <TableSortLabel
          active={sortBy === id}
          direction={sortBy === id ? sortDir : "asc"}
          onClick={() => handleSort(id)}
        >
          {label}
        </TableSortLabel>
      </Tooltip>
    </TableCell>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !matrix) {
    return (
      <Box p={3}>
        <Alert severity="error">{error ?? t("Grade table unavailable")}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Stack spacing={2}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={2}
          flexWrap="wrap"
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {t("Grade Table")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {matrix.courseName} / {matrix.periodName}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip
              size="small"
              label={formatCount(
                matrix.students.length,
                "student count singular",
                "student count few",
                "student count many"
              )}
              variant="outlined"
            />
            <Chip
              size="small"
              label={formatCount(
                allColumns.filter((c) => c.type === "assignment").length,
                "assignment count singular",
                "assignment count few",
                "assignment count many"
              )}
              variant="outlined"
            />
            {failedMinimumCount > 0 && (
              <Chip
                size="small"
                label={formatCount(
                  failedMinimumCount,
                  "failed minimum count singular",
                  "failed minimum count few",
                  "failed minimum count many"
                )}
                color="warning"
                variant="outlined"
              />
            )}
            <Button
              size="small"
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
            >
              {t("Back")}
            </Button>
          </Stack>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            px: 1.5,
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <ToggleButtonGroup
              exclusive
              size="small"
              value={viewMode}
              onChange={(_, nextMode: ViewMode | null) => {
                if (nextMode) setViewMode(nextMode);
              }}
            >
              <ToggleButton value="detailed">{t("Detailed")}</ToggleButton>
              <ToggleButton value="simple">{t("Simplified")}</ToggleButton>
            </ToggleButtonGroup>

            {viewMode === "detailed" && (
              <Button
                size="small"
                startIcon={<MoreVertIcon />}
                variant="outlined"
                onClick={(event) => setAnchorEl(event.currentTarget)}
              >
                {t("Columns")}
              </Button>
            )}
          </Stack>

          <Box />
        </Paper>

        <Popover
          open={openTree}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          PaperProps={{ sx: { p: 1, minWidth: 260, maxHeight: 420 } }}
        >
          <SimpleTreeView
            checkboxSelection
            multiSelect
            selectedItems={visibleCols}
            onItemSelectionToggle={(_, itemId, selected) =>
              handleToggleColumn(itemId, selected)
            }
          >
            {matrix.types.map((type) => (
              <TreeItem
                key={`sec_${type.relId}`}
                itemId={`sec_${type.relId}`}
                label={type.taskSetTypeName}
              >
                {type.assignments.map((assignment) => (
                  <TreeItem
                    key={`assg_${assignment.assignmentId}`}
                    itemId={`assg_${assignment.assignmentId}`}
                    label={assignment.assignmentName}
                  />
                ))}
              </TreeItem>
            ))}
            <TreeItem itemId="grand" label={t("Total")} />
          </SimpleTreeView>
        </Popover>

        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            maxHeight: "calc(100vh - 230px)",
            minHeight: 220,
            overflow: "auto",
          }}
        >
          <Table
            stickyHeader
            size="small"
            sx={{
              borderCollapse: "separate",
              borderSpacing: 0,
              "& tbody tr:nth-of-type(even) td": {
                bgcolor: "rgba(0, 0, 0, 0.015)",
              },
              "& tbody tr:hover td": {
                bgcolor: "rgba(25, 118, 210, 0.07)",
              },
            }}
          >
            <TableHead>
              <TableRow>
                {renderSortableHeader("fullName", t("Student"), {
                  ...compactCellSx,
                  ...stickyStudentColumnSx,
                  top: 0,
                  zIndex: 5,
                  fontWeight: 700,
                  bgcolor: "#eef3ff",
                })}

                {hasGroups &&
                  renderSortableHeader("group", t("Group"), {
                    ...compactCellSx,
                    top: 0,
                    zIndex: 2,
                    fontWeight: 700,
                    bgcolor: "#eef3ff",
                    minWidth: 120,
                  })}

                {colsToRender.map((column) =>
                  renderSortableHeader(
                    column.id,
                    abbreviate(column.label),
                    getColumnHeaderSx(column),
                    column.label
                  )
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {displayedStudents.map((student) => (
                <TableRow key={student.studentId} hover>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      ...compactCellSx,
                      ...stickyStudentColumnSx,
                      fontWeight: 600,
                    }}
                    title={student.fullName}
                  >
                    {student.fullName}
                  </TableCell>

                  {hasGroups && (
                    <TableCell
                      sx={{
                        ...compactCellSx,
                        color: student.group ? "text.primary" : "text.disabled",
                      }}
                    >
                      {student.group ?? t("No Group")}
                    </TableCell>
                  )}

                  {colsToRender.map((column) => {
                    let content: React.ReactNode = null;

                    if (column.type === "section" && column.relId != null) {
                      content = formatNum(student.sectionTotals[column.relId] ?? 0);
                    }

                    if (
                      column.type === "assignment" &&
                      column.assignmentId != null
                    ) {
                      const points = student.points[column.assignmentId];
                      const solutionId =
                        solutionsMap[column.assignmentId]?.[student.studentId];

                      content =
                        solutionId != null ? (
                          <Button
                            size="small"
                            variant="text"
                            sx={{
                              minWidth: 0,
                              p: 0,
                              lineHeight: 1.1,
                              fontSize: 13,
                              textTransform: "none",
                            }}
                            onClick={() =>
                              navigate(
                                `/dash/grade/course/${courseId}/assignments/${column.assignmentId}/solutions/${solutionId}/evaluate`
                              )
                            }
                          >
                            {formatNum(points)}
                          </Button>
                        ) : (
                          <Tooltip title={t("No Solution")}>
                            <Box component="span" color="text.disabled">
                              -
                            </Box>
                          </Tooltip>
                        );
                    }

                    if (column.type === "grand") {
                      content = formatNum(calcGrandTotal(student, matrix.types));
                    }

                    return (
                      <TableCell
                        key={column.id}
                        sx={getCellSx(column, student)}
                        title={column.label}
                      >
                        {content}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

      </Stack>
    </Box>
  );
};

export default GradeTable;
