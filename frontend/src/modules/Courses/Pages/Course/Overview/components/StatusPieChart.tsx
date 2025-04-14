import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

const statusCounts = {
    graded: 5,
    submitted: 2,
    open: 6,
    late: 3,
    missing: 1,
};

const statusLabels: Record<string, string> = {
    graded: 'Ohodnotené',
    submitted: 'Odovzdané',
    open: 'Otvorené',
    late: 'Odovzdané neskoro',
    missing: 'Neodovzdané',
};

export default function StatusPieChart() {
    const pieData = Object.entries(statusCounts)
        .map(([key, value]) => ({
            name: statusLabels[key],
            value,
        }))
        .filter(item => item.value > 0);

    const getColor = (status: string) => {
        return status === 'graded'
            ? '#4caf50'
            : status === 'submitted'
                ? '#2196f3'
                : status === 'open'
                    ? '#9c27b0'
                    : status === 'late'
                        ? '#ff9800'
                        : '#f44336';
    };

    return (
        <Card sx={{ flex: 1 }}>
            <CardContent>
                <Typography variant="subtitle1" color="primary" fontWeight="medium" gutterBottom>
                    Status tvojich zadaní
                </Typography>

                <Box width="100%" height={300}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={4}
                                dataKey="value"
                                label
                            >
                                {pieData.map((entry) => (
                                    <Cell key={entry.name} fill={getColor(Object.keys(statusLabels).find(key => statusLabels[key] === entry.name) || '')} />
                                ))}
                            </Pie>
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
}
