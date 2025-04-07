import {
    Box,
    Container,
    Grid,
    TextField,
    Typography,
    InputAdornment,
    MenuItem,
    InputLabel,
    FormControl, Select
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CourseCard from '../components/StudentCourseCard';
import React, {useState} from "react";
import {Course} from "../Types/Course.ts";
import {Period} from "../../Periods/Types/Period.ts";
import EmptyState from "../../../shared/components/EmptyState.tsx";

const yourCourses: Course[] = [
    {
        id: 1,
        name: 'Operating Systems',
        periodName: 'Fall 2024/2025',
        capacity: 30,
        groupChangeDeadline: null,
        enrollmentLimit: null,
        hiddenInList: false,
        autoAcceptStudents: true,
        teacher: 'Pavel Petrovič',
        imageUrl: '/physics.jpg',
    },
    {
        id: 2,
        name: 'Database Systems',
        periodName: 'Fall 2024/2025',
        capacity: 25,
        groupChangeDeadline: null,
        enrollmentLimit: null,
        hiddenInList: false,
        autoAcceptStudents: false,
        teacher: 'Maria Kováč',
        imageUrl: '/math.jpg',
    },
    {
        id: 3,
        name: 'Web Development',
        periodName: 'Summer 2023/2024',
        capacity: 40,
        groupChangeDeadline: null,
        enrollmentLimit: null,
        hiddenInList: false,
        autoAcceptStudents: true,
        teacher: 'Jan Novák',
        imageUrl: '/java.jpg',
    },
];

const otherCourses: Course[] = [
    {
        id: 4,
        name: 'Software Engineering',
        periodName: 'Winter 2024/2025',
        capacity: 50,
        groupChangeDeadline: null,
        enrollmentLimit: null,
        hiddenInList: false,
        autoAcceptStudents: false,
        teacher: 'Jan Novák',
        imageUrl: '/list.png',
    },
    {
        id: 5,
        name: 'Machine Learning',
        periodName: 'Winter 2024/2025',
        capacity: 45,
        groupChangeDeadline: null,
        enrollmentLimit: null,
        hiddenInList: false,
        autoAcceptStudents: true,
        teacher: 'Jan Novák',
        imageUrl: '/MachineLearning.jpg',
    },
    {
        id: 6,
        name: 'Cybersecurity',
        periodName: 'Winter 2024/2025',
        capacity: 35,
        groupChangeDeadline: null,
        enrollmentLimit: null,
        hiddenInList: false,
        autoAcceptStudents: true,
        teacher: 'Jan Novák',
        imageUrl: '/Cybersecurity.jpg',
    },
    {
        id: 7,
        name: 'Mobile Apps',
        periodName: 'Winter 2024/2025',
        capacity: 40,
        groupChangeDeadline: null,
        enrollmentLimit: null,
        hiddenInList: false,
        autoAcceptStudents: false,
        teacher: 'Jan Novák',
        imageUrl: '/java.jpg',
    },
    {
        id: 8,
        name: 'Data Structures',
        periodName: 'Summer 2023/2024',
        capacity: 20,
        groupChangeDeadline: null,
        enrollmentLimit: null,
        hiddenInList: false,
        autoAcceptStudents: false,
        teacher: 'Jan Novák',
        imageUrl: '/math.jpg',
    },
];

const periods: Period[] = [
    { id: 1, name: 'Summer 2023/2024', courseCount: 12 },
    { id: 2, name: 'Fall 2024/2025', courseCount: 15 },
    { id: 3, name: 'Winter 2024/2025', courseCount: 7 },
];

export default function StudentCourses() {
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

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
                course.teacher?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

            return matchesPeriod && matchesSearch;
        });
    };

    const filteredYourCourses = filterCourses(yourCourses);
    const filteredOtherCourses = filterCourses(otherCourses);


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

                <FormControl sx={{ minWidth: 200 }}>
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
            {filteredYourCourses.length > 0 ? (
                <Grid container spacing={3} mb={6}>
                    {filteredYourCourses.map((course) => (
                        <Grid item key={course.id}>
                            <CourseCard {...course} isMine />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <EmptyState
                    message="Nemáš žiadne kurzy."
                    subtext="Pridaj sa k niektorému z dostupných kurzov nižšie."
                />
            )}


            {}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Ostatné kurzy
            </Typography>
            {filteredOtherCourses.length > 0 ? (
                <Grid container spacing={3}>
                    {filteredOtherCourses.map((course) => (
                        <Grid item key={course.id}>
                            <CourseCard {...course} isMine={false} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <EmptyState
                    message="Žiadne ďalšie kurzy nie sú dostupné."
                    subtext="Skús zmeniť filtre alebo sa spýtaj vyučujúceho."
                />
            )}
        </Container>
    );
}