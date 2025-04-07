import {
    Drawer, List, ListItem, ListItemText, Toolbar
} from '@mui/material';
import { NavLink } from 'react-router-dom';

const drawerWidth = 240;

const sidebarItems = [
    { label: 'Kurzy', path: 'courses' },
    { label: 'Obdobia', path: 'periods' },
    { label: 'Kategórie', path: 'categories' },
    { label: 'Používatelia', path: 'users' },
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
                    <ListItem
                        button
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
                    </ListItem>
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
