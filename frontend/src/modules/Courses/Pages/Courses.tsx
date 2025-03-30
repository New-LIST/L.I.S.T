import { useEffect, useState } from 'react';
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
  CircularProgress,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../../services/api';
import { Course } from '../Types/Course';
import { Period } from '../../Periods/Types/Period';
import CourseDialog from '../Components/CourseDialog';
import ConfirmDeleteCourseDialog from '../Components/ConfirmDeleteCourseDialog';
import { useNotification } from '../../../shared/components/NotificationContext';

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [name, setName] = useState('');
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | ''>(''); 

  const [nameError, setNameError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get<Course[]>('/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      showNotification('Nepodarilo sa načítať kurzy.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriods = async () => {
    try {
      const res = await api.get<Period[]>('/periods');
      setPeriods(res.data);
    } catch (err) {
      console.error(err);
      showNotification('Nepodarilo sa načítať obdobia.', 'error');
    }
  };

  useEffect(() => {
    fetchCourses();
    if (openDialog) {
      fetchPeriods(); // ⬅️ načíta sa vždy, keď sa otvorí dialog
    }
  }, [openDialog]);

  const resetForm = () => {
    setName('');
    setSelectedPeriodId(periods[0]?.id ?? 0);
    setNameError(null);
    setOpenDialog(false);
  };

  const handleCreate = async (name: string, periodId: number | '') => {
    const trimmed = name.trim();
    setNameError(null);

    if (!trimmed) {
      setNameError('Názov kurzu nemôže byť prázdny.');
      return;
    }
    if (selectedPeriodId === '') {
      setNameError('Musíš vybrať obdobie');
      return;
    }

    try {
      await api.post('/courses', { name: trimmed, periodId: selectedPeriodId});
      resetForm();
      fetchCourses();
      showNotification('Kurz bol úspešne pridaný.', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Nepodarilo sa pridať kurz.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;
    try {
      await api.delete(`/courses/${courseToDelete.id}`);
      fetchCourses();
      showNotification('Kurz bol vymazaný.', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Nepodarilo sa vymazať kurz.', 'error');
    } finally {
      setCourseToDelete(null);
      setConfirmOpen(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
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
                  <TableCell align="right">Akcie</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>{course.periodName || 'Kurz nie je zaradený k obdobiu'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => {
                          setCourseToDelete(course);
                          setConfirmOpen(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CourseDialog
        open={openDialog}
        onClose={resetForm}
        onCreate={handleCreate}
        name={name}
        setName={setName}
        selectedPeriodId={selectedPeriodId}
        setSelectedPeriodId={setSelectedPeriodId}
        nameError={nameError}
        periods={periods}
      />

      <ConfirmDeleteCourseDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        courseName={courseToDelete?.name ?? ''}
      />
    </Container>
  );
};

export default Courses;
