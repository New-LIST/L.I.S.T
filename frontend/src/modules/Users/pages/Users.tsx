import {
    alpha,
    Box,
    Button,
    Card,
    IconButton,
    InputBase,
    styled,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography
} from "@mui/material";
import api from "../../../services/api.ts";
import {useCallback, useEffect, useState} from "react";
import {User} from "../types/User.ts";
import {AddUserDialog} from "../components/AddUserDialog.tsx";
import {AxiosError, AxiosResponse} from "axios";
import { useNotification } from "../../../shared/components/NotificationContext"
import DeleteIcon from "@mui/icons-material/Delete";
import {PagedResult} from "../../../shared/Interfaces/PagedResult.ts";
import {ImportUsersDialog} from "../components/ImportUsersDialog.tsx";
import SearchIcon from "@mui/icons-material/Search";

const Users = () => {
    const { showNotification } = useNotification();
    
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);
    const [isImportUsersDialogOpen, setImportUsersDialogOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchString, setSearchString] = useState("");
    
    const { users, loading, reload } = getUsers(page, pageSize, searchString);
    
    const AddUser = async (user: User) => {
        await api.post('/users', user)
            .then((response: AxiosResponse<User>) => {
                reload();
                console.log(response);
            })
            .catch((error: AxiosError) => {
                console.error(error);
                showNotification("Nepodarilo sa pridať použivateľ", "error");
            });
    }
    
    const DeleteUser = async (user: User) => {
        await api.delete(`/users/${user.id}`)
            .then(() => {
                showNotification("User deleted successfully", "success");
            })
            .catch((error: AxiosError) => {
                console.error(error);
                showNotification("User was not deleted", "error");
            })
            .finally(() => {
                reload();
            })
    }
    
    return (
        <>
            <Box p={3}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                >
                    <Typography variant="h5">Použivatelia</Typography>
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{ 'aria-label': 'search' }}
                            onChange={(e) => {
                                setSearchString(e.target.value);
                                reload();
                            }}
                        />
                    </Search>
                    <Box display="flex" gap={1}>
                        <Button
                            variant="contained"
                            onClick={() => { setAddDialogOpen(true); }}
                        >
                            Pridať Použivateľ
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => { setImportUsersDialogOpen(true); }}
                        >
                            Import CSV
                        </Button>
                    </Box>
                </Box>
            </Box>
            <TableContainer component={Card}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Názov</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell align="right">Akcie</TableCell>
                        </TableRow>
                    </TableHead>
                    {loading ? (
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={10}>Načítavam...</TableCell>
                            </TableRow>
                        </TableBody>
                    ) : (
                        <TableBody>
                            {users.items.map((user: User) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.fullname}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            onClick={() => { DeleteUser(user) }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    )}
                </Table>
                <TablePagination
                    component="div"
                    count={users.totalCount}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={pageSize}
                    onRowsPerPageChange={(e) => {
                        setPageSize(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </TableContainer>
            <AddUserDialog isOpen={isAddDialogOpen}
                           onClose={()=> {
                               setAddDialogOpen(false);
                               reload();
                           }}
                           onSubmit={AddUser} />
            <ImportUsersDialog isOpen={isImportUsersDialogOpen}
                               onClose={()=> {
                                   setImportUsersDialogOpen(false);
                                   reload();
                               }} />
        </>
    );
}

export default Users;

const getUsers = (page: number, pageSize: number, search: string) => {
    const [users, setUsers] = useState<PagedResult<User>>({ items: [], totalCount: 0 });
    const [loading, setLoading] = useState(false);
    
    const getUsers = useCallback(async () => {
        setLoading(true);
        await api.get<PagedResult<User>>('/users', { params: { page: page, pageSize, search } })
            .then(res => {
                setUsers(res.data);
            })
            .catch(e => {
                console.error(e);
            })
            .finally(() => setLoading(false));
    }, [JSON.stringify({page: page, pageSize, search})]);
    
    useEffect(() => { getUsers(); }, [getUsers]);
    
    return { users, loading, reload: getUsers };
}

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    border: '1px solid #000000',
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));