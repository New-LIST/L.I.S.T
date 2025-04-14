// Sidebar.tsx
import {
    Drawer, List, ListItemButton, ListItemText, Toolbar, IconButton
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import React, { useState, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

const drawerWidth = 240;

export type SidebarItem = {
    label: string;
    path: string;
};

export default function Sidebar({
                                    items,
                                    basePath = '',
                                    onModeChange,
                                }: {
    items: SidebarItem[];
    basePath?: string;
    onModeChange?: (isPermanent: boolean) => void;
}) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const isPermanent = useMediaQuery('(min-width:900px)');

    useEffect(() => {
        onModeChange?.(isPermanent);
    }, [isPermanent]);

    const drawer = (
        <div>
            <Toolbar />
            <List>
                {items.map(({ label, path }) => (
                    <ListItemButton
                        key={path}
                        component={NavLink}
                        to={`${basePath}${path}`}
                        onClick={() => setMobileOpen(false)}
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
            {!isPermanent && !mobileOpen && (
                <IconButton
                    onClick={() => setMobileOpen(true)}
                    sx={{
                        position: 'fixed',
                        top: 72,
                        left: 16,
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        backgroundColor: 'white',
                        boxShadow: 2,
                        display: { md: 'inline-flex', lg: 'none' },
                    }}
                >
                    <MenuIcon />
                </IconButton>
            )}

            <Drawer
                variant={isPermanent ? 'permanent' : 'temporary'}
                open={isPermanent || mobileOpen}
                onClose={() => setMobileOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block' },
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
}
