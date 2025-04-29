import AddUserForm from "../components/AddUserForm.tsx";
import ImportUsers from "../components/ImportUsers.tsx"
import {
    Card,
    CardContent,
    Container, IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from "@mui/material";
import api from "../../../services/api.ts";
import {useEffect, useState} from "react";
import {User} from "../types/User.ts";
import DeleteIcon from "@mui/icons-material/Delete";

const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const getUsers = async () => {
        await api.get<User[]>('/users')
            .then(res => {
                setUsers(res.data);
            })
            .catch(e => {
                console.error(e);
            })
            .finally(() => {});
    }
    
    const deleteUser = async (id: number) => {
        console.log(id);
        await api.delete('/users/' + id)
            .then(res => {
                console.log(res);
                getUsers();
            })
            .catch(e => {
                console.error(e);
            })
    }
    
    useEffect(() => {
        getUsers();
    })
    
    return (
        <Container maxWidth="md" sx={{ mt: 5 }}>
            <h4>
                Users
            </h4>
            <Card>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Meno a priezvisko</TableCell>
                                <TableCell>E-mail</TableCell>
                                <TableCell align="right">Akcie</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.fullname}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            onClick={() => {
                                                deleteUser(user.id)
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            <h4>
                Add Users
            </h4>
            <AddUserForm />
            
            <h4>
                Import Users from CSV
            </h4>
            <ImportUsers />
        </Container>
    );
}

export default Users;