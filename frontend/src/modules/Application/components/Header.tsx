import {AppBar, Toolbar, Typography, Button, MenuItem, Select} from '@mui/material';
import { logout } from '../../Authentication/utils/auth.ts';
import { getStoredUser } from '../../Authentication/utils/auth.ts';
import i18n from 'i18next'
import { useTranslation } from 'react-i18next';
import {useState} from "react";

export default function Header() {
    const user = getStoredUser();
    const name = user?.fullname || 'Používateľ';
    const role = user?.role || 'Neznáma rola';
    
    const [language, setLanguage] = useState(localStorage.getItem('language') ?? 'sk');
    const { t } = useTranslation();

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>

                <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                    {role} – {name}
                </Typography>
                
                <Select
                    value={language}
                    style={{ color: "#ffffff" }}
                    onChange={(e) => {
                        localStorage.setItem('language', e.target.value);
                        setLanguage(e.target.value);
                        i18n.changeLanguage(e.target.value);
                    }}
                >
                    <MenuItem value="en">
                        English
                    </MenuItem>
                    <MenuItem value="sk">
                        Slovenčina
                    </MenuItem>
                </Select>

                <Button color="inherit" onClick={logout}>
                    {t('Logout')}
                </Button>
            </Toolbar>
        </AppBar>
    );
}