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
    FormGroup,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography
} from "@mui/material";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { User } from "../types/User.ts";
import { AssistantCoursePermission } from "../types/AssistantPermissions.ts";
import { Course } from "../../Courses/Types/Course.ts";
import { useNotification } from "../../../shared/components/NotificationContext.tsx";
import api from "../../../services/api.ts";

type Props = {
    open: boolean;
    user: User | null;
    onClose: () => void;
};

const emptyPermission = (userId: number, courseId: number): AssistantCoursePermission => ({
    userId,
    courseId,
    canViewCourseContent: false,
    canManageCourseContent: false,
    canGradeCourse: false,
    canRunPlagiarismCheck: false
});

const hasAnyPermission = (permission: AssistantCoursePermission) =>
    permission.canViewCourseContent ||
    permission.canManageCourseContent ||
    permission.canGradeCourse ||
    permission.canRunPlagiarismCheck;

const normalizePermission = (permission: AssistantCoursePermission): AssistantCoursePermission =>
    permission.canManageCourseContent
        ? { ...permission, canViewCourseContent: true }
        : permission;

export const AssistantScopeDialog = ({ open, onClose, user }: Props) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [permissions, setPermissions] = useState<AssistantCoursePermission[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<number | "">("");
    const [currentPermission, setCurrentPermission] = useState<AssistantCoursePermission | null>(null);
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();

    useEffect(() => {
        if (!open || !user) return;

        setLoading(true);
        Promise.all([
            api.get<Course[]>("/courses"),
            api.get<AssistantCoursePermission[]>(`/assistant-permissions/${user.id}`)
        ])
            .then(([coursesRes, permissionsRes]) => {
                const loadedPermissions = permissionsRes.data.map(normalizePermission);
                setCourses(coursesRes.data);
                setPermissions(loadedPermissions);

                const firstCourseId = loadedPermissions[0]?.courseId ?? coursesRes.data[0]?.id ?? "";
                setSelectedCourseId(firstCourseId);
            })
            .catch((err) => {
                console.error(err);
                showNotification("Nepodarilo sa načítať práva asistenta.", "error");
                setCourses([]);
                setPermissions([]);
                setSelectedCourseId("");
            })
            .finally(() => setLoading(false));
    }, [open, user, showNotification]);

    useEffect(() => {
        if (!user || selectedCourseId === "") {
            setCurrentPermission(null);
            return;
        }

        const existing = permissions.find((p) => p.courseId === selectedCourseId);
        setCurrentPermission(normalizePermission(existing ?? emptyPermission(user.id, selectedCourseId)));
    }, [permissions, selectedCourseId, user]);

    const selectedCourse = useMemo(
        () => courses.find((course) => course.id === selectedCourseId),
        [courses, selectedCourseId]
    );

    const configuredPermissions = useMemo(
        () => permissions
            .map((permission) => ({
                permission,
                course: courses.find((course) => course.id === permission.courseId)
            }))
            .filter(({ permission }) => hasAnyPermission(permission)),
        [permissions, courses]
    );

    const handleChange =
        (field: keyof Pick<
            AssistantCoursePermission,
            "canViewCourseContent" | "canManageCourseContent" | "canGradeCourse" | "canRunPlagiarismCheck"
        >) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            if (!currentPermission) return;

            const checked = event.target.checked;
            const next = normalizePermission({ ...currentPermission, [field]: checked });

            if (field === "canViewCourseContent" && !checked) {
                next.canManageCourseContent = false;
            }

            setCurrentPermission(next);
        };

    const handleSave = async () => {
        if (!user || !currentPermission) return;

        try {
            const permissionToSave = normalizePermission(currentPermission);

            await api.post("/assistant-permissions", permissionToSave);
            setPermissions((prev) => {
                const withoutCurrent = prev.filter((p) => p.courseId !== permissionToSave.courseId);
                return hasAnyPermission(permissionToSave)
                    ? [...withoutCurrent, permissionToSave]
                    : withoutCurrent;
            });
            showNotification("Práva asistenta boli uložené.", "success");
        } catch (err) {
            console.error(err);
            showNotification("Nepodarilo sa uložiť práva asistenta.", "error");
        }
    };

    return (
        <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
            <DialogTitle>Nastavenie práv asistenta</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography>
                    Asistent: <b>{user?.fullname}</b>
                </Typography>

                <Alert severity="info">
                    Práva sa nastavujú samostatne pre každý kurz.
                </Alert>

                <FormControl fullWidth size="small" disabled={loading || courses.length === 0}>
                    <InputLabel id="assistant-course-label">Kurz</InputLabel>
                    <Select
                        labelId="assistant-course-label"
                        label="Kurz"
                        value={selectedCourseId}
                        onChange={(event) => setSelectedCourseId(Number(event.target.value))}
                    >
                        {courses.map((course) => (
                            <MenuItem key={course.id} value={course.id}>
                                {course.name} {course.periodName ? `(${course.periodName})` : ""}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {currentPermission && (
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Práva pre kurz {selectedCourse?.name ?? ""}
                        </Typography>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={currentPermission.canViewCourseContent}
                                        onChange={handleChange("canViewCourseContent")}
                                    />
                                }
                                label="Prezeranie úloh a zadaní kurzu"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={currentPermission.canManageCourseContent}
                                        onChange={handleChange("canManageCourseContent")}
                                    />
                                }
                                label="Vytváranie a úprava úloh, zadaní a kategórií"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={currentPermission.canGradeCourse}
                                        onChange={handleChange("canGradeCourse")}
                                    />
                                }
                                label="Hodnotenie riešení a tabuľky hodnotení"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={currentPermission.canRunPlagiarismCheck}
                                        onChange={handleChange("canRunPlagiarismCheck")}
                                    />
                                }
                                label="Spustenie kontroly opisovania"
                            />
                        </FormGroup>
                    </Box>
                )}

                <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Kurzy s nastavenými právami
                    </Typography>
                    {configuredPermissions.length === 0 ? (
                        <Typography color="text.secondary">Zatiaľ nie sú nastavené žiadne práva.</Typography>
                    ) : (
                        <Stack spacing={0.75}>
                            {configuredPermissions.map(({ permission, course }) => (
                                <Typography key={permission.courseId} variant="body2">
                                    <b>{course?.name ?? `Kurz ${permission.courseId}`}</b>
                                    {course?.periodName ? ` (${course.periodName})` : ""}:{" "}
                                    {[
                                        permission.canViewCourseContent && "prezeranie",
                                        permission.canManageCourseContent && "úprava",
                                        permission.canGradeCourse && "hodnotenie",
                                        permission.canRunPlagiarismCheck && "opisovanie"
                                    ]
                                        .filter(Boolean)
                                        .join(", ")}
                                </Typography>
                            ))}
                        </Stack>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Zavrieť</Button>
                <Button onClick={handleSave} variant="contained" disabled={!currentPermission}>
                    Uložiť
                </Button>
            </DialogActions>
        </Dialog>
    );
};
