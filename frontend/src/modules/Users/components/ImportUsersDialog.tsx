import {
    Alert,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputLabel,
    LinearProgress,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import {ChangeEvent, useEffect, useMemo, useRef, useState} from "react";
import {AxiosError} from "axios";
import api from "../../../services/api.ts";
import {Course} from "../../Courses/Types/Course.ts";
import {CourseGroup} from "../../Courses/Types/CourseGroup.ts";
import {useNotification} from "../../../shared/components/NotificationContext.tsx";

type DialogProps = {
    isOpen: boolean;
    onClose: () => void;
};

type Delimiter = "auto" | "semicolon" | "comma" | "tab";
type ColumnMeaning = "ignore" | "firstName" | "lastName" | "email";

type PreviewRow = {
    rowNumber: number;
    values: string[];
};

type PreviewError = {
    rowNumber: number;
    message: string;
};

type PreviewResponse = {
    delimiter: Exclude<Delimiter, "auto">;
    hasHeader: boolean;
    headers: string[];
    rows: PreviewRow[];
    errors: PreviewError[];
    truncated: boolean;
};

type ImportRow = {
    rowNumber: number;
    firstName: string;
    lastName: string;
    email: string;
};

type ImportRowResult = {
    rowNumber: number;
    email: string;
    status: string;
    message: string;
};

type ImportResult = {
    createdUsers: number;
    existingUsers: number;
    addedParticipants: number;
    existingParticipants: number;
    failedRows: number;
    rows: ImportRowResult[];
};

const mappingOptions: {value: ColumnMeaning; label: string}[] = [
    {value: "ignore", label: "Ignorovať"},
    {value: "firstName", label: "Meno"},
    {value: "lastName", label: "Priezvisko"},
    {value: "email", label: "Email"},
];

export const ImportUsersDialog = ({isOpen, onClose}: DialogProps) => {
    const {showNotification} = useNotification();
    const showNotificationRef = useRef(showNotification);

    const [file, setFile] = useState<File>();
    const [delimiter, setDelimiter] = useState<Delimiter>("auto");
    const [hasHeader, setHasHeader] = useState(true);
    const [preview, setPreview] = useState<PreviewResponse>();
    const [mapping, setMapping] = useState<ColumnMeaning[]>([]);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [courses, setCourses] = useState<Course[]>([]);
    const [groups, setGroups] = useState<CourseGroup[]>([]);
    const [courseId, setCourseId] = useState<number | "">("");
    const [groupId, setGroupId] = useState<number | "">("");
    const [allowed, setAllowed] = useState(true);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [loadingImport, setLoadingImport] = useState(false);
    const [result, setResult] = useState<ImportResult>();

    useEffect(() => {
        showNotificationRef.current = showNotification;
    }, [showNotification]);

    useEffect(() => {
        if (!isOpen) return;

        api.get<Course[]>("/courses")
            .then(response => setCourses(response.data))
            .catch(() => showNotificationRef.current("Kurzy sa nepodarilo načítať.", "error"));
    }, [isOpen]);

    useEffect(() => {
        setGroupId("");
        setGroups([]);

        if (courseId === "") return;

        api.get<CourseGroup[]>(`/groups/course/${courseId}`)
            .then(response => setGroups(response.data))
            .catch(() => showNotificationRef.current("Skupiny sa nepodarilo načítať.", "error"));
    }, [courseId]);

    const mappedRows = useMemo(() => {
        if (!preview) return new Map<number, ImportRow>();

        const firstNameIndex = mapping.indexOf("firstName");
        const lastNameIndex = mapping.indexOf("lastName");
        const emailIndex = mapping.indexOf("email");
        const rows = new Map<number, ImportRow>();

        if (firstNameIndex < 0 || lastNameIndex < 0 || emailIndex < 0) return rows;

        preview.rows.forEach(row => {
            rows.set(row.rowNumber, {
                rowNumber: row.rowNumber,
                firstName: row.values[firstNameIndex]?.trim() ?? "",
                lastName: row.values[lastNameIndex]?.trim() ?? "",
                email: row.values[emailIndex]?.trim() ?? "",
            });
        });

        return rows;
    }, [mapping, preview]);

    const validRowNumbers = useMemo(() => {
        return new Set(
            [...mappedRows.values()]
                .filter(row => row.firstName && row.lastName && /^[^\s@]+@[^\s@]+$/.test(row.email))
                .map(row => row.rowNumber),
        );
    }, [mappedRows]);

    const selectedValidRows = useMemo(() => {
        return [...selectedRows]
            .filter(rowNumber => validRowNumbers.has(rowNumber))
            .map(rowNumber => mappedRows.get(rowNumber)!)
            .sort((a, b) => a.rowNumber - b.rowNumber);
    }, [mappedRows, selectedRows, validRowNumbers]);

    const hasCompleteMapping =
        mapping.includes("firstName") &&
        mapping.includes("lastName") &&
        mapping.includes("email");

    const reset = () => {
        setFile(undefined);
        setDelimiter("auto");
        setHasHeader(true);
        setPreview(undefined);
        setMapping([]);
        setSelectedRows(new Set());
        setGroups([]);
        setCourseId("");
        setGroupId("");
        setAllowed(true);
        setResult(undefined);
    };

    const closeDialog = () => {
        reset();
        onClose();
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        setFile(selectedFile);
        setPreview(undefined);
        setResult(undefined);
    };

    const handlePreview = async () => {
        if (!file) return;

        setLoadingPreview(true);
        setResult(undefined);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("delimiter", delimiter);
        formData.append("hasHeader", String(hasHeader));

        try {
            const response = await api.post<PreviewResponse>("/user-import/preview", formData, {
                headers: {"Content-Type": "multipart/form-data"},
            });

            const nextMapping = createAutomaticMapping(response.data.headers);
            setPreview(response.data);
            setDelimiter(response.data.delimiter);
            setMapping(nextMapping);
            setSelectedRows(new Set(response.data.rows.map(row => row.rowNumber)));
        } catch (error) {
            showNotification(getErrorMessage(error, "CSV súbor sa nepodarilo načítať."), "error");
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleMappingChange = (columnIndex: number, meaning: ColumnMeaning) => {
        setMapping(current => current.map((value, index) => {
            if (index === columnIndex) return meaning;
            return meaning !== "ignore" && value === meaning ? "ignore" : value;
        }));
    };

    const toggleRow = (rowNumber: number) => {
        setSelectedRows(current => {
            const next = new Set(current);
            if (next.has(rowNumber)) next.delete(rowNumber);
            else next.add(rowNumber);
            return next;
        });
    };

    const toggleAllValid = () => {
        const allValidSelected = validRowNumbers.size > 0 &&
            [...validRowNumbers].every(rowNumber => selectedRows.has(rowNumber));
        setSelectedRows(allValidSelected ? new Set() : new Set(validRowNumbers));
    };

    const handleImport = async () => {
        if (selectedValidRows.length === 0) return;

        setLoadingImport(true);
        setResult(undefined);

        try {
            const response = await api.post<ImportResult>("/user-import/execute", {
                rows: selectedValidRows,
                courseId: courseId === "" ? null : courseId,
                groupId: groupId === "" ? null : groupId,
                allowed,
            });

            setResult(response.data);
            showNotification("Import bol dokončený.", response.data.failedRows > 0 ? "warning" : "success");
        } catch (error) {
            showNotification(getErrorMessage(error, "Import používateľov zlyhal."), "error");
        } finally {
            setLoadingImport(false);
        }
    };

    return (
        <Dialog
            fullWidth
            maxWidth="xl"
            open={isOpen}
            onClose={closeDialog}
            PaperProps={{sx: {height: "min(900px, 92vh)"}}}
        >
            <DialogTitle>Import používateľov z CSV</DialogTitle>
            <DialogContent dividers sx={{display: "flex", flexDirection: "column", gap: 2}}>
                {(loadingPreview || loadingImport) && <LinearProgress />}

                <Stack direction={{xs: "column", md: "row"}} spacing={2} alignItems={{md: "center"}}>
                    <Button variant="outlined" component="label">
                        Vybrať CSV súbor
                        <input hidden accept=".csv,text/csv" type="file" onChange={handleFileChange} />
                    </Button>
                    <Typography sx={{minWidth: 180}}>{file?.name ?? "Súbor nie je vybraný"}</Typography>
                    <FormControl size="small" sx={{minWidth: 170}}>
                        <InputLabel>Oddeľovač</InputLabel>
                        <Select
                            value={delimiter}
                            label="Oddeľovač"
                            onChange={event => setDelimiter(event.target.value as Delimiter)}
                        >
                            <MenuItem value="auto">Automaticky</MenuItem>
                            <MenuItem value="semicolon">Bodkočiarka</MenuItem>
                            <MenuItem value="comma">Čiarka</MenuItem>
                            <MenuItem value="tab">Tabulátor</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControlLabel
                        control={<Checkbox checked={hasHeader} onChange={event => setHasHeader(event.target.checked)} />}
                        label="Prvý riadok obsahuje názvy stĺpcov"
                    />
                    <Button
                        variant="contained"
                        disabled={!file || loadingPreview || loadingImport}
                        onClick={handlePreview}
                    >
                        Načítať náhľad
                    </Button>
                </Stack>

                {preview && (
                    <>
                        <Stack direction={{xs: "column", lg: "row"}} spacing={2}>
                            <FormControl size="small" sx={{minWidth: 260}}>
                                <InputLabel>Pridať do kurzu (voliteľné)</InputLabel>
                                <Select
                                    value={courseId}
                                    label="Pridať do kurzu (voliteľné)"
                                    onChange={event => setCourseId(event.target.value as number | "")}
                                >
                                    <MenuItem value="">Bez zaradenia do kurzu</MenuItem>
                                    {courses.map(course => (
                                        <MenuItem key={course.id} value={course.id}>
                                            {course.name}{course.periodName ? ` (${course.periodName})` : ""}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{minWidth: 260}} disabled={courseId === ""}>
                                <InputLabel>Pridať do skupiny (voliteľné)</InputLabel>
                                <Select
                                    value={groupId}
                                    label="Pridať do skupiny (voliteľné)"
                                    onChange={event => setGroupId(event.target.value as number | "")}
                                >
                                    <MenuItem value="">Bez skupiny</MenuItem>
                                    {groups.map(group => (
                                        <MenuItem key={group.id} value={group.id}>
                                            {group.name} ({group.participantCount}/{group.capacity || "bez limitu"})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControlLabel
                                disabled={courseId === ""}
                                control={<Checkbox checked={allowed} onChange={event => setAllowed(event.target.checked)} />}
                                label="Schváliť účasť v kurze"
                            />
                        </Stack>

                        {!hasCompleteMapping && (
                            <Alert severity="info">
                                Každému povinnému údaju priraďte jeden stĺpec: meno, priezvisko a email.
                            </Alert>
                        )}
                        {preview.truncated && (
                            <Alert severity="warning">
                                Náhľad bol obmedzený na prvých 5000 dátových riadkov.
                            </Alert>
                        )}
                        {preview.errors.length > 0 && (
                            <Alert severity="warning">
                                {preview.errors.length} riadkov sa nepodarilo spracovať. Prvý problém: riadok{" "}
                                {preview.errors[0].rowNumber} – {preview.errors[0].message}
                            </Alert>
                        )}

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1">
                                Náhľad: {preview.rows.length} riadkov, vybraných platných {selectedValidRows.length}
                            </Typography>
                            <Button size="small" onClick={toggleAllValid} disabled={!hasCompleteMapping}>
                                Vybrať všetky platné riadky
                            </Button>
                        </Box>

                        <TableContainer sx={{border: 1, borderColor: "divider", flex: 1, minHeight: 260}}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={
                                                    validRowNumbers.size > 0 &&
                                                    [...validRowNumbers].every(rowNumber => selectedRows.has(rowNumber))
                                                }
                                                indeterminate={
                                                    selectedValidRows.length > 0 &&
                                                    selectedValidRows.length < validRowNumbers.size
                                                }
                                                disabled={!hasCompleteMapping}
                                                onChange={toggleAllValid}
                                            />
                                        </TableCell>
                                        <TableCell sx={{minWidth: 70}}>Riadok</TableCell>
                                        {preview.headers.map((header, index) => (
                                            <TableCell key={`${header}-${index}`} sx={{minWidth: 190}}>
                                                <Stack spacing={1}>
                                                    <Typography variant="caption" fontWeight={700}>{header}</Typography>
                                                    <TextField
                                                        select
                                                        size="small"
                                                        value={mapping[index] ?? "ignore"}
                                                        onChange={event =>
                                                            handleMappingChange(index, event.target.value as ColumnMeaning)
                                                        }
                                                    >
                                                        {mappingOptions.map(option => (
                                                            <MenuItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                </Stack>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {preview.rows.map(row => {
                                        const valid = validRowNumbers.has(row.rowNumber);
                                        return (
                                            <TableRow key={row.rowNumber} selected={selectedRows.has(row.rowNumber)}>
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={selectedRows.has(row.rowNumber)}
                                                        disabled={!valid}
                                                        onChange={() => toggleRow(row.rowNumber)}
                                                    />
                                                </TableCell>
                                                <TableCell>{row.rowNumber}</TableCell>
                                                {row.values.map((value, index) => (
                                                    <TableCell key={index} sx={{whiteSpace: "nowrap"}}>
                                                        {value}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}

                {result && (
                    <Box>
                        <Alert severity={result.failedRows > 0 ? "warning" : "success"} sx={{mb: 1}}>
                            Vytvorení používatelia: {result.createdUsers}, existujúci používatelia:{" "}
                            {result.existingUsers}, pridaní do kurzu: {result.addedParticipants}, chyby:{" "}
                            {result.failedRows}.
                        </Alert>
                        <TableContainer sx={{border: 1, borderColor: "divider", maxHeight: 220}}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Riadok</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Výsledok</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {result.rows.map(row => (
                                        <TableRow key={`${row.rowNumber}-${row.email}`}>
                                            <TableCell>{row.rowNumber}</TableCell>
                                            <TableCell>{row.email}</TableCell>
                                            <TableCell>{row.message}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={closeDialog}>Zavrieť</Button>
                <Button
                    variant="contained"
                    disabled={
                        !preview ||
                        !hasCompleteMapping ||
                        selectedValidRows.length === 0 ||
                        loadingPreview ||
                        loadingImport
                    }
                    onClick={handleImport}
                >
                    Importovať {selectedValidRows.length > 0 ? `(${selectedValidRows.length})` : ""}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const createAutomaticMapping = (headers: string[]): ColumnMeaning[] => {
    const used = new Set<ColumnMeaning>();

    return headers.map(header => {
        const normalized = normalizeHeader(header);
        let meaning: ColumnMeaning = "ignore";

        if (["email", "emailaddress", "mail", "mailaddress", "emailovaadresa"].includes(normalized)) {
            meaning = "email";
        } else if (["meno", "name", "firstname", "givenname", "krstnemeno"].includes(normalized)) {
            meaning = "firstName";
        } else if (["priezvisko", "surname", "lastname", "familyname"].includes(normalized)) {
            meaning = "lastName";
        }

        if (meaning !== "ignore" && used.has(meaning)) return "ignore";
        used.add(meaning);
        return meaning;
    });
};

const normalizeHeader = (value: string) => value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const getErrorMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<string>;
    return typeof axiosError.response?.data === "string" ? axiosError.response.data : fallback;
};
