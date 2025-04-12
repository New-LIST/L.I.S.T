import {
    Drawer, List, ListItem,ListItemButton, ListItemText, Toolbar
} from '@mui/material';
import { NavLink } from 'react-router-dom';

const drawerWidth = 240;

const sidebarItems = [
    { label: 'Kurzy', path: 'dash/courses' },
    { label: 'Obdobia', path: 'dash/periods' },
    { label: 'Kategórie', path: 'dash/categories' },
    { label: 'Používatelia', path: 'dash/users' },
    { label: 'Typy Zostav', path: 'dash/task set types' },
];

export default function Sidebar({
                                    mobileOpen,
                                    onClose,
                                }: {
    mobileOpen: boolean;
    onClose: () => void;
}) {
    const drawer = (
        <div>
            <Toolbar />
            <List>
                {sidebarItems.map(({ label, path }) => (
                    <ListItemButton

                        key={path}
                        component={NavLink}
                        to={`/${path}`}
                        onClick={onClose}
                        sx={{
                            '&.active': {
                                backgroundColor: '#e0e0e0',
                                fontWeight: 'bold',
                            },
                            color: 'inherit',
                            textDecoration: 'none'
                        }}
                    >
                        <ListItemText primary={label} />
                    </ListItemButton>
                ))}
            </List>
        </div>
    );

    return (
        <>
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { width: drawerWidth },
                }}
            >
                {drawer}
            </Drawer>

            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': { width: drawerWidth },
                }}
                open
            >
                {drawer}
            </Drawer>
        </>
    );
}
