import {
    Box,
    Container,
    TextField,
    Typography,
    InputAdornment,
    MenuItem,
    InputLabel,
    FormControl, Select
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CourseCard from '../Components/StudentCourseCard';
import React, {useEffect, useState} from "react";
import {Course} from "../Types/Course.ts";
import {Period} from "../../Periods/Types/Period.ts";
import EmptyState from "../../../shared/components/EmptyState.tsx";
import api from "../../../services/api.ts";
import { useNotification } from "../../../shared/components/NotificationContext.tsx";

type MyCourseInfo = {
    courseId: number;
    allowed: boolean;
    groupId?: number | null;
};

export default function StudentCourses() {
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [periods, setPeriods] = useState<Period[]>([]);
    const [loadingPeriods, setLoadingPeriods] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const { showNotification } = useNotification();

    useEffect(() => {
        const fetchPeriods = async () => {
            try {
                const response = await api.get<Period[]>('/Periods');
                setPeriods(response.data);
            } catch (error) {
                console.error("Chyba pri načítaní období:", error);
                showNotification("Nepodarilo sa načítať obdobia.", "error");
            } finally {
                setLoadingPeriods(false);
            }
        };
        fetchPeriods();
    }, []);

    useEffect(() => {
        const fetchCoursesAndOwnership = async () => {
            try {
                const [coursesRes, myCourseIdsRes] = await Promise.all([
                    api.get<Course[]>('/courses/student-visible'),
                    api.get<MyCourseInfo[]>('/participants/mine')
                ]);

                const myCourseInfos = myCourseIdsRes.data;
                const myCourseMap = new Map<number, boolean>();
                myCourseInfos.forEach(p => myCourseMap.set(p.courseId, p.allowed));

                const coursesWithOwnership = coursesRes.data.map(course => ({
                    ...course,
                    isMine: myCourseMap.has(course.id),
                    allowed: myCourseMap.get(course.id),
                }));
                setCourses(coursesWithOwnership);
            } catch (error) {
                console.error("Chyba pri načítaní kurzov alebo participantov", error);
            } finally {
                setLoadingCourses(false);
            }
        };

        fetchCoursesAndOwnership();
    }, []);


    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    const filterCourses = (courses: Course[]) => {
        return courses.filter((course) => {
            const matchesPeriod = selectedPeriod === '' || course.periodName === selectedPeriod;
            const matchesSearch =
                course.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                course.teacherName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

            return matchesPeriod && matchesSearch;
        });
    };

    const filteredYourCourses = filterCourses(courses.filter((c) => c.isMine && c.allowed === true));
    const filteredPendingCourses = filterCourses(courses.filter((c) => c.isMine && c.allowed === false));

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {}
            <Box
                display="flex"
                justifyContent="center"
                alignItems={{ xs: 'stretch', sm: 'center' }}
                gap={2}
                mb={4}
                sx={{
                    flexDirection: { xs: 'column', sm: 'row' },
                }}
            >
                <TextField
                    placeholder="Vyhľadaj kurzy..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    variant="outlined"
                    fullWidth
                    sx={{
                        maxWidth: 600,
                        borderRadius: '50px',
                        backgroundColor: 'white',
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                <FormControl sx={{ minWidth: 200 }} disabled={loadingPeriods}>
                    <InputLabel id="period-select-label">Obdobie</InputLabel>
                    <Select
                        labelId="period-select-label"
                        value={selectedPeriod}
                        label="Obdobie"
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                    >
                        <MenuItem value="">Všetky obdobia</MenuItem>
                        {periods.map((period) => (
                            <MenuItem key={period.id} value={period.name}>
                                {period.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

            </Box>

            {}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Tvoje kurzy
            </Typography>
            {loadingCourses ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <Typography>Nacitavam kurzy...</Typography>
                </Box>
            ) : filteredYourCourses.length > 0 ? (
                <Box display="flex" flexWrap="wrap" gap={3} mb={6}>
                    {filteredYourCourses.map((course) => (
                        <Box key={course.id}>
                            <CourseCard {...course} />
                        </Box>
                    ))}
                </Box>
            ) : filteredPendingCourses.length === 0 ? (
                <EmptyState
                    message="Nemáš žiadne kurzy."
                    subtext="Ak ti kurz chyba, kontaktuj vyucujuceho."
                />
            ) : null}


            {}
            {filteredPendingCourses.length > 0 && (
                <>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Cakajuce ziadosti
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={3}>
                        {filteredPendingCourses.map((course) => (
                            <Box key={course.id}>
                                <CourseCard {...course} />
                            </Box>
                        ))}
                    </Box>
                </>
            )}
        </Container>
    );
}
