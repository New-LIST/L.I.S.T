import { AppBar, Toolbar, IconButton, Typography, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { logout } from '../../Authentication/utils/auth.ts';
import { getStoredUser } from '../../Authentication/utils/auth.ts';

export default function Header({ onMenuClick }) {
    const user = getStoredUser();
    const name = user?.fullname || 'Používateľ';
    const role = user?.role || 'Neznáma rola';

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <IconButton
                    color="inherit"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2, display: { md: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>

                <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                    {role} – {name}
                </Typography>

                <Button color="inherit" onClick={logout}>
                    Odhlásiť sa
                </Button>
            </Toolbar>
        </AppBar>
    );
}