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
    TableRow, Tooltip,
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
import EditIcon from "@mui/icons-material/Edit";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { AssistantScopeDialog } from "../components/AssistantScopeDialog.tsx";
import {EditUserDialog} from "../components/EditUserDialog.tsx";
import ConfirmDeleteUserDialog from "../components/ConfirmDeleteUserDialog.tsx";

const Users = () => {
    const { showNotification } = useNotification();
    
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);
    const [isImportUsersDialogOpen, setImportUsersDialogOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchString, setSearchString] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [isScopeDialogOpen, setScopeDialogOpen] = useState(false);

    const [debouncedSearch, setDebouncedSearch] = useState(searchString);

    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);



    const [selectedAssistant, setSelectedAssistant] = useState<User | null>(null);

    const { users, loading, reload } = getUsers(page, pageSize, debouncedSearch);

    
    const AddUser = async (user: User) => {
        await api.post('/users', user)
            .then((response: AxiosResponse<User>) => {
                showNotification("Používateľ bol úspešne pridaný", "success");
                reload();

                if (response.data.role === "Assistant") {
                    setSelectedAssistant(response.data);
                    setScopeDialogOpen(true);
                }
                console.log(response);
            })
            .catch((error: AxiosError) => {
                console.error(error);
                showNotification("Nepodarilo sa pridať použivateľa", "error");
            });
    }

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await api.delete(`/users/${userToDelete.id}`);
            showNotification("Použivateľ bol vymazaný", "success");
            reload();
        } catch (error) {
            console.error(error);
            showNotification("Nepodarilo sa vymazať používateľa", "error");
        } finally {
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(searchString);
        }, 250);

        return () => clearTimeout(timeout);
    }, [searchString]);

    
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
                            }}
                        />
                    </Search>
                    <Box display="flex" gap={1}>
                        <Button
                            variant="contained"
                            onClick={() => { setAddDialogOpen(true); }}
                        >
                            Pridať Použivateľa
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
                <Table size = "small">
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
                                        {user.role === "Assistant" && (
                                            <Tooltip title="Nastaviť rozsah asistenta" placement="top">
                                                <IconButton onClick={() => {
                                                    setSelectedAssistant(user);
                                                    setScopeDialogOpen(true);
                                                }}>
                                                    <ManageAccountsIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}

                                        <Tooltip title="Upraviť používateľa" placement="top">
                                            <IconButton onClick={() => {
                                                setSelectedUser(user);
                                                setEditDialogOpen(true);
                                            }}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Vymazať používateľa" placement="top">
                                            <IconButton
                                                onClick={() => {
                                                    setUserToDelete(user);
                                                    setDeleteDialogOpen(true);
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
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
            <EditUserDialog
                isOpen={isEditDialogOpen}
                user={selectedUser}
                onSubmit={async (updatedUser) => {
                    try {
                        await api.put(`/users/${updatedUser.id}`, {
                            fullName: updatedUser.fullname,
                            email: updatedUser.email,
                            role: updatedUser.role
                        });
                        showNotification("Zmeny boli uložené", "success");

                        if (updatedUser.role === "Assistant") {
                            setSelectedAssistant(updatedUser);
                            setScopeDialogOpen(true);
                        }

                        reload();
                    } catch (error) {
                        showNotification("Nepodarilo sa uložiť zmeny", "error");
                    }
                }}

                onClose={() => setEditDialogOpen(false)}
            />

            <AssistantScopeDialog
                open={isScopeDialogOpen}
                user={selectedAssistant}
                onClose={() => {
                    setScopeDialogOpen(false);
                    setSelectedAssistant(null);
                }}
            />

            {userToDelete && (
                <ConfirmDeleteUserDialog
                    open={deleteDialogOpen}
                    onClose={() => {
                        setDeleteDialogOpen(false);
                        setUserToDelete(null);
                    }}
                    onConfirm={handleDeleteUser}
                    userName={userToDelete.fullname}
                />
            )}

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