import { Box, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

type Props = {
    message: string;
    subtext?: string;
};

export default function EmptyState({ message, subtext }: Props) {
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height={150}
            width="100%"
            sx={{ opacity: 0.7 }}
        >
            <InfoIcon fontSize="large" sx={{ mb: 1 }} />
            <Typography variant="subtitle1">{message}</Typography>
            {subtext && (
                <Typography variant="body2" color="text.secondary">
                    {subtext}
                </Typography>
            )}
        </Box>
    );
}
