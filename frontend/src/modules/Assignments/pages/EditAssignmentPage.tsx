import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, CircularProgress } from "@mui/material";
import AssignmentFormTabs from "../components/AssignmentFormTabs";
import { Assignment } from "../types/Assignment";
import api from "../../../services/api";

const EditAssignmentPage = () => {
  const { id } = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.get<Assignment>(`/assignments/${id}`)
        .then(res => setAssignment(res.data))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!assignment) {
    return <Typography>Neexistujúce alebo nedostupné zadanie.</Typography>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <AssignmentFormTabs assignment={assignment} />
    </Container>
  );
};

export default EditAssignmentPage;
