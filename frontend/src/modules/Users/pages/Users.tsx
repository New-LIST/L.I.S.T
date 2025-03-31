import AddUserForm from "../components/AddUserForm.tsx";
import ImportUsers from "../components/ImportUsers.tsx"
import {Container} from "@mui/material";

const Users = () => {
    return (
        <Container maxWidth="md" sx={{ mt: 5 }}>
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