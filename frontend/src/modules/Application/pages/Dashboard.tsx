import Categories from '../../Categories/pages/Categories.tsx';
import {Button, Typography} from '@mui/material';
import {getStoredUser, logout} from '../../Authentication/utils/auth.ts';
import Users from "../../Users/pages/Users.tsx";
export default function Dashboard() {
    const user = getStoredUser();
    const role = user?.role;
    const name = user?.fullname;

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                This is your dashboard content

            </Typography>

            <Categories />
        
            <Users />

            <Typography sx={{ mt: 2 }}>
                Tvoje meno: <strong>{name || 'Neznáme'}</strong> <br />
                Tvoja rola: <strong>{role || 'neznáma rola'}</strong>
            </Typography>

            <Button
                variant="outlined"
                color="error"
                onClick={logout}
                sx={{ mt: 4 }}
            >
                Odhlásiť sa
            </Button>
        </div>
    );
}
