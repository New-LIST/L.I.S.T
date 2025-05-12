import { Container } from "@mui/material";
import AssignmentFormTabs from "../components/AssignmentFormTabs";

const CreateAssignmentPage = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <AssignmentFormTabs />
    </Container>
  );
};

export default CreateAssignmentPage;
