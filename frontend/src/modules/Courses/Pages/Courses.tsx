import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
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
  CircularProgress,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AssignmentIcon  from "@mui/icons-material/Assignment";
import api from "../../../services/api";
import GroupIcon from '@mui/icons-material/Group';
import { Course } from "../Types/Course";
import { Period } from "../../Periods/Types/Period";
import CreateCourseDialog from "../Components/CreateCourseDialog";
import EditCourseDialog from "../Components/EditCourseDialog";

import ConfirmDeleteCourseDialog from "../Components/ConfirmDeleteCourseDialog";
import { useNotification } from "../../../shared/components/NotificationContext";
import InfoIcon from "@mui/icons-material/Info";

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [name, setName] = useState("");
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | "">("");
  const [nameError, setNameError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [capacity, setCapacity] = useState(0);
  const [groupChangeDeadline, setGroupChangeDeadline] = useState<string | null>(
    null
  );
  const [enrollmentLimit, setEnrollmentLimit] = useState<string | null>(null);
  const [hiddenInList, setHiddenInList] = useState(false);
  const [autoAcceptStudents, setAutoAcceptStudents] = useState(false);
  const [capacityError, setCapacityError] = useState<string | null>(null);
  const [periodError, setPeriodError] = useState<string | null>(null);
  const [enrollmentLimitError, setELimitError] = useState<string | null>(null);
  const [groupChangeError, setGChangeError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get<Course[]>("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      showNotification("Nepodarilo sa načítať kurzy.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriods = async () => {
    try {
      const res = await api.get<Period[]>("/periods");
      setPeriods(res.data);
    } catch (err) {
      console.error(err);
      showNotification("Nepodarilo sa načítať obdobia.", "error");
    }
  };

  useEffect(() => {
    fetchCourses();
    if (openDialog || editDialogOpen) {
      fetchPeriods(); // ⬅️ načíta sa vždy, keď sa otvorí dialog
    }
  }, [openDialog, editDialogOpen]);

  const resetForm = () => {
    setName("");
    setSelectedPeriodId(periods[0]?.id ?? 0);
    setNameError(null);
    setGChangeError(null);
    setCapacityError(null);
    setPeriodError(null);
    setELimitError(null);
    setOpenDialog(false);
    setCapacity(0);
    setGroupChangeDeadline(null);
    setEnrollmentLimit(null);
    setHiddenInList(false);
    setAutoAcceptStudents(false);
    setCapacityError(null);
    setEditDialogOpen(false);
    setCourseToEdit(null);
    setConfirmOpen(false);
    setImageFile(null);
  };

  const handleCreate = async (name: string, periodId: number | "") => {
    const trimmed = name.trim();
    let hasError = false;

    setNameError(null);
    setCapacityError(null);
    setPeriodError(null);
    setGChangeError(null);
    setELimitError(null);

    if (!trimmed) {
      setNameError("Názov kurzu nemôže byť prázdny.");
      hasError = true;
    }

    if (periodId === "") {
      setPeriodError("Musíš vybrať obdobie");
      hasError = true;
    }

    if (capacity <= 0) {
      setCapacityError("Kapacita nemôže byť 0 alebo menej.");
      hasError = true;
    }

    const now = new Date();

    if (groupChangeDeadline && new Date(groupChangeDeadline) < now) {
      setGChangeError("Termín na zmenu skupiny musí byť v budúcnosti.");
      hasError = true;
    }

    if (enrollmentLimit && new Date(enrollmentLimit) < now) {
      setELimitError("Limit prihlásení musí byť v budúcnosti.");
      hasError = true;
    }

    if (hasError) return;

    try {
      const res = await api.post("/courses", {
        name: trimmed,
        periodId: selectedPeriodId,
        capacity,
        groupChangeDeadline: groupChangeDeadline
            ? new Date(groupChangeDeadline).toISOString()
            : null,
        enrollmentLimit: enrollmentLimit
            ? new Date(enrollmentLimit).toISOString()
            : null,
        hiddenInList,
        autoAcceptStudents,
      });

      const createdCourse = res.data;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        await api.post(`/courses/${createdCourse.id}/upload-image`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      resetForm();
      fetchCourses();
      showNotification("Kurz bol úspešne pridaný.", "success");
    } catch (err) {
      console.error(err);
      showNotification("Nepodarilo sa pridať kurz.", "error");
    }
  };

  const handleUpdate = async (id: number, periodId: number | "") => {
    const trimmed = name.trim();
    setNameError(null);
    setCapacityError(null);
    setPeriodError(null);

    let hasError = false;

    if (!trimmed) {
      setNameError("Názov kurzu nemôže byť prázdny.");
      hasError = true;
    }
    if (selectedPeriodId === "") {
      setPeriodError("Musíš vybrať obdobie.");
      hasError = true;
    }
    if (capacity <= 0) {
      setCapacityError("Kapacita nemôže byť 0 alebo menej.");
      hasError = true;
    }

    if (!trimmed) {
      setNameError("Názov kurzu nemôže byť prázdny.");
      hasError = true;
    }

    if (periodId === "") {
      setPeriodError("Musíš vybrať obdobie");
      hasError = true;
    }

    if (capacity <= 0) {
      setCapacityError("Kapacita nemôže byť 0 alebo menej.");
      hasError = true;
    }

    const now = new Date();

    if (groupChangeDeadline && new Date(groupChangeDeadline) < now) {
      setGChangeError("Termín na zmenu skupiny musí byť v budúcnosti.");
      hasError = true;
    }

    if (enrollmentLimit && new Date(enrollmentLimit) < now) {
      setELimitError("Limit prihlásení musí byť v budúcnosti.");
      hasError = true;
    }

    if (hasError) return;

    try {
      await api.put(`/courses/${id}`, {
        name: trimmed,
        periodId: selectedPeriodId,
        capacity,
        groupChangeDeadline: groupChangeDeadline || null,
        enrollmentLimit,
        hiddenInList,
        autoAcceptStudents,
      });

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        await api.post(`/courses/${id}/upload-image`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }


      setEditDialogOpen(false);
      resetForm();
      fetchCourses();
      showNotification("Kurz bol upravený.", "success");
    } catch (err) {
      console.error(err);
      showNotification("Nepodarilo sa upraviť kurz.", "error");
    }
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;
    try {
      await api.delete(`/courses/${courseToDelete.id}`);
      fetchCourses();
      showNotification("Kurz bol vymazaný.", "success");
    } catch (err) {
      console.error(err);
      showNotification("Nepodarilo sa vymazať kurz.", "error");
    } finally {
      setCourseToDelete(null);
      setConfirmOpen(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Kurzy
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpenDialog(true)}
        sx={{ mb: 2 }}
      >
        Pridať kurz
      </Button>

      <Card>
        <CardContent>
          {loading ? (
            <CircularProgress />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Názov kurzu</TableCell>
                  <TableCell>Obdobie</TableCell>
                  <TableCell>Učiteľ</TableCell>
                  <TableCell align="right">Akcie</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>
                      {course.periodName || "Kurz nie je zaradený k obdobiu"}
                    </TableCell>
                    <TableCell>{course.teacherName}</TableCell>
                    <TableCell align="right">
                      <Box>
                        <IconButton
                          onClick={() => {
                            setCourseToEdit(course);
                            setName(course.name);
                            setSelectedPeriodId(
                              periods.find((p) => p.name === course.periodName)
                                ?.id ?? ""
                            );
                            setCapacity(course.capacity);
                            setGroupChangeDeadline(
                              course.groupChangeDeadline
                                ? course.groupChangeDeadline.split("T")[0]
                                : null
                            );
                            setEnrollmentLimit(
                              course.enrollmentLimit
                                ? course.enrollmentLimit.split("T")[0]
                                : null
                            );
                            setHiddenInList(course.hiddenInList);
                            setAutoAcceptStudents(course.autoAcceptStudents);
                            setEditDialogOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                            onClick={() =>
                                navigate(`/dash/courses/${course.id}/description`, {
                                  state: {
                                    courseName: course.name,
                                    periodName: course.periodName,
                                  },
                                })
                            }
                        >
                          <InfoIcon />
                        </IconButton>
                        <IconButton
                            onClick={() =>
                                navigate(`/dash/courses/${course.id}/participants`, {
                                  state: {
                                    courseName: course.name,
                                    periodName: course.periodName,
                                  },
                                })
                            }
                        >
                          <GroupIcon />
                        </IconButton>
                        <IconButton
                            onClick={() =>
                                navigate(`/dash/courses/${course.id}/tasksets`, {
                                  state: {
                                    courseName: course.name,
                                    periodName: course.periodName,
                                  },
                                })
                            }
                        >
                          <AssignmentIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => {
                              setCourseToDelete(course);
                              setConfirmOpen(true);
                            }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateCourseDialog
        open={openDialog}
        onClose={resetForm}
        onCreate={handleCreate}
        name={name}
        setName={setName}
        selectedPeriodId={selectedPeriodId}
        setSelectedPeriodId={setSelectedPeriodId}
        nameError={nameError}
        periods={periods}
        capacity={capacity}
        setCapacity={setCapacity}
        groupChangeDeadline={groupChangeDeadline}
        setGroupChangeDeadline={setGroupChangeDeadline}
        enrollmentLimit={enrollmentLimit}
        setEnrollmentLimit={setEnrollmentLimit}
        hiddenInList={hiddenInList}
        setHiddenInList={setHiddenInList}
        autoAcceptStudents={autoAcceptStudents}
        setAutoAcceptStudents={setAutoAcceptStudents}
        capacityError={capacityError}
        periodError={periodError}
        groupChangeError={groupChangeError}
        enrollmentLimitError={enrollmentLimitError}
        imageFile={imageFile}
        setImageFile={setImageFile}
      />

      <ConfirmDeleteCourseDialog
        open={confirmOpen}
        onClose={resetForm}
        onConfirm={handleDelete}
        courseName={courseToDelete?.name ?? ""}
      />
      {courseToEdit && (
        <EditCourseDialog
          open={editDialogOpen}
          onClose={resetForm}
          onSubmit={() => {
            if (courseToEdit) handleUpdate(courseToEdit.id, selectedPeriodId);
          }}
          name={name}
          setName={setName}
          selectedPeriodId={selectedPeriodId}
          setSelectedPeriodId={setSelectedPeriodId}
          capacity={capacity}
          setCapacity={setCapacity}
          groupChangeDeadline={groupChangeDeadline}
          setGroupChangeDeadline={setGroupChangeDeadline}
          enrollmentLimit={enrollmentLimit}
          setEnrollmentLimit={setEnrollmentLimit}
          hiddenInList={hiddenInList}
          setHiddenInList={setHiddenInList}
          autoAcceptStudents={autoAcceptStudents}
          setAutoAcceptStudents={setAutoAcceptStudents}
          periods={periods}
          nameError={nameError}
          capacityError={capacityError}
          periodError={periodError}
          groupChangeError={groupChangeError}
          enrollmentLimitError={enrollmentLimitError}
          imageFile={imageFile}
          setImageFile={setImageFile}
        />
      )}
    </Container>
  );
};

export default Courses;
