import {
    Drawer, List, ListItem,ListItemButton, ListItemText, Toolbar
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import { menuConfigByRole } from '../config/menuConfigByRole.tsx';

const drawerWidth = 240;

export default function Sidebar({ mobileOpen, onClose, role }: {
    mobileOpen: boolean,
    onClose: () => void,
    role: string
}) {
    const items = menuConfigByRole[role] || [];

    const drawer = (
        <div>
            <Toolbar />
            <List>
                {items.map(({ label, path }) => (
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
