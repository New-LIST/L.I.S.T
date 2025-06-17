import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography
} from "@mui/material";

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    courseName: string;
};

export default function ConfirmDuplicateCourseDialog({open,onClose,onConfirm,courseName}: Props) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Duplikovať kurz</DialogTitle>
            <DialogContent>
                <Typography>
                    Naozaj chceš vytvoriť kópiu kurzu <strong>{courseName}</strong>?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Zrušiť</Button>
                <Button onClick={onConfirm} variant="contained" color="primary">
                    Duplikovať
                </Button>
            </DialogActions>
        </Dialog>
    );
}
