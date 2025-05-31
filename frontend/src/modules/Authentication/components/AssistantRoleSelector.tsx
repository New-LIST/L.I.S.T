
import {
    Dialog,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    Stack
} from '@mui/material';

type Props = {
    open: boolean;
    onSelectStudent: () => void;
    onSelectTeacher: () => void;
};

const AssistantRoleSelector = ({ open, onSelectStudent, onSelectTeacher }: Props) => {
    return (
        <Dialog open={open}>
            <DialogContent sx={{ textAlign: 'center', px: 4, pt: 3, pb: 4 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                    Pokračovať ako:
                </Typography>
                <Stack spacing={2}>
                    <Button variant="contained" size="large" fullWidth onClick={onSelectStudent}>
                        Študent
                    </Button>
                    <Button variant="outlined" size="large" color = "secondary" fullWidth onClick={onSelectTeacher}>
                        Učiteľ
                    </Button>
                </Stack>
            </DialogContent>


            <DialogActions sx={{ display: 'none' }} />
        </Dialog>
    );
};

export default AssistantRoleSelector;
