import {
    Box,
    Typography,
} from '@mui/material';
import StatusPieChart from "./components/StatusPieChart.tsx";
import UpcomingDeadlines from "./components/UpcomingDeadlines.tsx";
import ProgressCard from "./components/ProgressCard.tsx";


export default function Overview() {

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Prehľad kurzu
            </Typography>

            <ProgressCard />

            <Box
                display="flex"
                flexDirection={{ xs: 'column', md: 'row' }}
                gap={3}
                mt={3}
            >
                <StatusPieChart />
                <UpcomingDeadlines />
            </Box>


        </Box>
    );
}
